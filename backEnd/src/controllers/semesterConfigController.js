// src/controllers/semesterConfigController.js
// CSA chair sets the current semester window (start/end dates). Everything that
// depends on "which semester is it now" (tally windows, member registration,
// jumuiya meeting-day schedule) reads from this single source of truth.
import { testDb as pool, withTransaction } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";
import { getCurrentSemester } from "../utils/semesterConfig.js";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const normalizeDate = (str) => {
  if (typeof str !== "string" || !DATE_RE.test(str)) return null;
  const [y, m, d] = str.split("-").map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return str;
};

// GET /semester — public read of the current semester window.
export const getSemester = async (req, res) => {
  try {
    const semester = await getCurrentSemester();
    res.json({ success: true, data: semester });
  } catch (error) {
    logger.error("getSemester error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT /semester — CSA chair sets a new current semester. The previous current
// row stays in the table for reference (is_current flips to false).
export const setSemester = async (req, res) => {
  const { label, start_date, end_date } = req.body || {};
  const start = normalizeDate(start_date);
  const end = normalizeDate(end_date);
  if (!start || !end) {
    return res.status(400).json({ success: false, error: "Valid start_date and end_date (YYYY-MM-DD) are required" });
  }
  if (start > end) {
    return res.status(400).json({ success: false, error: "start_date must be on or before end_date" });
  }
  if (end < new Date().toISOString().slice(0, 10)) {
    return res.status(400).json({ success: false, error: "end_date is in the past. Set the current semester so its end date is today or later." });
  }

  const createdBy = [req.user?.firstName, req.user?.lastName].filter(Boolean).join(" ") || req.user?.id || "";
  const semesterLabel = String(label || "").trim().slice(0, 60);

  try {
    const row = await withTransaction(async (client) => {
      await client.query(`UPDATE semester_configs SET is_current = false WHERE is_current = true`);
      const result = await client.query(
        `INSERT INTO semester_configs (label, start_date, end_date, is_current, created_by)
         VALUES ($1, $2, $3, true, $4)
         RETURNING id, label, to_char(start_date, 'YYYY-MM-DD') AS start_date,
                   to_char(end_date, 'YYYY-MM-DD') AS end_date, is_current, created_by`,
        [semesterLabel, start, end, createdBy]
      );
      return result.rows[0];
    });
    logger.info(`Semester set by ${createdBy || "unknown"}: "${semesterLabel}" ${start} → ${end}`);
    res.json({ success: true, data: row });
  } catch (error) {
    logger.error("setSemester error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};
