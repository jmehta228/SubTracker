const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const Subscription = require('../models/Subscription');
const authMiddleware = require('../middleware/auth'); // new

// ✅ PUT the debug route FIRST
router.get('/all/raw', async (req, res) => {
  // console.log('GET /all/raw hit');
  try {
    const allSubs = await Subscription.find({});
    res.json(allSubs);
  } catch (err) {
    console.error('Mongo error:', err);
    res.status(500).json({ error: 'Could not fetch subscriptions' });
  }
});

router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ userId: req.params.userId });
    res.json(subscriptions);
  } catch (err) {
    console.error('Error fetching subscriptions:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add new subscription for a user
router.post('/:userId', authMiddleware, async (req, res) => {
  const { userId } = req.params;
  const { name, amount, frequency, dueDate } = req.body;

  try {
    const newSub = new Subscription({
      userId,
      name,
      amount,
      frequency,
      dueDate,
    });
    await newSub.save();
    res.status(201).json(newSub);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});


// Main subscription routes (after)
// router.get('/:userId', authMiddleware, subscriptionController.getAllSubscriptions);
router.post('/', authMiddleware, subscriptionController.createSubscription);
router.put('/:id', authMiddleware, subscriptionController.updateSubscription);
router.delete('/:id', authMiddleware, subscriptionController.deleteSubscription);

module.exports = router;
