import { db } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

// Public: submit a community enrollment
export const createEnrollment = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { fullName, name, phone, email, gender, course, yearOfStudy, voiceType, wantsMusicClass } = req.body;

    const displayName = fullName || name;
    if (!displayName || !phone) {
      return res.status(400).json({ error: "Name and phone are required" });
    }

    const phoneClean = phone.replace(/\s+/g, '').trim();

    // If logged-in user, get their member_id and phone from the members table
    let memberId = null;
    let userPhone = phoneClean;
    if (req.user?.id || req.user?.member_id) {
      const mid = req.user.id || req.user.member_id;
      const memberRes = await db.query(
        `SELECT member_id, phone, first_name, last_name, email FROM members WHERE member_id = $1`,
        [mid]
      );
      if (memberRes.rows.length > 0) {
        const m = memberRes.rows[0];
        memberId = m.member_id;
        // Use the member's actual phone if available, otherwise use what they typed
        if (m.phone) {
          userPhone = m.phone.replace(/\s+/g, '').trim();
        }
      }
    }

    const existing = await db.query(
      `SELECT id, status FROM enrollments WHERE module_id = $1 AND phone = $2`,
      [moduleId, userPhone]
    );
    if (existing.rows.length > 0) {
      const row = existing.rows[0];
      return res.status(409).json({
        error: `You have already enrolled in this community`,
        status: row.status,
        enrollmentId: row.id,
      });
    }

    const baseParams = [moduleId, displayName.trim(), userPhone, email || '', gender || null, course || null, yearOfStudy || null, voiceType || null];
    let result;
    try {
      result = await db.query(
        `INSERT INTO enrollments (module_id, full_name, phone, email, gender, course, year_of_study, voice_type, wants_music_class, member_id, status, joined_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'Pending', NOW())
         RETURNING *`,
        [...baseParams, wantsMusicClass === true, memberId]
      );
    } catch (insertErr) {
      // Self-heal: if the wants_music_class column is missing (migration not
      // applied yet), fall back to the legacy insert so members aren't blocked.
      if (insertErr?.code === '42703') {
        logger.warn("createEnrollment: wants_music_class column missing — falling back to legacy insert");
        result = await db.query(
          `INSERT INTO enrollments (module_id, full_name, phone, email, gender, course, year_of_study, voice_type, member_id, status, joined_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Pending', NOW())
           RETURNING *`,
          [...baseParams, memberId]
        );
      } else {
        throw insertErr;
      }
    }

    logger.info(`New enrollment: ${displayName} -> ${moduleId} (member_id: ${memberId || 'none'})`);
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    // Winston printf only prints info.message — second arg is silently dropped
    const detail = {
      message: error?.message,
      code: error?.code,
      detail: error?.detail,
      hint: error?.hint,
      stack: error?.stack ? String(error.stack).split("\n").slice(0, 5) : undefined,
    };
    logger.error(`createEnrollment error: ${JSON.stringify(detail)}`);
    // Also return the detail in dev so frontend can surface it
    return res.status(500).json({ error: "Failed to submit enrollment", detail: process.env.NODE_ENV !== "production" ? detail : undefined });
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

// Auth: withdraw (delete) your own rejected enrollment so you can re-apply
export const withdrawEnrollment = async (req, res) => {
  try {
    const { moduleId, id } = req.params;
    const userId = req.user?.id || req.user?.member_id;
    if (!userId) return res.status(401).json({ error: "Authentication required" });

    // Look up phone from members table
    const memberRes = await db.query(
      `SELECT phone FROM members WHERE member_id = $1`,
      [userId]
    );
    const phone = memberRes.rows[0]?.phone;
    if (!phone) return res.status(400).json({ error: "No phone on file" });

    const phoneClean = phone.replace(/\s+/g, '').trim();
    const result = await db.query(
      `DELETE FROM enrollments WHERE id = $1 AND module_id = $2 AND phone = $3 AND LOWER(status) = 'rejected' RETURNING id`,
      [id, moduleId, phoneClean]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No rejected enrollment found to withdraw" });
    }

    logger.info(`Enrollment withdrawn: id=${id} module=${moduleId} phone=${phoneClean}`);
    return res.json({ success: true, id: result.rows[0].id });
  } catch (error) {
    logger.error(`withdrawEnrollment error: ${error.message}`);
    return res.status(500).json({ error: "Failed to withdraw enrollment" });
  }
};

// Auth: get communities the logged-in user has joined
// Matches by member_id first, then falls back to phone lookup from members table
export const getMyCommunities = async (req, res) => {
  try {
    const memberId = req.user?.member_id || req.user?.id;
    if (!memberId) {
      return res.json({ communities: [] });
    }

    // Primary match: by member_id
    const byMemberId = await db.query(
      `SELECT e.*, m.title as module_title, m.theme_color, m.icon_class
       FROM enrollments e
       JOIN hub_modules m ON e.module_id = m.id
       WHERE e.member_id = $1
       ORDER BY e.joined_at DESC NULLS LAST, e.enrolled_at DESC`,
      [memberId]
    );

    if (byMemberId.rows.length > 0) {
      return res.json({ communities: byMemberId.rows });
    }

    // Fallback: look up member's phone from the members table, match by phone
    const memberRes = await db.query(
      `SELECT phone FROM members WHERE member_id = $1`,
      [memberId]
    );
    const phone = memberRes.rows[0]?.phone;
    if (!phone) {
      return res.json({ communities: [] });
    }

    const phoneClean = phone.replace(/\s+/g, '').trim();
    const byPhone = await db.query(
      `SELECT e.*, m.title as module_title, m.theme_color, m.icon_class
       FROM enrollments e
       JOIN hub_modules m ON e.module_id = m.id
       WHERE e.phone = $1
       ORDER BY e.joined_at DESC NULLS LAST, e.enrolled_at DESC`,
      [phoneClean]
    );

    // Backfill member_id on any phone-matched records for future lookups
    if (byPhone.rows.length > 0) {
      await db.query(
        `UPDATE enrollments SET member_id = $1 WHERE member_id IS NULL AND phone = $2`,
        [memberId, phoneClean]
      ).catch(err => logger.warn("member_id backfill failed:", err.message));
    }

    return res.json({ communities: byPhone.rows });
  } catch (error) {
    logger.error("getMyCommunities error:", error.message);
    return res.status(500).json({ error: "Failed to fetch communities" });
  }
};

/**
 * Admin: members who opted into music classes on the choir join form.
 * Returns only name + phone (nothing more), any enrollment status.
 */
export const getMusicClassSignups = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const result = await db.query(
      `SELECT full_name, phone
       FROM enrollments
       WHERE module_id = $1 AND wants_music_class = TRUE
       ORDER BY joined_at DESC`,
      [moduleId]
    );
    return res.json({ status: "success", data: result.rows });
  } catch (error) {
    logger.error("getMusicClassSignups error:", error.message);
    return res.status(500).json({ error: "Failed to fetch music class signups" });
  }
};
