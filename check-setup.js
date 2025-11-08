/**
 * Quick setup checker
 * Run: node check-setup.js
 */
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking project setup...\n');

// Check .env file
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file exists');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
  const missing = requiredVars.filter(v => !envContent.includes(v));
  if (missing.length > 0) {
    console.log(`❌ Missing variables in .env: ${missing.join(', ')}`);
  } else {
    console.log('✅ All required database variables found in .env');
  }
} else {
  console.log('❌ .env file NOT found!');
  console.log('   Create .env file with database credentials');
}

// Check schema file
const schemaPath = path.join(__dirname, 'server', 'database', 'schema.sql');
if (fs.existsSync(schemaPath)) {
  console.log('✅ schema.sql file exists');
} else {
  console.log('❌ schema.sql file NOT found!');
}

// Check node_modules
if (fs.existsSync(path.join(__dirname, 'node_modules'))) {
  console.log('✅ node_modules exists (dependencies installed)');
} else {
  console.log('❌ node_modules NOT found!');
  console.log('   Run: npm install');
}

// Check database config
const dbConfigPath = path.join(__dirname, 'server', 'config', 'database.js');
if (fs.existsSync(dbConfigPath)) {
  console.log('✅ database.js config exists');
} else {
  console.log('❌ database.js config NOT found!');
}

console.log('\n💡 Next steps:');
console.log('1. Ensure PostgreSQL is installed and running');
console.log('2. Create database: CREATE DATABASE vnit_grievance;');
console.log('3. Verify .env file has correct credentials');
console.log('4. Run: npm run test-db (to test connection)');
console.log('5. Run: npm run init-db (to initialize schema)');

