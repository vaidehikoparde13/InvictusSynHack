require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

/**
 * Initialize database by running schema.sql
 */
const initDatabase = async () => {
  try {
    console.log('Starting database initialization...\n');
    console.log('Database configuration:');
    console.log(`  Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`  Port: ${process.env.DB_PORT || 5432}`);
    console.log(`  Database: ${process.env.DB_NAME || 'vnit_grievance'}`);
    console.log(`  User: ${process.env.DB_USER || 'postgres'}\n`);

    // Test connection first
    try {
      await pool.query('SELECT NOW()');
      console.log('✅ Database connection successful\n');
    } catch (error) {
      console.error('❌ Database connection failed!');
      console.error(`Error: ${error.message}\n`);
      console.log('💡 Troubleshooting:');
      console.log('  1. Check if PostgreSQL service is running');
      console.log('  2. Verify database credentials in .env file');
      console.log('  3. Ensure database "vnit_grievance" exists');
      console.log('  4. Run: CREATE DATABASE vnit_grievance;');
      process.exit(1);
    }

    const schemaPath = path.join(__dirname, 'schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      console.error(`❌ Schema file not found: ${schemaPath}`);
      process.exit(1);
    }

    console.log('Reading schema file...');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing database schema...\n');

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    // Execute the entire schema as one query
    // PostgreSQL supports multiple statements separated by semicolons
    try {
      await pool.query(schema);
      console.log('✅ Schema executed successfully\n');
      successCount = 1;
    } catch (error) {
      // If bulk execution fails, it might be due to some statements
      // Try to identify which part failed
      console.log('⚠️  Bulk execution encountered issues\n');
      console.log(`Error: ${error.message}\n`);
      
      // Try executing in smaller chunks - split by major statements
      const majorStatements = [
        // Extension
        /CREATE EXTENSION[^;]+;/gi,
        // Tables
        /CREATE TABLE[^;]+;/gi,
        // Indexes
        /CREATE INDEX[^;]+;/gi,
        // Function
        /CREATE OR REPLACE FUNCTION[^;]+;\s*END;\s*\$\$[^;]+;/gi,
        // Triggers
        /CREATE TRIGGER[^;]+;/gi
      ];

      // Extract and execute major statements
      const extractedStatements = [];
      
      // Extract CREATE EXTENSION
      let matches = schema.match(/CREATE EXTENSION[^;]+;/gi);
      if (matches) extractedStatements.push(...matches);
      
      // Extract CREATE TABLE statements
      matches = schema.match(/CREATE TABLE[^;]+(?:[^;]|;)+?;/gi);
      if (matches) extractedStatements.push(...matches);
      
      // Extract CREATE INDEX statements
      matches = schema.match(/CREATE INDEX[^;]+;/gi);
      if (matches) extractedStatements.push(...matches);
      
      // Extract CREATE FUNCTION (handle multi-line with $$)
      const functionRegex = /CREATE OR REPLACE FUNCTION[\s\S]*?\$\$[\s\S]*?\$\$[^;]*language[^;]*;/gi;
      matches = schema.match(functionRegex);
      if (matches) extractedStatements.push(...matches);
      
      // Extract CREATE TRIGGER
      matches = schema.match(/CREATE TRIGGER[^;]+;/gi);
      if (matches) extractedStatements.push(...matches);

      console.log(`Found ${extractedStatements.length} major statements to execute\n`);

      // Execute each statement
      for (const statement of extractedStatements) {
        if (statement && statement.trim().length > 0) {
          try {
            await pool.query(statement);
            successCount++;
          } catch (error) {
            // Ignore "already exists" errors
            if (error.message.includes('already exists') || 
                error.message.includes('duplicate') ||
                (error.message.includes('does not exist') && error.message.includes('extension'))) {
              skippedCount++;
            } else {
              errorCount++;
              console.error(`❌ Error: ${error.message}`);
              const preview = statement.substring(0, 150).replace(/\s+/g, ' ');
              console.error(`   Statement: ${preview}...\n`);
            }
          }
        }
      }
    }

    console.log('\n📊 Execution Summary:');
    console.log(`  ✅ Successful: ${successCount}`);
    console.log(`  ⚠️  Skipped (already exists): ${skippedCount}`);
    console.log(`  ❌ Errors: ${errorCount}\n`);

    if (errorCount === 0) {
      console.log('✅ Database schema initialized successfully!\n');
      
      // Verify tables were created
      const tablesResult = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `);

      if (tablesResult.rows.length > 0) {
        console.log('📋 Created tables:');
        tablesResult.rows.forEach(row => {
          console.log(`  - ${row.table_name}`);
        });
      }
    } else {
      console.log('⚠️  Database initialization completed with errors');
      console.log('   Some tables may not have been created properly');
    }

    await pool.end();
    process.exit(errorCount > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n❌ Fatal error initializing database:');
    console.error(error);
    await pool.end();
    process.exit(1);
  }
};

// Run the initialization if this file is executed directly
if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;

