const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');
const Complaint = require('../models/Complaint');
const Attachment = require('../models/Attachment');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const path = require('path');

/**
 * @route   POST /api/resident/complaints
 * @desc    Submit a new complaint (Resident only)
 * @access  Private (Resident)
 */
router.post('/complaints', authenticate, async (req, res) => {
  try {
    // Check if user is a resident
    if (req.user.role !== 'resident') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only residents can submit complaints.'
      });
    }

    const { title, description, category, subcategory, floor, room, priority } = req.body;

    // Validation
    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, and category'
      });
    }

    // Create complaint
    const complaint = await Complaint.create({
      resident_id: req.user.id,
      title,
      description,
      category,
      subcategory,
      floor: floor || req.user.floor,
      room: room || req.user.room,
      priority: priority || 'Medium'
    });

    // Create notification for admin
    await Notification.create({
      user_id: req.user.id, // Will need to get admin IDs in real implementation
      complaint_id: complaint.id,
      title: 'New Complaint Submitted',
      message: `A new complaint "${title}" has been submitted.`,
      type: 'complaint_submitted'
    });

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: complaint
    });
  } catch (error) {
    console.error('Error submitting complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting complaint',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/resident/complaints/:id/attachments
 * @desc    Upload attachments for a complaint
 * @access  Private (Resident)
 */
router.post('/complaints/:id/attachments', authenticate, upload.array('files', 5), async (req, res) => {
  try {
    if (req.user.role !== 'resident') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    if (complaint.resident_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only add attachments to your own complaints'
      });
    }

    const attachments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const attachment = await Attachment.create({
          complaint_id: req.params.id,
          filename: file.originalname,
          file_path: `/uploads/${file.filename}`,
          file_type: file.mimetype,
          file_size: file.size,
          uploaded_by: req.user.id,
          is_proof_of_work: false
        });
        attachments.push(attachment);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Attachments uploaded successfully',
      data: attachments
    });
  } catch (error) {
    console.error('Error uploading attachments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading attachments',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/resident/complaints
 * @desc    Get all complaints by the logged-in resident
 * @access  Private (Resident)
 */
router.get('/complaints', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'resident') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { status, category, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const filters = { status, category, limit: parseInt(limit), offset };
    const complaints = await Complaint.findByResidentId(req.user.id, filters);
    const total = await Complaint.count({ resident_id: req.user.id, status: filters.status, category: filters.category });

    // Get attachments for each complaint
    for (const complaint of complaints) {
      complaint.attachments = await Attachment.findByComplaintId(complaint.id);
    }

    res.status(200).json({
      success: true,
      data: {
        complaints,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalComplaints: total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching complaints',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/resident/complaints/:id
 * @desc    Get a single complaint with details
 * @access  Private (Resident)
 */
router.get('/complaints/:id', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'resident') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    if (complaint.resident_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This complaint does not belong to you.'
      });
    }

    // Get attachments and comments
    complaint.attachments = await Attachment.findByComplaintId(complaint.id);
    complaint.comments = await Comment.findByComplaintId(complaint.id);

    res.status(200).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    console.error('Error fetching complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching complaint',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/resident/notifications
 * @desc    Get notifications for the resident
 * @access  Private (Resident)
 */
router.get('/notifications', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'resident') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { unread_only } = req.query;
    const notifications = await Notification.findByUserId(req.user.id, unread_only === 'true');

    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notifications',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   PUT /api/resident/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private (Resident)
 */
router.put('/notifications/:id/read', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'resident') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const notification = await Notification.markAsRead(req.params.id, req.user.id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;

