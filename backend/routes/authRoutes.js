const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeEmail(value) {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase();
}

function normalizeUsername(value) {
  if (typeof value !== 'string') return '';
  return value.trim();
}

function isBcryptHash(value) {
  return typeof value === 'string' && /^\$2[aby]\$/.test(value);
}

// ✅ Get All Registered Users
router.get('/all-users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    const normalizedUsername = normalizeUsername(username);
    if (!normalizedUsername) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (typeof password !== 'string' || !password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const emailRegex = new RegExp(`^${escapeRegex(normalizedEmail)}$`, 'i');
    const usernameRegex = new RegExp(`^${escapeRegex(normalizedUsername)}$`, 'i');

    const existing = await User.findOne({ email: emailRegex });
    if (existing) return res.status(400).json({ error: 'User already exists' });

    const existingUsername = await User.findOne({ username: usernameRegex });
    if (existingUsername) return res.status(400).json({ error: 'Username is already taken' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ email: normalizedEmail, username: normalizedUsername, password: hashedPassword });
    await newUser.save();

    // res.status(201).json({ userId: newUser._id });
    
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.status(201).json({
      token,
      userId: newUser._id,
      email: newUser.email,
      username: newUser.username
    });

  } catch (err) {
    if (err && typeof err === 'object' && 'code' in err && err.code === 11000) {
      return res.status(400).json({ error: 'User already exists' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, username, identifier, password } = req.body;
  try {
    const rawIdentifier = (identifier ?? email ?? username ?? '').toString().trim();
    if (!rawIdentifier) return res.status(400).json({ error: 'Email or username is required' });

    if (typeof password !== 'string' || !password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const identifierRegex = new RegExp(`^${escapeRegex(rawIdentifier)}$`, 'i');
    const user = await User.findOne({ $or: [{ email: identifierRegex }, { username: identifierRegex }] });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    let isMatch = false;
    if (isBcryptHash(user.password)) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = user.password === password;
      if (isMatch) {
        user.password = await bcrypt.hash(password, 10);
        await user.save();
      }
    }
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '2h' });
    const fallbackUsername = typeof user.email === 'string' ? user.email.split('@')[0] : '';
    res.json({ token, userId: user._id, email: user.email, username: user.username || fallbackUsername });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
