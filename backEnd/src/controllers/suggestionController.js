import { db as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";
import crypto from "crypto";
import sendEmail from "../Configs/emailConfig.js";

const SUGGESTION_WITH_MEMBER = `
  SELECT s.*,
    CASE WHEN s.name IS NOT NULL OR s.status = 'approved' THEN m.first_name END AS member_first_name,
    CASE WHEN s.name IS NOT NULL OR s.status = 'approved' THEN m.last_name END AS member_last_name,
    CASE WHEN s.name IS NOT NULL OR s.status = 'approved' THEN m.year_of_study END AS member_year_of_study,
    CASE WHEN s.name IS NOT NULL OR s.status = 'approved' THEN sg.name END AS member_jumuiya
  FROM suggestions s
  LEFT JOIN members m ON s.user_id = m.member_id
  LEFT JOIN sub_groups sg ON m.jumuiya_id = sg.group_id
`;

export const listSuggestions = async (req, res) => {
  try {
    const result = await pool.query(
      `${SUGGESTION_WITH_MEMBER} WHERE s.deleted_at IS NULL ORDER BY s.created_at DESC`
    );
    res.json({ status: "success", data: result.rows });
  } catch (error) {
    logger.error("listSuggestions error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getBin = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM suggestions WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC`
    );
    res.json({ status: "success", data: result.rows });
  } catch (error) {
    logger.error("getBin error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

const requireVcRole = (req, res) => {
  const roles = Array.isArray(req.user.role) ? req.user.role : [req.user.role];
  if (!roles.some(r => r === 'csa_vice_chair')) {
    res.status(404).json({ success: false, message: "Resource not found" });
    return false;
  }
  return true;
};

export const softDelete = async (req, res) => {
  if (!requireVcRole(req, res)) return;
  try {
    const { id } = req.params;
    const deletedBy = req.body?.deleted_by || req.user?.member_id || "unknown";

    const result = await pool.query(
      `UPDATE suggestions SET deleted_at = CURRENT_TIMESTAMP, deleted_by = $1 WHERE id = $2 AND deleted_at IS NULL RETURNING *`,
      [deletedBy, id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Suggestion not found or already deleted" });
    }

    res.json({ status: "success", data: result.rows[0] });
  } catch (error) {
    logger.error("softDelete error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const restoreFromBin = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE suggestions SET deleted_at = NULL, deleted_by = NULL WHERE id = $1 AND deleted_at IS NOT NULL RETURNING *`,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Suggestion not found in bin" });
    }

    res.json({ status: "success", data: result.rows[0] });
  } catch (error) {
    logger.error("restoreFromBin error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const permanentDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `DELETE FROM suggestions WHERE id = $1 AND deleted_at IS NOT NULL RETURNING *`,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Suggestion not found in bin" });
    }

    res.json({ status: "success", message: "Permanently deleted" });
  } catch (error) {
    logger.error("permanentDelete error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const clearBin = async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM suggestions WHERE deleted_at IS NOT NULL`
    );
    res.json({ status: "success", message: `Cleared ${result.rowCount} suggestion(s) from bin` });
  } catch (error) {
    logger.error("clearBin error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const requestUnmask = async (req, res) => {
  if (!requireVcRole(req, res)) return;
  try {
    const { id } = req.params;
    const chairToken = crypto.randomBytes(32).toString("hex");
    const liturgistToken = crypto.randomBytes(32).toString("hex");

    const result = await pool.query(
      `UPDATE suggestions SET chair_unmask_token = $1, liturgist_unmask_token = $2, unmask_requested_at = CURRENT_TIMESTAMP, status = 'unmask_requested' WHERE id = $3 RETURNING *`,
      [chairToken, liturgistToken, id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Suggestion not found" });
    }

    // Look up CSA Chair and Liturgist emails
    const roleQuery = `
      SELECT m.member_id, m.first_name, m.last_name, m.email, r.role_name
      FROM members m
      JOIN member_roles mr ON m.member_id = mr.member_id AND mr.status = 'approved'
      JOIN roles r ON mr.role_id = r.role_id
      WHERE r.role_name IN ('csa_chair', 'liturgist')
    `;
    const roleResult = await pool.query(roleQuery);

    const origin = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;
    const chairLink = `${origin}/suggestions/unmask/chair/${chairToken}`;
    const liturgistLink = `${origin}/suggestions/unmask/liturgist/${liturgistToken}`;

    let sent = 0;
    let failed = 0;

    for (const row of roleResult.rows) {
      const link = row.role_name === 'csa_chair' ? chairLink : liturgistLink;
      const roleLabel = row.role_name === 'csa_chair' ? 'CSA Chair' : 'CSA Liturgist';
      const subject = `Suggestion Box – Unmask Request Requires Your ${roleLabel} Approval`;
      const text = `A CSA Vice Chair has requested to unmask an anonymous suggestion.\n\n` +
        `To review and respond, click the link below:\n${link}\n\n` +
        `Both CSA Chair and CSA Liturgist must approve for the identity to be revealed.\n\n` +
        `This link is unique and valid for one use only.`;

      if (row.email) {
        try {
          await sendEmail(subject, text, row.email);
          sent++;
        } catch (err) {
          failed++;
          logger.error(`Failed to send unmask email to ${row.email} (${roleLabel}): ${err.message}`);
        }
      }
    }

    if (failed > 0) {
      logger.warn(`Unmask request #${id}: ${sent} email(s) sent, ${failed} failed`);
    }

    const message = failed > 0
      ? `Unmask request sent to ${sent} official(s), ${failed} failed — check server email config`
      : `Unmask request sent to ${sent} official(s)`;

    res.json({ status: "success", message });
  } catch (error) {
    logger.error("requestUnmask error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

const unmaskColumn = (role) =>
  role === "chair" ? "chair_unmask_token" : "liturgist_unmask_token";

const approverColumn = (role) =>
  role === "chair" ? "chair_approved" : "liturgist_approved";

export const getRoleUnmaskRequest = async (req, res) => {
  try {
    const { role, token } = req.params;
    if (!["chair", "liturgist"].includes(role)) {
      return res.status(400).json({ error: "role must be 'chair' or 'liturgist'" });
    }

    const col = unmaskColumn(role);
    const result = await pool.query(
      `${SUGGESTION_WITH_MEMBER} WHERE s.${col} = $1`,
      [token]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Invalid or expired token" });
    }

    res.json({ status: "success", role, data: result.rows[0] });
  } catch (error) {
    logger.error("getRoleUnmaskRequest error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const respondRoleUnmask = async (req, res) => {
  try {
    const { role, token } = req.params;
    const { action } = req.body;

    if (!["chair", "liturgist"].includes(role)) {
      return res.status(400).json({ error: "role must be 'chair' or 'liturgist'" });
    }
    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ error: "action must be 'approve' or 'reject'" });
    }

    const tokenCol = unmaskColumn(role);
    const approvedCol = approverColumn(role);

    if (action === "reject") {
      const result = await pool.query(
        `UPDATE suggestions SET status = 'rejected', chair_unmask_token = NULL, liturgist_unmask_token = NULL, chair_approved = FALSE, liturgist_approved = FALSE WHERE ${tokenCol} = $1 RETURNING *`,
        [token]
      );
      if (!result.rows.length) return res.status(404).json({ error: "Invalid or expired token" });
      return res.json({ status: "success", message: `Unmask rejected by ${role}`, data: result.rows[0] });
    }

    // Mark this role as approved
    const markResult = await pool.query(
      `UPDATE suggestions SET ${approvedCol} = TRUE WHERE ${tokenCol} = $1 RETURNING *`,
      [token]
    );
    if (!markResult.rows.length) return res.status(404).json({ error: "Invalid or expired token" });

    const row = markResult.rows[0];

    // Check if both have approved
    if (row.chair_approved && row.liturgist_approved) {
      // Both approved – fully unmask
      await pool.query(
        `UPDATE suggestions SET status = 'approved', chair_unmask_token = NULL, liturgist_unmask_token = NULL WHERE id = $1`,
        [row.id]
      );
      const finalResult = await pool.query(
        `${SUGGESTION_WITH_MEMBER} WHERE s.id = $1`,
        [row.id]
      );
      return res.json({ status: "success", message: "Unmask approved by both roles", data: finalResult.rows[0] });
    }

    // Only one so far – keep tokens active for the other
    res.json({ status: "success", message: `${role} approved, waiting for the other role`, data: row });
  } catch (error) {
    logger.error("respondRoleUnmask error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const replyToSuggestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;
    const repliedBy = req.user?.member_id || "admin";

    if (!reply || !reply.trim()) {
      return res.status(400).json({ error: "Reply text is required" });
    }

    const result = await pool.query(
      `UPDATE suggestions SET reply = $1, replied_at = CURRENT_TIMESTAMP, replied_by = $2, status = 'replied' WHERE id = $3 AND deleted_at IS NULL RETURNING *`,
      [reply.trim(), repliedBy, id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Suggestion not found" });
    }

    res.json({ status: "success", data: result.rows[0] });
  } catch (error) {
    logger.error("replyToSuggestion error:", error.message);
    res.status(500).json({ error: error.message });
  }
};
