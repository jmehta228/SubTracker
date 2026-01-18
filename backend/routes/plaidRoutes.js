const router = require('express').Router();
const plaid = require('plaid');
const { Configuration, PlaidApi, PlaidEnvironments } = plaid;
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// Plaid client configuration
const config = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});
const plaidClient = new PlaidApi(config);

// Create Link Token - initiates Plaid Link flow
router.post('/link-token', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: String(userId) },
      client_name: 'SubTracker',
      products: ['transactions'],
      country_codes: ['US'],
      language: 'en',
    });

    res.json({ link_token: response.data.link_token });
  } catch (err) {
    console.error('Link token error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      error: 'Failed to create link token',
      details: err.response?.data
    });
  }
});

// Exchange Public Token - called after user completes Plaid Link
router.post('/exchange-token', authMiddleware, async (req, res) => {
  try {
    const { public_token } = req.body;
    const userId = req.user.id;

    if (!public_token) {
      return res.status(400).json({ error: 'public_token is required' });
    }

    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token
    });

    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    // Save access token to user (securely stored in DB)
    await User.findByIdAndUpdate(userId, {
      plaidAccessToken: accessToken,
      plaidItemId: itemId,
      plaidLinkedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Bank account linked successfully',
      item_id: itemId
    });
  } catch (err) {
    console.error('Exchange token error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      error: 'Failed to exchange token',
      details: err.response?.data
    });
  }
});

// Get Transactions - fetch recent transactions
router.get('/transactions', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user with access token
    const user = await User.findById(userId).select('+plaidAccessToken');

    if (!user?.plaidAccessToken) {
      return res.status(400).json({
        error: 'No bank account linked',
        needsLink: true
      });
    }

    // Get transactions from last 90 days
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];

    const response = await plaidClient.transactionsGet({
      access_token: user.plaidAccessToken,
      start_date: startDate,
      end_date: endDate,
      options: {
        count: 500,
        offset: 0
      }
    });

    res.json({
      transactions: response.data.transactions,
      accounts: response.data.accounts,
      total: response.data.total_transactions
    });
  } catch (err) {
    console.error('Transactions error:', err.response?.data || err.message);

    // Handle invalid access token
    if (err.response?.data?.error_code === 'ITEM_LOGIN_REQUIRED') {
      return res.status(401).json({
        error: 'Bank connection expired',
        needsRelink: true
      });
    }

    res.status(err.response?.status || 500).json({
      error: 'Failed to fetch transactions',
      details: err.response?.data
    });
  }
});

// Detect Recurring Transactions - identify subscriptions from transactions
router.get('/recurring', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('+plaidAccessToken');

    if (!user?.plaidAccessToken) {
      return res.status(400).json({
        error: 'No bank account linked',
        needsLink: true
      });
    }

    // Get transactions from last 90 days for analysis
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];

    const response = await plaidClient.transactionsGet({
      access_token: user.plaidAccessToken,
      start_date: startDate,
      end_date: endDate,
      options: { count: 500, offset: 0 }
    });

    const transactions = response.data.transactions;

    // Detect recurring transactions
    const recurring = detectRecurringTransactions(transactions);

    res.json({
      recurring,
      analyzed: transactions.length
    });
  } catch (err) {
    console.error('Recurring detection error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      error: 'Failed to detect recurring transactions',
      details: err.response?.data
    });
  }
});

// Check if bank is linked
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    res.json({
      isLinked: !!user?.plaidItemId,
      linkedAt: user?.plaidLinkedAt || null
    });
  } catch (err) {
    console.error('Status check error:', err.message);
    res.status(500).json({ error: 'Failed to check status' });
  }
});

// Unlink bank account
router.delete('/unlink', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('+plaidAccessToken');

    if (user?.plaidAccessToken) {
      // Remove item from Plaid
      try {
        await plaidClient.itemRemove({
          access_token: user.plaidAccessToken
        });
      } catch (plaidErr) {
        console.error('Plaid item remove error:', plaidErr.message);
        // Continue anyway to clean up local data
      }
    }

    // Clear Plaid data from user
    await User.findByIdAndUpdate(userId, {
      $unset: {
        plaidAccessToken: 1,
        plaidItemId: 1,
        plaidLinkedAt: 1
      }
    });

    res.json({ success: true, message: 'Bank account unlinked' });
  } catch (err) {
    console.error('Unlink error:', err.message);
    res.status(500).json({ error: 'Failed to unlink bank account' });
  }
});

// Helper function to detect recurring transactions
function detectRecurringTransactions(transactions) {
  const merchantGroups = {};

  // Group transactions by merchant
  transactions.forEach(tx => {
    if (tx.amount <= 0) return; // Skip credits/refunds

    const key = tx.merchant_name || tx.name;
    if (!key) return;

    if (!merchantGroups[key]) {
      merchantGroups[key] = [];
    }
    merchantGroups[key].push({
      amount: tx.amount,
      date: tx.date,
      category: tx.category?.[0] || 'Other'
    });
  });

  const recurring = [];

  // Analyze each merchant for recurring patterns
  Object.entries(merchantGroups).forEach(([merchant, txList]) => {
    if (txList.length < 2) return; // Need at least 2 transactions

    // Check if amounts are consistent (within 10% variance)
    const amounts = txList.map(t => t.amount);
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const isConsistent = amounts.every(a => Math.abs(a - avgAmount) / avgAmount < 0.1);

    if (!isConsistent) return;

    // Check for monthly pattern (25-35 days apart)
    const dates = txList.map(t => new Date(t.date)).sort((a, b) => a - b);
    let isMonthly = false;
    let isYearly = false;

    if (dates.length >= 2) {
      const intervals = [];
      for (let i = 1; i < dates.length; i++) {
        const daysDiff = (dates[i] - dates[i-1]) / (1000 * 60 * 60 * 24);
        intervals.push(daysDiff);
      }

      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      isMonthly = avgInterval >= 25 && avgInterval <= 35;
      isYearly = avgInterval >= 350 && avgInterval <= 380;
    }

    if (isMonthly || isYearly) {
      recurring.push({
        name: merchant,
        amount: Math.round(avgAmount * 100) / 100,
        frequency: isYearly ? 'yearly' : 'monthly',
        category: txList[0].category,
        lastCharge: dates[dates.length - 1].toISOString().split('T')[0],
        occurrences: txList.length
      });
    }
  });

  // Sort by amount descending
  return recurring.sort((a, b) => b.amount - a.amount);
}

module.exports = router;
