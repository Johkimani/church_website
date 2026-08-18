import { db } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

// GET /profile/me — returns the authenticated member's full profile
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.member_id;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const result = await db.query(
      `SELECT m.member_id, m.first_name, m.last_name, m.email, m.phone,
              m.course, m.year_of_study, m.jumuiya_id, m.profile_image,
              sg.name AS jumuiya_name
       FROM members m
       LEFT JOIN sub_groups sg ON sg.group_id = m.jumuiya_id
       WHERE m.member_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Member not found" });
    }

    const row = result.rows[0];

    // Build roles array
    const rolesRes = await db.query(
      `SELECT r.role_name
       FROM member_roles mr
       JOIN roles r ON r.role_id = mr.role_id
       WHERE mr.member_id = $1`,
      [userId]
    );
    const roles = rolesRes.rows.map((r) => r.role_name);

    res.json({
      member_id: row.member_id,
      name: `${row.first_name} ${row.last_name}`.trim(),
      email: row.email || "",
      phone: row.phone || "",
      profileImage: row.profile_image || "",
      course: row.course || "",
      yearOfStudy: row.year_of_study || "",
      jumuiyaName: row.jumuiya_name || "",
      roles,
    });
  } catch (error) {
    logger.error("Error fetching profile:", error.message);
    res.status(500).json({ error: "Failed to load profile" });
  }
};

// PUT /profile/me — update only allowed fields; reject locked institutional fields
const LOCKED_FIELDS = [
  "member_id",
  "first_name",
  "last_name",
  "course",
  "year_of_study",
  "jumuiya_id",
  "gender",
  "join_date",
  "status",
  "source",
  "import_batch_id",
  "flagged_inactive",
  "failed_login_attempts",
  "locked_until",
  "email_verified",
  "password",
];

export const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.member_id;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const { phone, email, profileImage } = req.body;

    // Reject any locked fields injected into the body
    for (const key of Object.keys(req.body)) {
      if (LOCKED_FIELDS.includes(key)) {
        return res.status(403).json({
          error: `Cannot modify "${key}" — it is a protected institutional field.`,
        });
      }
    }

    const updates = [];
    const values = [];
    let idx = 1;

    if (profileImage !== undefined) {
      updates.push(`profile_image = $${idx}`);
      values.push(profileImage || null);
      idx++;
    }

    if (phone !== undefined) {
      updates.push(`phone = $${idx}`);
      values.push(phone || null);
      idx++;
    }

    if (email !== undefined) {
      // Validate email format
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      // Check uniqueness
      if (email) {
        const dup = await db.query(
          `SELECT member_id FROM members WHERE lower(email) = lower($1) AND member_id <> $2`,
          [email, userId]
        );
        if (dup.rows.length > 0) {
          return res.status(409).json({ error: "This email is already in use by another member" });
        }
      }

      updates.push(`email = $${idx}`);
      values.push(email || null);
      idx++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    values.push(userId);

    const result = await db.query(
      `UPDATE members
       SET ${updates.join(", ")}
       WHERE member_id = $${idx}
       RETURNING member_id, first_name, last_name, email, phone, profile_image`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Member not found" });
    }

    const updated = result.rows[0];

    logger.info("Profile updated by member:", userId);

    res.json({
      success: true,
      message: "Profile updated successfully",
      profile: {
        member_id: updated.member_id,
        name: `${updated.first_name} ${updated.last_name}`.trim(),
        email: updated.email || "",
        phone: updated.phone || "",
        profileImage: updated.profile_image || "",
      },
    });
  } catch (error) {
    logger.error("Error updating profile:", error.message);
    res.status(500).json({ error: "Failed to update profile" });
  }
};
