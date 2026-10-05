import { Router } from "express";
import { db as pool } from "../../Configs/dbConfig.js";
import { verifyToken } from "../../middlewares/Tokens.js";
import { requireRole } from "../../middlewares/requireRole.js";
import logger from "../../logger/winston.js";

const router = Router();

/**
 * GET /api/v1/serial-config
 * Returns the current serial config (next_serial, updated_at).
 * Accessible to CSA Secretary and CSA Chair.
 */
router.get(
  "/",
  verifyToken,
  requireRole("csa_secretary", "csa_chair"),
  async (req, res) => {
    try {
      const { rows } = await pool.query(
        "SELECT id, next_serial, updated_at FROM serial_config WHERE id = 1"
      );
      if (rows.length === 0) {
        return res.json({ success: true, data: { next_serial: 1 } });
      }
      res.json({ success: true, data: rows[0] });
    } catch (error) {
      logger.error("Error fetching serial config: " + error.message);
      res.status(500).json({ success: false, error: "Failed to fetch serial config" });
    }
  }
);

/**
 * PATCH /api/v1/serial-config
 * Update the next_serial seed value.
 * Accessible to CSA Secretary and CSA Chair.
 */
router.patch(
  "/",
  verifyToken,
  requireRole("csa_secretary", "csa_chair"),
  async (req, res) => {
    try {
      const { next_serial } = req.body;
      if (next_serial == null || !Number.isInteger(next_serial) || next_serial < 1) {
        return res.status(400).json({
          success: false,
          error: "next_serial must be a positive integer",
        });
      }

      // Ensure the singleton row exists
      await pool.query(
        "INSERT INTO serial_config (id, next_serial) VALUES (1, $1) ON CONFLICT (id) DO UPDATE SET next_serial = $1, updated_at = CURRENT_TIMESTAMP",
        [next_serial]
      );

      const { rows } = await pool.query(
        "SELECT id, next_serial, updated_at FROM serial_config WHERE id = 1"
      );

      logger.info(`Serial config updated: next_serial = ${next_serial} by ${req.user?.name || req.user?.id}`);
      res.json({ success: true, data: rows[0] });
    } catch (error) {
      logger.error("Error updating serial config: " + error.message);
      res.status(500).json({ success: false, error: "Failed to update serial config" });
    }
  }
);

export default router;
