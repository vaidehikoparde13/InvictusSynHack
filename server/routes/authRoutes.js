const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (Resident, Admin, or Worker)
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
      room,
    } = req.body;

    // ✅ Basic field validation
    if (!email || !password || !full_name || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, full name, and role.',
      });
    }

    // ✅ Email normalization
    const normalizedEmail = email.trim().toLowerCase();

    // ✅ Validate phone number (optional but must be valid if provided)
    const phoneRegex = /^[0-9]{10}$/;
    if (phone && !phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number. Must be a 10-digit number.',
      });
    }

    // ✅ Check if user already exists
    const existingUser = await User.findByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists.',
      });
    }

    // ✅ Create new user
    const user = await User.create({
      student_id,
      email: normalizedEmail,
      password,
      full_name: full_name.trim(),
      role,
      phone: phone?.trim(),
      floor,
      room,
    });

    // ✅ Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        token,
        user: {
          id: user.id,
          student_id: user.student_id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          phone: user.phone,
          floor: user.floor,
          room: user.room,
        },
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration.',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error.',
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // ✅ Find user
    const user = await User.findByEmail(normalizedEmail);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    // ✅ Check if user is active
    if (user.is_active === false) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive. Please contact the administrator.',
      });
    }

    // ✅ Verify password
    const isPasswordValid = await User.verifyPassword(
      password,
      user.password_hash
    );
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    // ✅ Generate JWT token
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
          floor: user.floor,
          room: user.room,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login.',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error.',
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get(
  '/me',
  require('../middleware/auth').authenticate,
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error.',
        error:
          process.env.NODE_ENV === 'development'
            ? error.message
            : 'Internal server error.',
      });
    }
  }
);

module.exports = router;
