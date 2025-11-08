/**
 * Test PostgreSQL database connection
 * Usage: node server/scripts/testConnection.js
 */
require('dotenv').config();
const { pool, query } = require('../config/database');

const testConnection = async () => {
  try {
    console.log('Testing PostgreSQL connection...\n');
    console.log('Configuration:');
    console.log(`  Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`  Port: ${process.env.DB_PORT || 5432}`);
    console.log(`  Database: ${process.env.DB_NAME || 'vnit_grievance'}`);
    console.log(`  User: ${process.env.DB_USER || 'postgres'}\n`);

    // Test basic connection
    const result = await query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Connection successful!');
    console.log(`  Current time: ${result.rows[0].current_time}`);
    console.log(`  PostgreSQL version: ${result.rows[0].pg_version.split(',')[0]}\n`);

    // Check if tables exist
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    if (tablesResult.rows.length > 0) {
      console.log('✅ Database tables found:');
      tablesResult.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    } else {
      console.log('⚠️  No tables found. Run: npm run init-db');
    }

    console.log('\n✅ Database connection test completed successfully!');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error(`Error: ${error.message}\n`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Troubleshooting:');
      console.log('  1. Check if PostgreSQL service is running');
      console.log('  2. Verify DB_HOST and DB_PORT in .env file');
      console.log('  3. Try: net start postgresql-x64-<version> (Windows)');
    } else if (error.code === '3D000') {
      console.log('💡 Troubleshooting:');
      console.log('  1. Database does not exist');
      console.log('  2. Create database: CREATE DATABASE vnit_grievance;');
    } else if (error.code === '28P01') {
      console.log('💡 Troubleshooting:');
      console.log('  1. Invalid username or password');
      console.log('  2. Check DB_USER and DB_PASSWORD in .env file');
    } else if (error.code === '42P01') {
      console.log('💡 Troubleshooting:');
      console.log('  1. Tables do not exist');
      console.log('  2. Run: npm run init-db');
    }

    await pool.end();
    process.exit(1);
  }
};

testConnection();

