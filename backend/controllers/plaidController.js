const plaid = require('plaid');
require('dotenv').config();

const { Configuration, PlaidApi, PlaidEnvironments } = plaid;

const config = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV], // 'sandbox' or 'development' or 'production'
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(config);

// 1. Create Plaid Link Token
exports.createLinkToken = async (req, res) => {
  try {
    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: req.body.userId,
      },
      client_name: 'Subscription Tracker',
      products: ['transactions'],
      country_codes: ['US'],
      language: 'en',
      // redirect_uri: '', // Only needed in production with OAuth
    });

    res.json({ link_token: response.data.link_token });
  } catch (err) {
    console.error('Error creating link token:', err.response?.data || err.message);
    res.status(500).json({ error: 'Unable to create link token' });
    console.log("Plaid ENV Vars:", process.env.PLAID_CLIENT_ID, process.env.PLAID_SECRET, process.env.PLAID_ENV);
  }
};

// 2. Exchange Public Token for Access Token
exports.exchangePublicToken = async (req, res) => {
  try {
    const { public_token } = req.body;

    const response = await plaidClient.itemPublicTokenExchange({ public_token });
    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;

    // Save accessToken securely associated with the user (e.g., in DB)
    // For now just return it (not recommended for production)
    res.json({ access_token: accessToken, item_id: itemId });
  } catch (err) {
    console.error('Error exchanging public token:', err.response?.data || err.message);
    res.status(500).json({ error: 'Unable to exchange public token' });
  }
};

// 3. Fetch Transactions (optional utility)
exports.getTransactions = async (req, res) => {
  try {
    const { accessToken } = req.body;
    const now = new Date();
    const startDate = new Date(now);
    startDate.setMonth(startDate.getMonth() - 3); // last 3 months

    const response = await plaidClient.transactionsGet({
      access_token: accessToken,
      start_date: startDate.toISOString().split('T')[0],
      end_date: now.toISOString().split('T')[0],
      options: {
        count: 100,
        offset: 0,
      },
    });

    res.json(response.data.transactions);
  } catch (err) {
    console.error('Error fetching transactions:', err.response?.data || err.message);
    res.status(500).json({ error: 'Unable to fetch transactions' });
  }
};
