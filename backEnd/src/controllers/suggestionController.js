import { db as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";
import crypto from "crypto";

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

export const softDelete = async (req, res) => {
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
  try {
    const { id } = req.params;
    const token = crypto.randomBytes(32).toString("hex");

    const result = await pool.query(
      `UPDATE suggestions SET unmask_token = $1, unmask_requested_at = CURRENT_TIMESTAMP, status = 'unmask_requested' WHERE id = $2 RETURNING *`,
      [token, id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Suggestion not found" });
    }

    res.json({ status: "success", token, data: result.rows[0] });
  } catch (error) {
    logger.error("requestUnmask error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getUnmaskRequest = async (req, res) => {
  try {
    const { token } = req.params;
    const result = await pool.query(
      `SELECT id, name, email, suggestion, created_at, status FROM suggestions WHERE unmask_token = $1`,
      [token]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Invalid or expired token" });
    }

    res.json({ status: "success", data: result.rows[0] });
  } catch (error) {
    logger.error("getUnmaskRequest error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const respondToUnmask = async (req, res) => {
  try {
    const { token } = req.params;
    const { action } = req.body;

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ error: "action must be 'approve' or 'reject'" });
    }

    if (action === "approve") {
      const result = await pool.query(
        `UPDATE suggestions SET status = 'approved', unmask_token = NULL WHERE unmask_token = $1 RETURNING *`,
        [token]
      );
      if (!result.rows.length) return res.status(404).json({ error: "Invalid or expired token" });
      return res.json({ status: "success", message: "Unmask approved", data: result.rows[0] });
    }

    const result = await pool.query(
      `UPDATE suggestions SET status = 'rejected', unmask_token = NULL WHERE unmask_token = $1 RETURNING *`,
      [token]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Invalid or expired token" });
    res.json({ status: "success", message: "Unmask rejected", data: result.rows[0] });
  } catch (error) {
    logger.error("respondToUnmask error:", error.message);
    res.status(500).json({ error: error.message });
  }
};
