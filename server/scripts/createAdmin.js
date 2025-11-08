/**
 * Script to create an admin user
 * Usage: node server/scripts/createAdmin.js
 */
require('dotenv').config();
const User = require('../models/User');
const { pool } = require('../config/database');

const createAdmin = async () => {
  try {
    const args = process.argv.slice(2);
    
    if (args.length < 3) {
      console.log('Usage: node server/scripts/createAdmin.js <email> <password> <full_name> [student_id]');
      process.exit(1);
    }

    const [email, password, full_name, student_id] = args;

    // Check if admin already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      console.log('User with this email already exists');
      process.exit(1);
    }

    // Create admin user
    const admin = await User.create({
      email,
      password,
      full_name,
      role: 'admin',
      student_id: student_id || null
    });

    console.log('Admin user created successfully!');
    console.log('Email:', admin.email);
    console.log('Name:', admin.full_name);
    console.log('Role:', admin.role);
    console.log('ID:', admin.id);

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    await pool.end();
    process.exit(1);
  }
};

createAdmin();

