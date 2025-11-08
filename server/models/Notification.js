const { query } = require('../config/database');

class Notification {
  static async create(notificationData) {
    const { user_id, complaint_id, title, message, type } = notificationData;

    const result = await query(
      `INSERT INTO notifications (user_id, complaint_id, title, message, type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [user_id, complaint_id, title, message, type]
    );

    return result.rows[0];
  }

  static async findByUserId(user_id, unread_only = false) {
    let sql = `SELECT n.*, c.title as complaint_title
               FROM notifications n
               LEFT JOIN complaints c ON n.complaint_id = c.id
               WHERE n.user_id = $1`;
    const params = [user_id];

    if (unread_only) {
      sql += ` AND n.is_read = false`;
    }

    sql += ` ORDER BY n.created_at DESC LIMIT 50`;

    const result = await query(sql, params);
    return result.rows;
  }

  static async markAsRead(id, user_id) {
    const result = await query(
      `UPDATE notifications 
       SET is_read = true 
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, user_id]
    );
    return result.rows[0];
  }

  static async markAllAsRead(user_id) {
    const result = await query(
      `UPDATE notifications 
       SET is_read = true 
       WHERE user_id = $1 AND is_read = false
       RETURNING COUNT(*)`,
      [user_id]
    );
    return result.rows[0];
  }
}

module.exports = Notification;

