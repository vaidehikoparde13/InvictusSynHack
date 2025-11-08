const { query } = require('../config/database');

class Comment {
  static async create(commentData) {
    const { complaint_id, user_id, comment } = commentData;

    const result = await query(
      `INSERT INTO comments (complaint_id, user_id, comment)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [complaint_id, user_id, comment]
    );

    return result.rows[0];
  }

  static async findByComplaintId(complaint_id) {
    const result = await query(
      `SELECT c.*, u.full_name, u.role
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.complaint_id = $1
       ORDER BY c.created_at ASC`,
      [complaint_id]
    );
    return result.rows;
  }
}

module.exports = Comment;

