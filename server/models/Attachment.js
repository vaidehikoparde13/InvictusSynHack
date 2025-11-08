const { query } = require('../config/database');

class Attachment {
  static async create(attachmentData) {
    const { complaint_id, filename, file_path, file_type, file_size, uploaded_by, is_proof_of_work } = attachmentData;

    const result = await query(
      `INSERT INTO attachments (complaint_id, filename, file_path, file_type, file_size, uploaded_by, is_proof_of_work)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [complaint_id, filename, file_path, file_type, file_size, uploaded_by, is_proof_of_work || false]
    );

    return result.rows[0];
  }

  static async findByComplaintId(complaint_id, is_proof_of_work = null) {
    let sql = `SELECT * FROM attachments WHERE complaint_id = $1`;
    const params = [complaint_id];

    if (is_proof_of_work !== null) {
      sql += ` AND is_proof_of_work = $2`;
      params.push(is_proof_of_work);
    }

    sql += ` ORDER BY created_at ASC`;

    const result = await query(sql, params);
    return result.rows;
  }

  static async delete(id) {
    const result = await query(
      'DELETE FROM attachments WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }
}

module.exports = Attachment;

