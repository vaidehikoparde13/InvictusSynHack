const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const {
      student_id,
      email,
      password,
      full_name,
      role,
      phone,
      floor,
      room
    } = userData;

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO users (student_id, email, password_hash, full_name, role, phone, floor, room)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, student_id, email, full_name, role, phone, floor, room, created_at`,
      [student_id, email, password_hash, full_name, role, phone, floor, room]
    );

    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await query(
      'SELECT id, student_id, email, full_name, role, phone, floor, room, is_active, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async findByStudentId(student_id) {
    const result = await query(
      'SELECT * FROM users WHERE student_id = $1',
      [student_id]
    );
    return result.rows[0];
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async getAllWorkers() {
    const result = await query(
      `SELECT id, student_id, email, full_name, phone, is_active, created_at
       FROM users WHERE role = 'worker' AND is_active = true
       ORDER BY full_name`
    );
    return result.rows;
  }

  static async update(id, updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return await this.findById(id);
    }

    values.push(id);
    const result = await query(
      `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING id, student_id, email, full_name, role, phone, floor, room, is_active`,
      values
    );

    return result.rows[0];
  }
}

module.exports = User;

