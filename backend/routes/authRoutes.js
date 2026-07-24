const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { db, supabase } = require('../db');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

// Register endpoint with bcrypt password protection (Real User Data Only)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existingUser = db.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    // Encrypt password using bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = {
      id: `u-${uuidv4().slice(0, 6)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      bio: '',
      passwordHash,
      trustScore: 100,
      verified: true,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name.trim())}`,
      createdAt: new Date().toISOString()
    };

    db.addUser(newUser);

    // Sync to Supabase auth/table if configured
    if (supabase) {
      try {
        await supabase.from('users').insert([
          { id: newUser.id, name: newUser.name, email: newUser.email, phone: newUser.phone, trust_score: 100 }
        ]);
      } catch (sbErr) {
        console.warn("Supabase user sync notice:", sbErr.message);
      }
    }

    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { passwordHash: _, ...safeUser } = newUser;
    return res.status(201).json({
      message: 'Account registered successfully',
      user: safeUser,
      token
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login endpoint with bcrypt password verification
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash).catch(() => false);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { passwordHash: _, ...safeUser } = user;
    return res.json({
      message: 'Logged in successfully',
      user: safeUser,
      token
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: 'Server error during login' });
  }
});

// Current User Profile
router.get('/me', authenticateToken, (req, res) => {
  const user = db.getUsers().find(u => u.id === req.user.id);
  if (!user) {
    return res.json({ user: req.user });
  }
  const { passwordHash: _, ...safeUser } = user;
  return res.json({ user: safeUser });
});

module.exports = router;
