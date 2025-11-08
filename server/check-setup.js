require('dotenv').config();
const { pool } = require('./config/database.js');

(async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Connected successfully at', res.rows[0].now);
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  }
})();
