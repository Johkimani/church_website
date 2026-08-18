import { db } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

// Public: submit a community enrollment
export const createEnrollment = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { fullName, name, phone, email, gender, course, yearOfStudy, voiceType, musicLevel } = req.body;

    const displayName = fullName || name;
    if (!displayName || !phone) {
      return res.status(400).json({ error: "Name and phone are required" });
    }

    const phoneClean = phone.replace(/\s+/g, '').trim();

    const existing = await db.query(
      `SELECT id, status FROM enrollments WHERE module_id = $1 AND phone = $2`,
      [moduleId, phoneClean]
    );
    if (existing.rows.length > 0) {
      const row = existing.rows[0];
      return res.status(409).json({
        error: `You have already enrolled in this community`,
        status: row.status,
        enrollmentId: row.id,
      });
    }

    const result = await db.query(
      `INSERT INTO enrollments (module_id, full_name, phone, email, gender, course, year_of_study, voice_type, music_level, status, joined_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Pending', NOW())
       RETURNING *`,
      [moduleId, displayName.trim(), phoneClean, email || '', gender || null, course || null, yearOfStudy || null, voiceType || null, musicLevel || null]
    );

    logger.info(`New enrollment: ${displayName} -> ${moduleId}`);
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    logger.error("createEnrollment error:", error.message);
    return res.status(500).json({ error: "Failed to submit enrollment" });
  }
};

// Public: check if phone already enrolled
export const checkDuplicate = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { phone } = req.query;
    if (!phone) return res.json({ exists: false });

    const phoneClean = phone.replace(/\s+/g, '').trim();
    const result = await db.query(
      `SELECT id, status, full_name FROM enrollments WHERE module_id = $1 AND phone = $2`,
      [moduleId, phoneClean]
    );

    return res.json({
      exists: result.rows.length > 0,
      enrollment: result.rows[0] || null,
    });
  } catch (error) {
    logger.error("checkDuplicate error:", error.message);
    return res.status(500).json({ error: "Check failed" });
  }
};

// Admin: get all enrollments for a module with stats
export const getModuleEnrollments = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { status, search } = req.query;

    let query = `SELECT * FROM enrollments WHERE module_id = $1`;
    const params = [moduleId];
    let paramIdx = 2;

    if (status && status !== 'all') {
      query += ` AND LOWER(status) = LOWER($${paramIdx})`;
      params.push(status);
      paramIdx++;
    }

    if (search) {
      query += ` AND (LOWER(full_name) LIKE LOWER($${paramIdx}) OR LOWER(phone) LIKE LOWER($${paramIdx}) OR LOWER(email) LIKE LOWER($${paramIdx}))`;
      params.push(`%${search}%`);
      paramIdx++;
    }

    query += ` ORDER BY joined_at DESC NULLS LAST, enrolled_at DESC NULLS LAST`;

    const result = await db.query(query, params);

    const stats = await db.query(
      `SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE LOWER(status) = 'approved') as approved,
        COUNT(*) FILTER (WHERE LOWER(status) = 'pending') as pending,
        COUNT(*) FILTER (WHERE LOWER(status) = 'rejected') as rejected
       FROM enrollments WHERE module_id = $1`,
      [moduleId]
    );

    return res.json({
      enrollments: result.rows,
      stats: stats.rows[0],
    });
  } catch (error) {
    logger.error("getModuleEnrollments error:", error.message);
    return res.status(500).json({ error: "Failed to fetch enrollments" });
  }
};

// Admin: update enrollment status
export const updateEnrollmentStatus = async (req, res) => {
  try {
    const { moduleId, id } = req.params;
    const { status, rejectionReason } = req.body;

    if (!status || !['Approved', 'Rejected', 'Pending'].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const result = await db.query(
      `UPDATE enrollments SET status = $1, rejection_reason = $2 WHERE id = $3 AND module_id = $4 RETURNING *`,
      [status, rejectionReason || null, id, moduleId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Enrollment not found" });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    logger.error("updateEnrollmentStatus error:", error.message);
    return res.status(500).json({ error: "Failed to update status" });
  }
};

// Admin: delete enrollment
export const deleteEnrollment = async (req, res) => {
  try {
    const { moduleId, id } = req.params;
    const result = await db.query(
      `DELETE FROM enrollments WHERE id = $1 AND module_id = $2 RETURNING id`,
      [id, moduleId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Enrollment not found" });
    }

    return res.json({ success: true, id: result.rows[0].id });
  } catch (error) {
    logger.error("deleteEnrollment error:", error.message);
    return res.status(500).json({ error: "Failed to delete enrollment" });
  }
};

// Auth: get communities the logged-in user has joined (by phone match)
export const getMyCommunities = async (req, res) => {
  try {
    const phone = req.user?.phone || req.user?.phoneNumber;
    if (!phone) {
      return res.json({ communities: [] });
    }

    const phoneClean = phone.replace(/\s+/g, '').trim();
    const result = await db.query(
      `SELECT e.*, m.title as module_title, m.theme_color, m.icon_class
       FROM enrollments e
       JOIN hub_modules m ON e.module_id = m.id
       WHERE e.phone = $1
       ORDER BY e.joined_at DESC NULLS LAST, e.enrolled_at DESC`,
      [phoneClean]
    );

    return res.json({ communities: result.rows });
  } catch (error) {
    logger.error("getMyCommunities error:", error.message);
    return res.status(500).json({ error: "Failed to fetch communities" });
  }
};
