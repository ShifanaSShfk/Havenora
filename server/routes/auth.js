// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const router = express.Router();

// Get pool from parent module
const pool = require('../index').pool;

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role = 'buyer' } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password, phone, role, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id, name, email, phone, role, created_at',
      [name, email, hashedPassword, phone, role]
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.rows[0].id, email: newUser.rows[0].email, role: newUser.rows[0].role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: newUser.rows[0]
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update last login
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.rows[0].id]);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.rows[0].id, email: user.rows[0].email, role: user.rows[0].role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: userPassword, ...userWithoutPassword } = user.rows[0];

    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Verify token and get user info
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await pool.query(
      'SELECT id, name, email, phone, role, created_at, last_login FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: user.rows[0] });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    console.error('Token verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout (client-side token removal, but we can log it)
router.post('/logout', (req, res) => {
  // In a stateless JWT system, logout is typically handled client-side
  // But we can log the action or add token to blacklist if needed
  res.json({ message: 'Logout successful' });
});

// Password reset request
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      // Don't reveal if email exists or not for security
      return res.json({ message: 'If email exists, reset link has been sent' });
    }

    // Generate reset token (in production, use crypto.randomBytes)
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const resetExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Store reset token
    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3',
      [resetToken, resetExpiry, email]
    );

    // In production, send email with reset link
    // For now, just return success
    res.json({ message: 'If email exists, reset link has been sent' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    // Find user with valid reset token
    const user = await pool.query(
      'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()',
      [token]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await pool.query(
      'UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
      [hashedPassword, user.rows[0].id]
    );

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;