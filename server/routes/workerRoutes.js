const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const Complaint = require('../models/Complaint');
const Attachment = require('../models/Attachment');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');

// All worker routes require authentication and worker role
router.use(authenticate);
router.use(authorize('worker'));

/**
 * @route   GET /api/worker/tasks
 * @desc    Get all tasks assigned to the worker
 * @access  Private (Worker)
 */
router.get('/tasks', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const filters = {
      assigned_to: req.user.id,
      status: status,
      limit: parseInt(limit),
      offset
    };

    const tasks = await Complaint.findAll(filters);
    const total = await Complaint.count(filters);

    // Get attachments for each task
    for (const task of tasks) {
      task.attachments = await Attachment.findByComplaintId(task.id);
      task.proof_of_work = await Attachment.findByComplaintId(task.id, true);
    }

    // Separate pending and completed tasks
    const pending = tasks.filter(t => !['Completed', 'Resolved'].includes(t.status));
    const completed = tasks.filter(t => ['Completed', 'Resolved'].includes(t.status));

    res.status(200).json({
      success: true,
      data: {
        all: tasks,
        pending,
        completed,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalTasks: total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tasks',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/worker/tasks/:id
 * @desc    Get a single task with details
 * @access  Private (Worker)
 */
router.get('/tasks/:id', async (req, res) => {
  try {
    const task = await Complaint.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (task.assigned_to !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This task is not assigned to you.'
      });
    }

    // Get attachments, comments, and proof of work
    task.attachments = await Attachment.findByComplaintId(task.id);
    task.comments = await Comment.findByComplaintId(task.id);
    task.proof_of_work = await Attachment.findByComplaintId(task.id, true);

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching task',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   PUT /api/worker/tasks/:id/status
 * @desc    Update task status (In Progress, Completed, Rejected)
 * @access  Private (Worker)
 */
router.put('/tasks/:id/status', async (req, res) => {
  try {
    const { status, resolution } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['In Progress', 'Completed', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const task = await Complaint.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (task.assigned_to !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This task is not assigned to you.'
      });
    }

    const updateData = { status };
    if (status === 'Completed' && resolution) {
      updateData.resolution = resolution;
    }

    const updatedTask = await Complaint.updateStatus(req.params.id, status, updateData);

    // Notify admin and resident
    await Notification.create({
      user_id: task.resident_id,
      complaint_id: task.id,
      title: `Task ${status}`,
      message: `The status of your complaint "${task.title}" has been updated to ${status}.`,
      type: 'status_updated'
    });

    res.status(200).json({
      success: true,
      message: `Task status updated to ${status}`,
      data: updatedTask
    });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating task status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/worker/tasks/:id/proof
 * @desc    Upload proof of work
 * @access  Private (Worker)
 */
router.post('/tasks/:id/proof', upload.array('files', 5), async (req, res) => {
  try {
    const task = await Complaint.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (task.assigned_to !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This task is not assigned to you.'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one file'
      });
    }

    const attachments = [];
    for (const file of req.files) {
      const attachment = await Attachment.create({
        complaint_id: req.params.id,
        filename: file.originalname,
        file_path: `/uploads/${file.filename}`,
        file_type: file.mimetype,
        file_size: file.size,
        uploaded_by: req.user.id,
        is_proof_of_work: true
      });
      attachments.push(attachment);
    }

    // Update status to Worker Pending if it was In Progress
    if (task.status === 'In Progress') {
      await Complaint.updateStatus(req.params.id, 'Worker Pending');
    }

    // Notify admin
    await Notification.create({
      user_id: task.resident_id, // In real implementation, notify all admins
      complaint_id: task.id,
      title: 'Proof of Work Uploaded',
      message: `Worker has uploaded proof of work for complaint "${task.title}". Please verify.`,
      type: 'proof_uploaded'
    });

    res.status(201).json({
      success: true,
      message: 'Proof of work uploaded successfully',
      data: attachments
    });
  } catch (error) {
    console.error('Error uploading proof of work:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading proof of work',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/worker/tasks/:id/comments
 * @desc    Add a comment to a task
 * @access  Private (Worker)
 */
router.post('/tasks/:id/comments', async (req, res) => {
  try {
    const { comment } = req.body;

    if (!comment) {
      return res.status(400).json({
        success: false,
        message: 'Comment is required'
      });
    }

    const task = await Complaint.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (task.assigned_to !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This task is not assigned to you.'
      });
    }

    const newComment = await Comment.create({
      complaint_id: req.params.id,
      user_id: req.user.id,
      comment
    });

    // Notify resident and admin
    await Notification.create({
      user_id: task.resident_id,
      complaint_id: task.id,
      title: 'New Comment',
      message: `Worker added a comment on complaint "${task.title}"`,
      type: 'comment_added'
    });

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: newComment
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding comment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/worker/notifications
 * @desc    Get notifications for the worker
 * @access  Private (Worker)
 */
router.get('/notifications', async (req, res) => {
  try {
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

module.exports = router;

