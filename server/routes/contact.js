// routes/contact.js
const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../db'); // Use your existing db.js file
const router = express.Router();

// Middleware to verify JWT token (optional for some routes)
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '17fc593acc89b548d0a273b1a3c41186ca58cf3d1f037d252c9b23ae2e2cee12');
    req.user = decoded;
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

// Required authentication middleware
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '17fc593acc89b548d0a273b1a3c41186ca58cf3d1f037d252c9b23ae2e2cee12');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Submit contact inquiry
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      message,
      subject,
      propertyId,
      inquiryType = 'general'
    } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    // If propertyId is provided, verify it exists
    let propertyInfo = null;
    if (propertyId) {
      const property = await pool.query('SELECT * FROM properties WHERE id = $1', [propertyId]);
      if (property.rows.length === 0) {
        return res.status(404).json({ message: 'Property not found' });
      }
      propertyInfo = property.rows[0];
    }

    // Create contact inquiry
    const newInquiry = await pool.query(`
      INSERT INTO contacts (
        name, email, phone, message, subject, property_id, 
        inquiry_type, user_id, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'new', NOW())
      RETURNING *
    `, [
      name, email, phone, message, subject, propertyId,
      inquiryType, req.user?.userId || null
    ]);

    // If it's a property inquiry, get agent info
    let agentInfo = null;
    if (propertyId && propertyInfo) {
      const agent = await pool.query(
        'SELECT id, name, email, phone FROM users WHERE id = $1',
        [propertyInfo.agent_id]
      );
      agentInfo = agent.rows[0] || null;
    }

    res.status(201).json({
      message: 'Inquiry submitted successfully',
      inquiry: newInquiry.rows[0],
      propertyInfo: propertyInfo ? {
        id: propertyInfo.id,
        title: propertyInfo.title,
        price: propertyInfo.price,
        location: propertyInfo.location
      } : null,
      agentInfo: agentInfo ? {
        name: agentInfo.name,
        email: agentInfo.email,
        phone: agentInfo.phone
      } : null
    });
  } catch (error) {
    console.error('Submit inquiry error:', error);
    res.status(500).json({ message: 'Server error submitting inquiry' });
  }
});

// Get user's inquiries
router.get('/my-inquiries', requireAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        c.*,
        p.title as property_title,
        p.price as property_price,
        p.location as property_location,
        p.images as property_images,
        u.name as agent_name,
        u.email as agent_email,
        u.phone as agent_phone
      FROM contacts c
      LEFT JOIN properties p ON c.property_id = p.id
      LEFT JOIN users u ON p.agent_id = u.id
      WHERE c.user_id = $1
    `;

    const queryParams = [req.user.userId];
    let paramCount = 1;

    if (status) {
      paramCount++;
      query += ` AND c.status = $${paramCount}`;
      queryParams.push(status);
    }

    query += ` ORDER BY c.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(limit, offset);

    const inquiries = await pool.query(query, queryParams);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM contacts WHERE user_id = $1';
    const countParams = [req.user.userId];

    if (status) {
      countQuery += ' AND status = $2';
      countParams.push(status);
    }

    const totalCount = await pool.query(countQuery, countParams);
    const total = parseInt(totalCount.rows[0].count);

    res.json({
      inquiries: inquiries.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalInquiries: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get user inquiries error:', error);
    res.status(500).json({ message: 'Server error fetching inquiries' });
  }
});

