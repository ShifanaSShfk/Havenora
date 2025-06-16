import pool from './db';

const setupDatabase = async () => {
  try {
    // Users table with proper password storage
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(20) DEFAULT 'buyer',
        reset_token VARCHAR(255),
        reset_token_expiry TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        last_login TIMESTAMP
      );
    `);

    // Properties table (unchanged)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS properties (
        id SERIAL PRIMARY KEY,
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
        agent_id INT REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Contacts table (unchanged)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        message TEXT NOT NULL,
        subject VARCHAR(200),
        property_id INT REFERENCES properties(id),
        inquiry_type VARCHAR(50) DEFAULT 'general',
        user_id INT REFERENCES users(id),
        status VARCHAR(50) DEFAULT 'new',
        response TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        responded_at TIMESTAMP
      );
    `);

    // Favorites table (unchanged)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id),
        property_id INT REFERENCES properties(id),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, property_id)
      );
    `);

    console.log('✅ Database tables created successfully');
  } catch (err) {
    console.error('❌ Error setting up database:', err);
    throw err;
  }
};

// Only run this if called directly
if (require.main === module) {
  setupDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default setupDatabase;