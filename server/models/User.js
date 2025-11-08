const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // ✅ Create a new user
  static async create(userData) {
    const {
      student_id,
      email,
      password,
      full_name,
      role,
      phone,
      hostel_block,
      floor,
      room_number
    } = userData;

    // ✅ Hash password securely
    const password_hash = await bcrypt.hash(password, 10);

    // ✅ Insert new user (floor + room_number added)
    const result = await query(
      `INSERT INTO users (
        student_id, email, password_hash, full_name, role, phone, hostel_block, floor, room_number
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, student_id, email, full_name, role, phone, hostel_block, floor, room_number, is_active, created_at`,
      [
        student_id || null,
        email,
        password_hash,
        full_name,
        role,
        phone,
        hostel_block || null,
        floor || null,
        room_number || null
      ]
    );

    return result.rows[0];
  }

  // ✅ Find by email
  static async findByEmail(email) {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  // ✅ Find by user ID
  static async findById(id) {
    const result = await query(
      `SELECT id, student_id, email, full_name, role, phone, hostel_block, floor, room_number, is_active, created_at
       FROM users
       WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  // ✅ Find by student ID (for student-specific lookups)
  static async findByStudentId(student_id) {
    const result = await query('SELECT * FROM users WHERE student_id = $1', [student_id]);
    return result.rows[0];
  }

  // ✅ Verify hashed password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // ✅ Get all workers (for Admin or Maintenance module)
  static async getAllWorkers() {
    const result = await query(
      `SELECT id, student_id, email, full_name, phone, is_active, created_at
       FROM users
       WHERE LOWER(role) = 'worker' AND is_active = true
       ORDER BY full_name`
    );
    return result.rows;
  }

  // ✅ Update user info dynamically
  static async update(id, updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) return await this.findById(id);

    values.push(id);

    const result = await query(
      `UPDATE users
       SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING id, student_id, email, full_name, role, phone, hostel_block, floor, room_number, is_active, updated_at`,
      values
    );

    return result.rows[0];
  }
}

module.exports = User;
