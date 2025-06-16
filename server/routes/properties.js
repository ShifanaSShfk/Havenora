// routes/properties.js
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

// Get all properties with optional filters
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      minPrice,
      maxPrice,
      location,
      bedrooms,
      bathrooms,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    let query = `
      SELECT p.*, u.name as agent_name, u.phone as agent_phone, u.email as agent_email
      FROM properties p 
      LEFT JOIN users u ON p.agent_id = u.id 
      WHERE p.status = 'active'
    `;
    const queryParams = [];
    let paramCount = 0;

    // Add filters
    if (type) {
      paramCount++;
      query += ` AND p.type = $${paramCount}`;
      queryParams.push(type);
    }

    if (minPrice) {
      paramCount++;
      query += ` AND p.price >= $${paramCount}`;
      queryParams.push(minPrice);
    }

    if (maxPrice) {
      paramCount++;
      query += ` AND p.price <= $${paramCount}`;
      queryParams.push(maxPrice);
    }

    if (location) {
      paramCount++;
      query += ` AND (p.location ILIKE $${paramCount} OR p.address ILIKE $${paramCount})`;
      queryParams.push(`%${location}%`);
    }

    if (bedrooms) {
      paramCount++;
      query += ` AND p.bedrooms >= $${paramCount}`;
      queryParams.push(bedrooms);
    }

    if (bathrooms) {
      paramCount++;
      query += ` AND p.bathrooms >= $${paramCount}`;
      queryParams.push(bathrooms);
    }

    // Add sorting
    const validSortColumns = ['created_at', 'price', 'bedrooms', 'bathrooms', 'area'];
    const validSortOrders = ['ASC', 'DESC'];
    
    if (validSortColumns.includes(sortBy) && validSortOrders.includes(sortOrder.toUpperCase())) {
      query += ` ORDER BY p.${sortBy} ${sortOrder.toUpperCase()}`;
    } else {
      query += ` ORDER BY p.created_at DESC`;
    }

    // Add pagination
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    queryParams.push(limit);

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    queryParams.push(offset);

    const properties = await pool.query(query, queryParams);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM properties WHERE status = \'active\'';
    const countParams = [];
    let countParamCount = 0;

    // Apply same filters to count query
    if (type) {
      countParamCount++;
      countQuery += ` AND type = $${countParamCount}`;
      countParams.push(type);
    }

    if (minPrice) {
      countParamCount++;
      countQuery += ` AND price >= $${countParamCount}`;
      countParams.push(minPrice);
    }

    if (maxPrice) {
      countParamCount++;
      countQuery += ` AND price <= $${countParamCount}`;
      countParams.push(maxPrice);
    }

    if (location) {
      countParamCount++;
      countQuery += ` AND (location ILIKE $${countParamCount} OR address ILIKE $${countParamCount})`;
      countParams.push(`%${location}%`);
    }

    if (bedrooms) {
      countParamCount++;
      countQuery += ` AND bedrooms >= $${countParamCount}`;
      countParams.push(bedrooms);
    }

    if (bathrooms) {
      countParamCount++;
      countQuery += ` AND bathrooms >= $${countParamCount}`;
      countParams.push(bathrooms);
    }

    const totalCount = await pool.query(countQuery, countParams);
    const total = parseInt(totalCount.rows[0].count);

    res.json({
      properties: properties.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProperties: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ message: 'Server error fetching properties' });
  }
});

