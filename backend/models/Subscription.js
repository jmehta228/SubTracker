// models/Subscription.js
const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: String,
  amount: Number,
  frequency: String,
  dueDate: Date,
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
