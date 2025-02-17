// server/routes/authRoutes.js
const express = require('express');
const passport = require('passport');
const router = express.Router();

// --- Existing Local Auth Routes ---
// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ message: info?.message || 'Login failed' });
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.json({ _id: user._id, username: user.username });
    });
  })(req, res, next);
});

// Registration
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }
  try {
    const db = req.app.get('db');
    const existing = await db.collection('users').findOne({ username });
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const result = await db.collection('users').insertOne({ username, password });
    return res.json({ success: true, userId: result.insertedId });
  } catch (error) {
    return res.status(500).json({ message: 'Error registering user', error });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.json({ message: 'Logged out successfully' });
  });
});

// Check authentication status
router.get('/checkauth', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ authenticated: true, user: req.user });
  } else {
    res.json({ authenticated: false });
  }
});

// --- New GitHub Auth Routes ---

// Initiate GitHub Authentication
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// GitHub Callback URL
router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect as desired.
    res.redirect('/todos');
  }
);

module.exports = router;
