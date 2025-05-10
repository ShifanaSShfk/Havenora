const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all properties
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM properties');
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Add more endpoints (GET by ID, POST, PUT, DELETE)

module.exports = router;