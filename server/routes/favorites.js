// routes/favorites.js
const express = require('express');
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

// Get user's favorite properties
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const favorites = await pool.query(`
      SELECT 
        f.id as favorite_id,
        f.created_at as favorited_at,
        p.*,
        u.name as agent_name,
        u.phone as agent_phone,
        u.email as agent_email
      FROM favorites f
      JOIN properties p ON f.property_id = p.id
      LEFT JOIN users u ON p.agent_id = u.id
      WHERE f.user_id = $1
      ORDER BY f.created_at DESC
      LIMIT $2 OFFSET $3
    `, [req.user.userId, limit, offset]);

    // Get total count
    const totalCount = await pool.query(
      'SELECT COUNT(*) FROM favorites WHERE user_id = $1',
      [req.user.userId]
    );
    const total = parseInt(totalCount.rows[0].count);

    res.json({
      favorites: favorites.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalFavorites: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ message: 'Server error fetching favorites' });
  }
});

// Add property to favorites
router.post('/:propertyId', authenticateToken, async (req, res) => {
  try {
    const { propertyId } = req.params;

    // Check if property exists
    const property = await pool.query('SELECT * FROM properties WHERE id = $1', [propertyId]);
    if (property.rows.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if already favorited
    const existingFavorite = await pool.query(
      'SELECT * FROM favorites WHERE user_id = $1 AND property_id = $2',
      [req.user.userId, propertyId]
    );

    if (existingFavorite.rows.length > 0) {
      return res.status(400).json({ message: 'Property already in favorites' });
    }

    // Add to favorites
    const newFavorite = await pool.query(
      'INSERT INTO favorites (user_id, property_id, created_at) VALUES ($1, $2, NOW()) RETURNING *',
      [req.user.userId, propertyId]
    );

    // Get property details for response
    const favoriteWithProperty = await pool.query(`
      SELECT 
        f.id as favorite_id,
        f.created_at as favorited_at,
        p.*,
        u.name as agent_name,
        u.phone as agent_phone,
        u.email as agent_email
      FROM favorites f
      JOIN properties p ON f.property_id = p.id
      LEFT JOIN users u ON p.agent_id = u.id
      WHERE f.id = $1
    `, [newFavorite.rows[0].id]);

    res.status(201).json({
      message: 'Property added to favorites',
      favorite: favoriteWithProperty.rows[0]
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ message: 'Server error adding to favorites' });
  }
});

// Remove property from favorites
router.delete('/:propertyId', authenticateToken, async (req, res) => {
  try {
    const { propertyId } = req.params;

    const result = await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 AND property_id = $2 RETURNING *',
      [req.user.userId, propertyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    res.json({ message: 'Property removed from favorites' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ message: 'Server error removing from favorites' });
  }
});

// Check if property is favorited by user
router.get('/check/:propertyId', authenticateToken, async (req, res) => {
  try {
    const { propertyId } = req.params;

    const favorite = await pool.query(
      'SELECT * FROM favorites WHERE user_id = $1 AND property_id = $2',
      [req.user.userId, propertyId]
    );

    res.json({
      isFavorited: favorite.rows.length > 0,
      favoriteId: favorite.rows.length > 0 ? favorite.rows[0].id : null
    });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({ message: 'Server error checking favorite status' });
  }
});

// Get favorite properties by IDs (for bulk operations)
router.post('/bulk-check', authenticateToken, async (req, res) => {
  try {
    const { propertyIds } = req.body;

    if (!Array.isArray(propertyIds) || propertyIds.length === 0) {
      return res.status(400).json({ message: 'Property IDs array is required' });
    }

    // Limit to prevent abuse
    if (propertyIds.length > 100) {
      return res.status(400).json({ message: 'Maximum 100 property IDs allowed' });
    }

    const favorites = await pool.query(
      'SELECT property_id FROM favorites WHERE user_id = $1 AND property_id = ANY($2)',
      [req.user.userId, propertyIds]
    );

    const favoritedIds = favorites.rows.map(row => row.property_id);

    res.json({
      favoritedProperties: favoritedIds,
      results: propertyIds.map(id => ({
        propertyId: id,
        isFavorited: favoritedIds.includes(parseInt(id))
      }))
    });
  } catch (error) {
    console.error('Bulk check favorites error:', error);
    res.status(500).json({ message: 'Server error checking favorites' });
  }
});

// Get favorite statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_favorites,
        COUNT(CASE WHEN p.type = 'house' THEN 1 END) as house_favorites,
        COUNT(CASE WHEN p.type = 'apartment' THEN 1 END) as apartment_favorites,
        COUNT(CASE WHEN p.type = 'condo' THEN 1 END) as condo_favorites,
        COUNT(CASE WHEN p.type = 'land' THEN 1 END) as land_favorites,
        AVG(p.price) as avg_price_favorited,
        MIN(p.price) as min_price_favorited,
        MAX(p.price) as max_price_favorited
      FROM favorites f
      JOIN properties p ON f.property_id = p.id
      WHERE f.user_id = $1
    `, [req.user.userId]);

    // Get most favorited locations
    const topLocations = await pool.query(`
      SELECT p.location, COUNT(*) as count
      FROM favorites f
      JOIN properties p ON f.property_id = p.id
      WHERE f.user_id = $1
      GROUP BY p.location
      ORDER BY count DESC
      LIMIT 5
    `, [req.user.userId]);

    // Get recent favorites
    const recentFavorites = await pool.query(`
      SELECT p.title, p.price, p.location, f.created_at
      FROM favorites f
      JOIN properties p ON f.property_id = p.id
      WHERE f.user_id = $1
      ORDER BY f.created_at DESC
      LIMIT 5
    `, [req.user.userId]);

    res.json({
      stats: {
        ...stats.rows[0],
        avg_price_favorited: parseFloat(stats.rows[0].avg_price_favorited) || 0,
        min_price_favorited: parseFloat(stats.rows[0].min_price_favorited) || 0,
        max_price_favorited: parseFloat(stats.rows[0].max_price_favorited) || 0
      },
      topLocations: topLocations.rows,
      recentFavorites: recentFavorites.rows
    });
  } catch (error) {
    console.error('Get favorite stats error:', error);
    res.status(500).json({ message: 'Server error fetching favorite statistics' });
  }
});

// Clear all favorites
router.delete('/clear-all', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 RETURNING COUNT(*)',
      [req.user.userId]
    );

    res.json({
      message: 'All favorites cleared successfully',
      deletedCount: result.rowCount
    });
  } catch (error) {
    console.error('Clear favorites error:', error);
    res.status(500).json({ message: 'Server error clearing favorites' });
  }
});

// Export favorites (for backup/data export)
router.get('/export', authenticateToken, async (req, res) => {
  try {
    const favorites = await pool.query(`
      SELECT 
        p.title,
        p.price,
        p.type,
        p.location,
        p.address,
        p.bedrooms,
        p.bathrooms,
        p.area,
        u.name as agent_name,
        u.email as agent_email,
        u.phone as agent_phone,
        f.created_at as favorited_at
      FROM favorites f
      JOIN properties p ON f.property_id = p.id
      LEFT JOIN users u ON p.agent_id = u.id
      WHERE f.user_id = $1
      ORDER BY f.created_at DESC
    `, [req.user.userId]);

    res.json({
      message: 'Favorites exported successfully',
      exportDate: new Date().toISOString(),
      totalCount: favorites.rows.length,
      favorites: favorites.rows
    });
  } catch (error) {
    console.error('Export favorites error:', error);
    res.status(500).json({ message: 'Server error exporting favorites' });
  }
});

module.exports = router;