const { query } = require('../config/database');

class Complaint {
  static async create(complaintData) {
    let {
      resident_id,
      title,
      description,
      category,
      subcategory,
      whichWashroom, // 👈 may come from frontend
      floor,
      room,
      priority
    } = complaintData;

    // ✅ Combine washroom + specific location (no DB schema change)
    if (category?.toLowerCase() === 'washroom' && whichWashroom) {
      category = `Washroom - ${whichWashroom}`;
    }

    const result = await query(
      `INSERT INTO complaints (resident_id, title, description, category, subcategory, floor, room, priority)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [resident_id, title, description, category, subcategory, floor, room, priority || 'Medium']
    );

    return result.rows[0];
  }

  static async findById(id) {
    const result = await query(
      `SELECT c.*, 
              r.full_name as resident_name, r.email as resident_email, r.phone as resident_phone,
              w.full_name as worker_name, w.email as worker_email
       FROM complaints c
       LEFT JOIN users r ON c.resident_id = r.id
       LEFT JOIN users w ON c.assigned_to = w.id
       WHERE c.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async findByResidentId(resident_id, filters = {}) {
    let sql = `SELECT c.*, 
                      w.full_name as worker_name, w.email as worker_email
               FROM complaints c
               LEFT JOIN users w ON c.assigned_to = w.id
               WHERE c.resident_id = $1`;
    const params = [resident_id];
    let paramCount = 2;

    if (filters.status) {
      sql += ` AND c.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    // ✅ Smarter category filter (matches "Washroom - T2" when filtering by "Washroom")
    if (filters.category) {
      sql += ` AND c.category ILIKE $${paramCount}`;
      params.push(`${filters.category}%`);
      paramCount++;
    }

    sql += ` ORDER BY c.created_at DESC`;

    if (filters.limit) {
      sql += ` LIMIT $${paramCount}`;
      params.push(filters.limit);
      paramCount++;
      if (filters.offset) {
        sql += ` OFFSET $${paramCount}`;
        params.push(filters.offset);
      }
    }

    const result = await query(sql, params);
    return result.rows;
  }

  static async findAll(filters = {}) {
    let sql = `SELECT c.*, 
                      r.full_name as resident_name, r.email as resident_email, r.phone as resident_phone,
                      w.full_name as worker_name, w.email as worker_email
               FROM complaints c
               LEFT JOIN users r ON c.resident_id = r.id
               LEFT JOIN users w ON c.assigned_to = w.id
               WHERE 1=1`;
    const params = [];
    let paramCount = 1;

    if (filters.status) {
      sql += ` AND c.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    // ✅ Match "Washroom - T2" even when filtering by "Washroom"
    if (filters.category) {
      sql += ` AND c.category ILIKE $${paramCount}`;
      params.push(`${filters.category}%`);
      paramCount++;
    }

    if (filters.assigned_to) {
      sql += ` AND c.assigned_to = $${paramCount}`;
      params.push(filters.assigned_to);
      paramCount++;
    }

    if (filters.search) {
      sql += ` AND (c.title ILIKE $${paramCount} OR c.description ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
      paramCount++;
    }

    sql += ` ORDER BY c.created_at DESC`;

    if (filters.limit) {
      sql += ` LIMIT $${paramCount}`;
      params.push(filters.limit);
      paramCount++;
      if (filters.offset) {
        sql += ` OFFSET $${paramCount}`;
        params.push(filters.offset);
      }
    }

    const result = await query(sql, params);
    return result.rows;
  }

  static async count(filters = {}) {
    let sql = 'SELECT COUNT(*) FROM complaints WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filters.status) {
      sql += ` AND status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    // ✅ Count all washroom variations together
    if (filters.category) {
      sql += ` AND category ILIKE $${paramCount}`;
      params.push(`${filters.category}%`);
      paramCount++;
    }

    if (filters.assigned_to) {
      sql += ` AND assigned_to = $${paramCount}`;
      params.push(filters.assigned_to);
      paramCount++;
    }

    const result = await query(sql, params);
    return parseInt(result.rows[0].count);
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
      `UPDATE complaints SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    return result.rows[0];
  }

  static async approve(id, admin_id) {
    const result = await query(
      `UPDATE complaints 
       SET status = 'Approved', approved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND status = 'Pending'
       RETURNING *`,
      [id]
    );
    return result.rows[0];
  }

  static async reject(id, rejection_reason) {
    const result = await query(
      `UPDATE complaints 
       SET status = 'Rejected', rejected_at = CURRENT_TIMESTAMP, rejection_reason = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id, rejection_reason]
    );
    return result.rows[0];
  }

  static async assign(id, worker_id) {
    const result = await query(
      `UPDATE complaints 
       SET status = 'Assigned', assigned_to = $2, assigned_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND status = 'Approved'
       RETURNING *`,
      [id, worker_id]
    );
    return result.rows[0];
  }

  static async updateStatus(id, status, additionalData = {}) {
    const updateFields = ['status = $2', 'updated_at = CURRENT_TIMESTAMP'];
    const values = [id, status];
    let paramCount = 3;

    if (status === 'Completed' && additionalData.resolution) {
      updateFields.push(`resolution = $${paramCount}`);
      values.push(additionalData.resolution);
      paramCount++;
      updateFields.push('resolved_at = CURRENT_TIMESTAMP');
    }

    const result = await query(
      `UPDATE complaints SET ${updateFields.join(', ')}
       WHERE id = $1
       RETURNING *`,
      values
    );

    return result.rows[0];
  }

  static async calculateTimeTaken(id) {
    const result = await query(
      `UPDATE complaints 
       SET time_taken_hours = EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600
       WHERE id = $1 AND resolved_at IS NOT NULL
       RETURNING *`,
      [id]
    );
    return result.rows[0];
  }
}

module.exports = Complaint;
