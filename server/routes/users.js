// routes/users.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const router = express.Router();

// Get pool from parent module
const pool = require('../index').pool;

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await pool.query(
      'SELECT id, name, email, phone, role, avatar, bio, location, created_at, last_login FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: user.rows[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, bio, location, avatar } = req.body;

    const updatedUser = await pool.query(`
      UPDATE users SET 
        name = COALESCE($1, name),
        phone = COALESCE($2, phone),
        bio = COALESCE($3, bio),
        location = COALESCE($4, location),
        avatar = COALESCE($5, avatar),
        updated_at = NOW()
      WHERE id = $6
      RETURNING id, name, email, phone, role, avatar, bio, location, created_at, updated_at
    `, [name, phone, bio, location, avatar, req.user.userId]);

    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser.rows[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// Change password
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    // Get current user with password
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.userId]);
    
    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.rows[0].password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
      [hashedNewPassword, req.user.userId]
    );

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error changing password' });
  }
});

// Get all agents (public endpoint)
router.get('/agents', async (req, res) => {
  try {
    const { page = 1, limit = 10, location } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT u.id, u.name, u.email, u.phone, u.avatar, u.bio, u.location, u.created_at,
             COUNT(p.id) as total_properties
      FROM users u
      LEFT JOIN properties p ON u.id = p.agent_id AND p.status = 'active'
      WHERE u.role = 'agent'
    `;
    
    const queryParams = [];
    let paramCount = 0;

    if (location) {
      paramCount++;
      query += ` AND u.location ILIKE $${paramCount}`;
      queryParams.push(`%${location}%`);
    }

    query += ` GROUP BY u.id, u.name, u.email, u.phone, u.avatar, u.bio, u.location, u.created_at`;
    query += ` ORDER BY total_properties DESC, u.created_at DESC`;
    
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    queryParams.push(limit);

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    queryParams.push(offset);

    const agents = await pool.query(query, queryParams);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM users WHERE role = \'agent\'';
    const countParams = [];

    if (location) {
      countQuery += ' AND location ILIKE $1';
      countParams.push(`%${location}%`);
    }

    const totalCount = await pool.query(countQuery, countParams);
    const total = parseInt(totalCount.rows[0].count);

    res.json({
      agents: agents.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalAgents: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({ message: 'Server error fetching agents' });
  }
});

// Get single agent profile (public)
router.get('/agents/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const agent = await pool.query(`
      SELECT u.id, u.name, u.email, u.phone, u.avatar, u.bio, u.location, u.created_at,
             COUNT(p.id) as total_properties,
             COUNT(CASE WHEN p.status = 'active' THEN 1 END) as active_properties
      FROM users u
      LEFT JOIN properties p ON u.id = p.agent_id
      WHERE u.id = $1 AND u.role = 'agent'
      GROUP BY u.id, u.name, u.email, u.phone, u.avatar, u.bio, u.location, u.created_at
    `, [id]);

    if (agent.rows.length === 0) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Get agent's recent properties
    const recentProperties = await pool.query(`
      SELECT id, title, price, type, location, images, created_at
      FROM properties 
      WHERE agent_id = $1 AND status = 'active'
      ORDER BY created_at DESC
      LIMIT 5
    `, [id]);

    res.json({
      agent: {
        ...agent.rows[0],
        recentProperties: recentProperties.rows
      }
    });
  } catch (error) {
    console.error('Get agent profile error:', error);
    res.status(500).json({ message: 'Server error fetching agent profile' });
  }
});

// Delete user account
router.delete('/account', authenticateToken, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required to delete account' });
    }

    // Get current user with password
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.userId]);
    
    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    // Delete user (this will cascade delete related data if FK constraints are set up properly)
    await pool.query('DELETE FROM users WHERE id = $1', [req.user.userId]);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Server error deleting account' });
  }
});

// Get user dashboard stats (authenticated users)
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    let stats = {};

    if (req.user.role === 'agent') {
      // Agent dashboard stats
      const propertyStats = await pool.query(`
        SELECT 
          COUNT(*) as total_properties,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_properties,
          COUNT(CASE WHEN status = 'sold' THEN 1 END) as sold_properties,
          SUM(views) as total_views
        FROM properties 
        WHERE agent_id = $1
      `, [req.user.userId]);

      const recentInquiries = await pool.query(`
        SELECT c.*, p.title as property_title
        FROM contacts c
        LEFT JOIN properties p ON c.property_id = p.id
        WHERE p.agent_id = $1
        ORDER BY c.created_at DESC
        LIMIT 5
      `, [req.user.userId]);

      stats = {
        ...propertyStats.rows[0],
        recentInquiries: recentInquiries.rows
      };
    } else {
      // Buyer dashboard stats
      const favoriteCount = await pool.query(
        'SELECT COUNT(*) as favorite_count FROM favorites WHERE user_id = $1',
        [req.user.userId]
      );

      const recentViewed = await pool.query(`
        SELECT p.*, u.name as agent_name
        FROM properties p
        LEFT JOIN users u ON p.agent_id = u.id
        WHERE p.id IN (
          SELECT DISTINCT property_id 
          FROM user_views 
          WHERE user_id = $1 
          ORDER BY viewed_at DESC 
          LIMIT 5
        )
      `, [req.user.userId]);

      stats = {
        favoriteCount: favoriteCount.rows[0].favorite_count,
        recentViewed: recentViewed.rows
      };
    }

    res.json({ stats });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error fetching dashboard stats' });
  }
});

// Update user avatar
router.put('/avatar', authenticateToken, async (req, res) => {
  try {
    const { avatar } = req.body;

    if (!avatar) {
      return res.status(400).json({ message: 'Avatar URL is required' });
    }

    const updatedUser = await pool.query(`
      UPDATE users SET avatar = $1, updated_at = NOW() 
      WHERE id = $2 
      RETURNING id, name, email, avatar
    `, [avatar, req.user.userId]);

    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Avatar updated successfully',
      user: updatedUser.rows[0]
    });
  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({ message: 'Server error updating avatar' });
  }
});

// Get user activity log
router.get('/activity', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // This would require an activity_logs table - for now return empty
    // In a real app, you'd log user activities like property views, favorites, etc.
    const activities = await pool.query(`
      SELECT 'property_view' as type, 'Viewed property' as description, NOW() as created_at
      WHERE FALSE
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    res.json({
      activities: activities.rows,
      pagination: {
        currentPage: parseInt(page),
        hasNext: false,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ message: 'Server error fetching activity' });
  }
});

module.exports = router;