require('dotenv').config();
const { Pool } = require('pg');
console.log('🧭 Current working directory:', process.cwd());

console.log('🔍 Loaded DATABASE_URL:', process.env.DATABASE_URL ? '✅ Present' : '❌ Missing');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.on('connect', () => console.log('✅ Connected to Neon PostgreSQL Cloud'));
pool.on('error', (err) => {
  console.error('❌ Unexpected PostgreSQL error:', err.message);
  process.exit(-1);
});

const query = async (text, params) => {
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (error) {
    console.error('Query error:', error.message);
    throw error;
  }
};

module.exports = { pool, query };
