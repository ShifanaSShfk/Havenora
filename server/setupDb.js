const pool = require('./db');

const setupDatabase = async () => {
  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Properties table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS properties (
        property_id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        location VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL,
        purpose VARCHAR(50) NOT NULL,
        price NUMERIC NOT NULL,
        bedrooms INT,
        bathrooms INT,
        area NUMERIC,
        amenities TEXT[],
        images TEXT[],
        created_at TIMESTAMP DEFAULT NOW(),
        user_id INT REFERENCES users(user_id)
      );
    `);

    // Add more tables as needed (inquiries, transactions, etc.)
    console.log('Database tables created successfully');
  } catch (err) {
    console.error('Error setting up database:', err);
  } finally {
    pool.end();
  }
};

setupDatabase();