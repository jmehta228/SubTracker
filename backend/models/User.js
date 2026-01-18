const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  // Plaid integration fields
  plaidAccessToken: { type: String, select: false }, // Hidden by default for security
  plaidItemId: { type: String },
  plaidLinkedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
