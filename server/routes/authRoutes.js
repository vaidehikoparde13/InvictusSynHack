const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (Student, Admin, or Worker)
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const {
      student_id,
      email,
      password,
      full_name,
      role,
      phone,
      floor,
      room_number
    } = req.body;

    // ✅ Basic validation
    if (!email || !password || !full_name || !role || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, password, phone, and role.'
      });
    }

    // ✅ Student-specific validation
    if (role === 'Student') {
      if (!student_id || floor === undefined || !room_number) {
        return res.status(400).json({
          success: false,
          message: 'Student ID, floor, and room number are required for students.'
        });
      }
    }

    // ✅ Validate email format
    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format.'
      });
    }

    // ✅ Validate phone
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number. Must be 10 digits.'
      });
    }

    // ✅ Check if user already exists
    const existingUser = await User.findByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists.'
      });
    }

    // ✅ Check duplicate student ID (if applicable)
    if (role === 'Student' && student_id) {
      const existingStudent = await User.findByStudentId(student_id);
      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: 'A user with this Student ID already exists.'
        });
      }
    }

    // ✅ Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Automatically set hostel block for all students
    const hostel_block = role === 'Student' ? 'Dr. Anandi Bai Joshi' : null;

    // ✅ Create user safely
    const newUser = await User.create({
      student_id: role === 'Student' ? student_id : null,
      email: normalizedEmail,
      password: hashedPassword,
      full_name: full_name.trim(),
      role,
      phone: phone.trim(),
      hostel_block,
      floor: role === 'Student' ? floor : null,
      room_number: role === 'Student' ? room_number : null
    });

    // ✅ Generate JWT
    const token = jwt.sign(
      { userId: newUser.id, role: newUser.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        token,
        user: {
          id: newUser.id,
          student_id: newUser.student_id,
          email: newUser.email,
          full_name: newUser.full_name,
          role: newUser.role,
          phone: newUser.phone,
          hostel_block: newUser.hostel_block,
          floor: newUser.floor,
          room_number: newUser.room_number
        }
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration.',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user (Student, Admin, or Worker)
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // ✅ Find user by email
    const user = await User.findByEmail(normalizedEmail);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      });
    }

    // ✅ Check if user is active
    if (user.is_active === false) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive. Please contact the administrator.'
      });
    }

    // ✅ Verify password
    const isValid = await User.verifyPassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      });
    }

    // ✅ Generate JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: user.id,
          student_id: user.student_id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          phone: user.phone,
          hostel_block: user.hostel_block,
          floor: user.floor,
          room_number: user.room_number
        }
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during login.',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user
 * @access  Private
 */
router.get(
  '/me',
  require('../middleware/auth').authenticate,
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found.'
        });
      }

      return res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('❌ Get user error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Server error.',
        error:
          process.env.NODE_ENV === 'development'
            ? error.stack
            : undefined
      });
    }
  }
);

module.exports = router;