// Get agent's received inquiries
router.get('/agent-inquiries', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'agent') {
      return res.status(403).json({ message: 'Only agents can access this endpoint' });
    }

    const { page = 1, limit = 10, status, propertyId } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        c.*,
        p.title as property_title,
        p.price as property_price,
        p.location as property_location,
        p.images as property_images
      FROM contacts c
      LEFT JOIN properties p ON c.property_id = p.id
      WHERE p.agent_id = $1 OR (c.property_id IS NULL AND c.inquiry_type = 'general')
    `;

    const queryParams = [req.user.userId];
    let paramCount = 1;

    if (status) {
      paramCount++;
      query += ` AND c.status = $${paramCount}`;
      queryParams.push(status);
    }

    if (propertyId) {
      paramCount++;
      query += ` AND c.property_id = $${paramCount}`;
      queryParams.push(propertyId);
    }

    query += ` ORDER BY c.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(limit, offset);

    const inquiries = await pool.query(query, queryParams);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) FROM contacts c
      LEFT JOIN properties p ON c.property_id = p.id
      WHERE p.agent_id = $1 OR (c.property_id IS NULL AND c.inquiry_type = 'general')
    `;
    const countParams = [req.user.userId];
    let countParamCount = 1;

    if (status) {
      countParamCount++;
      countQuery += ` AND c.status = $${countParamCount}`;
      countParams.push(status);
    }

    if (propertyId) {
      countParamCount++;
      countQuery += ` AND c.property_id = $${countParamCount}`;
      countParams.push(propertyId);
    }

    const totalCount = await pool.query(countQuery, countParams);
    const total = parseInt(totalCount.rows[0].count);

    res.json({
      inquiries: inquiries.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalInquiries: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get agent inquiries error:', error);
    res.status(500).json({ message: 'Server error fetching agent inquiries' });
  }
});

// Update inquiry status (agents only)
router.put('/:id/status', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, response } = req.body;

    const validStatuses = ['new', 'in_progress', 'responded', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be one of: new, in_progress, responded, closed' });
    }

    // Check if inquiry exists and user has permission to update it
    let inquiry;
    if (req.user.role === 'agent') {
      inquiry = await pool.query(`
        SELECT c.* FROM contacts c
        LEFT JOIN properties p ON c.property_id = p.id
        WHERE c.id = $1 AND (p.agent_id = $2 OR c.property_id IS NULL)
      `, [id, req.user.userId]);
    } else {
      // Users can only update their own inquiries
      inquiry = await pool.query(
        'SELECT * FROM contacts WHERE id = $1 AND user_id = $2',
        [id, req.user.userId]
      );
    }

    if (inquiry.rows.length === 0) {
      return res.status(404).json({ message: 'Inquiry not found or unauthorized' });
    }

    // Update inquiry
    const updatedInquiry = await pool.query(`
      UPDATE contacts SET 
        status = $1, 
        response = COALESCE($2, response),
        updated_at = NOW(),
        responded_at = CASE WHEN $1 = 'responded' THEN NOW() ELSE responded_at END
      WHERE id = $3
      RETURNING *
    `, [status, response, id]);

    res.json({
      message: 'Inquiry status updated successfully',
      inquiry: updatedInquiry.rows[0]
    });
  } catch (error) {
    console.error('Update inquiry status error:', error);
    res.status(500).json({ message: 'Server error updating inquiry status' });
  }
});

// Get single inquiry details
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    let inquiry;
    if (req.user.role === 'agent') {
      inquiry = await pool.query(`
        SELECT 
          c.*,
          p.title as property_title,
          p.price as property_price,
          p.location as property_location,
          p.images as property_images,
          p.id as property_id
        FROM contacts c
        LEFT JOIN properties p ON c.property_id = p.id
        WHERE c.id = $1 AND (p.agent_id = $2 OR c.property_id IS NULL)
      `, [id, req.user.userId]);
    } else {
      inquiry = await pool.query(`
        SELECT 
          c.*,
          p.title as property_title,
          p.price as property_price,
          p.location as property_location,
          p.images as property_images,
          u.name as agent_name,
          u.email as agent_email,
          u.phone as agent_phone
        FROM contacts c
        LEFT JOIN properties p ON c.property_id = p.id
        LEFT JOIN users u ON p.agent_id = u.id
        WHERE c.id = $1 AND c.user_id = $2
      `, [id, req.user.userId]);
    }

    if (inquiry.rows.length === 0) {
      return res.status(404).json({ message: 'Inquiry not found or unauthorized' });
    }

    res.json({ inquiry: inquiry.rows[0] });
  } catch (error) {
    console.error('Get inquiry details error:', error);
    res.status(500).json({ message: 'Server error fetching inquiry details' });
  }
});

// Delete inquiry
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Users can only delete their own inquiries, agents can delete inquiries for their properties
    let result;
    if (req.user.role === 'agent') {
      result = await pool.query(`
        DELETE FROM contacts 
        WHERE id = $1 AND (
          property_id IN (SELECT id FROM properties WHERE agent_id = $2) 
          OR property_id IS NULL
        )
        RETURNING *
      `, [id, req.user.userId]);
    } else {
      result = await pool.query(
        'DELETE FROM contacts WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, req.user.userId]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Inquiry not found or unauthorized' });
    }

    res.json({ message: 'Inquiry deleted successfully' });
  } catch (error) {
    console.error('Delete inquiry error:', error);
    res.status(500).json({ message: 'Server error deleting inquiry' });
  }
});

module.exports = router;