// Get single property by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const property = await pool.query(`
      SELECT p.*, u.name as agent_name, u.phone as agent_phone, u.email as agent_email
      FROM properties p 
      LEFT JOIN users u ON p.agent_id = u.id 
      WHERE p.id = $1
    `, [id]);

    if (property.rows.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Increment view count
    await pool.query('UPDATE properties SET views = views + 1 WHERE id = $1', [id]);

    res.json({ property: property.rows[0] });
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ message: 'Server error fetching property' });
  }
});

// Create new property (agents only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'agent') {
      return res.status(403).json({ message: 'Only agents can create properties' });
    }

    const {
      title,
      description,
      price,
      type,
      location,
      address,
      bedrooms,
      bathrooms,
      area,
      features,
      images
    } = req.body;

    // Validation
    if (!title || !description || !price || !type || !location || !address) {
      return res.status(400).json({ message: 'Required fields: title, description, price, type, location, address' });
    }

    const newProperty = await pool.query(`
      INSERT INTO properties (
        title, description, price, type, location, address, 
        bedrooms, bathrooms, area, features, images, 
        agent_id, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'active', NOW(), NOW())
      RETURNING *
    `, [
      title, description, price, type, location, address,
      bedrooms || 0, bathrooms || 0, area || 0, 
      JSON.stringify(features || []), JSON.stringify(images || []),
      req.user.userId
    ]);

    res.status(201).json({
      message: 'Property created successfully',
      property: newProperty.rows[0]
    });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({ message: 'Server error creating property' });
  }
});

// Update property (agents only - own properties)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if property exists and belongs to the agent
    const existingProperty = await pool.query(
      'SELECT * FROM properties WHERE id = $1 AND agent_id = $2',
      [id, req.user.userId]
    );

    if (existingProperty.rows.length === 0) {
      return res.status(404).json({ message: 'Property not found or unauthorized' });
    }

    const {
      title,
      description,
      price,
      type,
      location,
      address,
      bedrooms,
      bathrooms,
      area,
      features,
      images,
      status
    } = req.body;

    const updatedProperty = await pool.query(`
      UPDATE properties SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        price = COALESCE($3, price),
        type = COALESCE($4, type),
        location = COALESCE($5, location),
        address = COALESCE($6, address),
        bedrooms = COALESCE($7, bedrooms),
        bathrooms = COALESCE($8, bathrooms),
        area = COALESCE($9, area),
        features = COALESCE($10, features),
        images = COALESCE($11, images),
        status = COALESCE($12, status),
        updated_at = NOW()
      WHERE id = $13 AND agent_id = $14
      RETURNING *
    `, [
      title, description, price, type, location, address,
      bedrooms, bathrooms, area,
      features ? JSON.stringify(features) : null,
      images ? JSON.stringify(images) : null,
      status, id, req.user.userId
    ]);

    res.json({
      message: 'Property updated successfully',
      property: updatedProperty.rows[0]
    });
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({ message: 'Server error updating property' });
  }
});

// Delete property (agents only - own properties)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM properties WHERE id = $1 AND agent_id = $2 RETURNING id',
      [id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Property not found or unauthorized' });
    }

    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({ message: 'Server error deleting property' });
  }
});

// Get agent's properties
router.get('/agent/my-properties', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'agent') {
      return res.status(403).json({ message: 'Only agents can access this endpoint' });
    }

    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM properties WHERE agent_id = $1';
    const queryParams = [req.user.userId];
    let paramCount = 1;

    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      queryParams.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(limit, offset);

    const properties = await pool.query(query, queryParams);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM properties WHERE agent_id = $1';
    const countParams = [req.user.userId];

    if (status) {
      countQuery += ' AND status = $2';
      countParams.push(status);
    }

    const totalCount = await pool.query(countQuery, countParams);
    const total = parseInt(totalCount.rows[0].count);

    res.json({
      properties: properties.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProperties: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get agent properties error:', error);
    res.status(500).json({ message: 'Server error fetching properties' });
  }
});

// Search properties
router.get('/search/advanced', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const searchResults = await pool.query(`
      SELECT p.*, u.name as agent_name, u.phone as agent_phone, u.email as agent_email
      FROM properties p 
      LEFT JOIN users u ON p.agent_id = u.id 
      WHERE p.status = 'active' AND (
        p.title ILIKE $1 OR 
        p.description ILIKE $1 OR 
        p.location ILIKE $1 OR 
        p.address ILIKE $1 OR
        p.type ILIKE $1
      )
      ORDER BY p.created_at DESC
      LIMIT 20
    `, [`%${q}%`]);

    res.json({ properties: searchResults.rows });
  } catch (error) {
    console.error('Search properties error:', error);
    res.status(500).json({ message: 'Server error searching properties' });
  }
});

module.exports = router;