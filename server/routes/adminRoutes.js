const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Attachment = require('../models/Attachment');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const { query } = require('../config/database');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

/**
 * @route   GET /api/admin/complaints
 * @desc    Get all complaints with filters
 * @access  Private (Admin)
 */
router.get('/complaints', async (req, res) => {
  try {
    const {
      status,
      category,
      search,
      page = 1,
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const filters = { status, category, search, limit: parseInt(limit), offset };

    const complaints = await Complaint.findAll(filters);
    const total = await Complaint.count(filters);

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
 * @route   GET /api/admin/complaints/:id
 * @desc    Get a single complaint with full details
 * @access  Private (Admin)
 */
router.get('/complaints/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Get attachments and comments
    complaint.attachments = await Attachment.findByComplaintId(complaint.id);
    complaint.comments = await Comment.findByComplaintId(complaint.id);
    complaint.proof_of_work = await Attachment.findByComplaintId(complaint.id, true);

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
 * @route   POST /api/admin/complaints/:id/approve
 * @desc    Approve a complaint
 * @access  Private (Admin)
 */
router.post('/complaints/:id/approve', async (req, res) => {
  try {
    const complaint = await Complaint.approve(req.params.id, req.user.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found or already processed'
      });
    }

    // Notify resident
    await Notification.create({
      user_id: complaint.resident_id,
      complaint_id: complaint.id,
      title: 'Complaint Approved',
      message: `Your complaint "${complaint.title}" has been approved and will be assigned to a worker soon.`,
      type: 'complaint_approved'
    });

    res.status(200).json({
      success: true,
      message: 'Complaint approved successfully',
      data: complaint
    });
  } catch (error) {
    console.error('Error approving complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving complaint',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/admin/complaints/:id/reject
 * @desc    Reject a complaint
 * @access  Private (Admin)
 */
router.post('/complaints/:id/reject', async (req, res) => {
  try {
    const { rejection_reason } = req.body;

    if (!rejection_reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const complaint = await Complaint.reject(req.params.id, rejection_reason);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Notify resident
    await Notification.create({
      user_id: complaint.resident_id,
      complaint_id: complaint.id,
      title: 'Complaint Rejected',
      message: `Your complaint "${complaint.title}" has been rejected. Reason: ${rejection_reason}`,
      type: 'complaint_rejected'
    });

    res.status(200).json({
      success: true,
      message: 'Complaint rejected successfully',
      data: complaint
    });
  } catch (error) {
    console.error('Error rejecting complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting complaint',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/admin/complaints/:id/assign
 * @desc    Assign complaint to a worker
 * @access  Private (Admin)
 */
router.post('/complaints/:id/assign', async (req, res) => {
  try {
    const { worker_id } = req.body;

    if (!worker_id) {
      return res.status(400).json({
        success: false,
        message: 'Worker ID is required'
      });
    }

    // Verify worker exists and is a worker
    const worker = await User.findById(worker_id);
    if (!worker || worker.role !== 'worker') {
      return res.status(400).json({
        success: false,
        message: 'Invalid worker ID'
      });
    }

    const complaint = await Complaint.assign(req.params.id, worker_id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found or not approved'
      });
    }

    // Notify worker
    await Notification.create({
      user_id: worker_id,
      complaint_id: complaint.id,
      title: 'New Task Assigned',
      message: `You have been assigned a new complaint: "${complaint.title}"`,
      type: 'task_assigned'
    });

    // Notify resident
    await Notification.create({
      user_id: complaint.resident_id,
      complaint_id: complaint.id,
      title: 'Complaint Assigned',
      message: `Your complaint "${complaint.title}" has been assigned to a worker.`,
      type: 'complaint_assigned'
    });

    res.status(200).json({
      success: true,
      message: 'Complaint assigned successfully',
      data: complaint
    });
  } catch (error) {
    console.error('Error assigning complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while assigning complaint',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/admin/complaints/:id/verify
 * @desc    Verify completed work (approve or request changes)
 * @access  Private (Admin)
 */
router.post('/complaints/:id/verify', async (req, res) => {
  try {
    const { action, feedback } = req.body; // action: 'approve' or 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action must be either "approve" or "reject"'
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    if (complaint.status !== 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Complaint is not in Completed status'
      });
    }

    if (action === 'approve') {
      await Complaint.update(req.params.id, {
        status: 'Resolved',
        resolved_at: new Date()
      });
      await Complaint.calculateTimeTaken(req.params.id);

      // Notify resident and worker
      await Notification.create({
        user_id: complaint.resident_id,
        complaint_id: complaint.id,
        title: 'Complaint Resolved',
        message: `Your complaint "${complaint.title}" has been resolved and verified.`,
        type: 'complaint_resolved'
      });
    } else {
      await Complaint.update(req.params.id, {
        status: 'Worker Pending'
      });

      // Notify worker
      if (complaint.assigned_to) {
        await Notification.create({
          user_id: complaint.assigned_to,
          complaint_id: complaint.id,
          title: 'Work Needs Revision',
          message: `Your work on "${complaint.title}" needs revision. Feedback: ${feedback || 'Please check and update.'}`,
          type: 'work_revision'
        });
      }
    }

    const updatedComplaint = await Complaint.findById(req.params.id);

    res.status(200).json({
      success: true,
      message: `Work ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      data: updatedComplaint
    });
  } catch (error) {
    console.error('Error verifying work:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while verifying work',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/admin/workers
 * @desc    Get all workers
 * @access  Private (Admin)
 */
router.get('/workers', async (req, res) => {
  try {
    const workers = await User.getAllWorkers();
    res.status(200).json({
      success: true,
      data: workers
    });
  } catch (error) {
    console.error('Error fetching workers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching workers',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/admin/analytics
 * @desc    Get analytics data
 * @access  Private (Admin)
 */
router.get('/analytics', async (req, res) => {
  try {
    // Total complaints
    const totalComplaints = await Complaint.count({});

    // Resolved complaints
    const resolvedComplaints = await Complaint.count({ status: 'Resolved' });

    // In progress complaints
    const inProgressComplaints = await Complaint.count({ status: 'In Progress' });

    // Pending complaints
    const pendingComplaints = await Complaint.count({ status: 'Pending' });

    // Average resolution time
    const avgResolutionResult = await query(
      `SELECT AVG(time_taken_hours) as avg_time FROM complaints 
       WHERE status = 'Resolved' AND time_taken_hours IS NOT NULL`
    );
    const avgResolutionTime = avgResolutionResult.rows[0]?.avg_time 
      ? parseFloat(avgResolutionResult.rows[0].avg_time) 
      : 0;

    // Active workers
    const activeWorkersResult = await query(
      `SELECT COUNT(DISTINCT assigned_to) as active_count 
       FROM complaints 
       WHERE assigned_to IS NOT NULL AND status IN ('Assigned', 'In Progress', 'Worker Pending')`
    );
    const activeWorkers = parseInt(activeWorkersResult.rows[0]?.active_count || 0);
    const totalWorkersResult = await query(
      `SELECT COUNT(*) as total FROM users WHERE role = 'worker' AND is_active = true`
    );
    const totalWorkers = parseInt(totalWorkersResult.rows[0]?.total || 0);

    // Complaints by category
    const categoryStats = await query(
      `SELECT category, COUNT(*) as count, 
              SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved
       FROM complaints 
       GROUP BY category 
       ORDER BY count DESC`
    );

    // Complaints by status
    const statusStats = await query(
      `SELECT status, COUNT(*) as count 
       FROM complaints 
       GROUP BY status 
       ORDER BY count DESC`
    );

    // Pending time analysis
    const pendingTimeStats = await query(
      `SELECT 
        COUNT(*) FILTER (WHERE EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - created_at)) / 3600 <= 24) as pending_24h,
        COUNT(*) FILTER (WHERE EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - created_at)) / 3600 > 24 
                         AND EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - created_at)) / 3600 <= 48) as pending_48h,
        COUNT(*) FILTER (WHERE EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - created_at)) / 3600 > 48 
                         AND EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - created_at)) / 3600 <= 72) as pending_72h,
        COUNT(*) FILTER (WHERE EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - created_at)) / 3600 > 72 
                         AND EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - created_at)) / 3600 <= 120) as pending_120h
       FROM complaints 
       WHERE status IN ('Pending', 'Approved', 'Assigned', 'In Progress', 'Worker Pending')`
    );

    res.status(200).json({
      success: true,
      data: {
        totalComplaints,
        resolvedComplaints,
        inProgressComplaints,
        pendingComplaints,
        avgResolutionTime: Math.round(avgResolutionTime * 10) / 10, // Round to 1 decimal
        avgResolutionTimeDays: Math.round((avgResolutionTime / 24) * 10) / 10,
        activeWorkers,
        totalWorkers,
        categoryStats: categoryStats.rows,
        statusStats: statusStats.rows,
        pendingTimeStats: pendingTimeStats.rows[0]
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/admin/complaints/:id/comments
 * @desc    Add a comment to a complaint
 * @access  Private (Admin)
 */
router.post('/complaints/:id/comments', async (req, res) => {
  try {
    const { comment } = req.body;

    if (!comment) {
      return res.status(400).json({
        success: false,
        message: 'Comment is required'
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    const newComment = await Comment.create({
      complaint_id: req.params.id,
      user_id: req.user.id,
      comment
    });

    // Notify resident
    await Notification.create({
      user_id: complaint.resident_id,
      complaint_id: complaint.id,
      title: 'New Comment',
      message: `Admin added a comment on your complaint "${complaint.title}"`,
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

module.exports = router;

