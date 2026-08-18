import { db } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

export const getPracticeSchedules = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const result = await db.query(
      `SELECT id, module_id, day, start_time, end_time, location, sort_order
       FROM hub_practice_schedules
       WHERE module_id = $1 AND is_active = true
       ORDER BY sort_order, id`,
      [moduleId]
    );
    res.json(result.rows);
  } catch (error) {
    logger.error("Error fetching practice schedules: " + error.message);
    res.status(500).json({ error: "Failed to fetch practice schedules" });
  }
};

export const createPracticeSchedule = async (req, res) => {
  try {
    const { module_id, day, start_time, end_time, location, sort_order } = req.body;
    if (!module_id || !day || !start_time || !end_time || !location) {
      return res.status(400).json({ error: "module_id, day, start_time, end_time, and location are required" });
    }
    const result = await db.query(
      `INSERT INTO hub_practice_schedules (module_id, day, start_time, end_time, location, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [module_id, day, start_time, end_time, location, sort_order || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    logger.error("Error creating practice schedule: " + error.message);
    res.status(500).json({ error: "Failed to create practice schedule" });
  }
};

export const updatePracticeSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { day, start_time, end_time, location, sort_order } = req.body;
    const result = await db.query(
      `UPDATE hub_practice_schedules
       SET day = COALESCE($1, day),
           start_time = COALESCE($2, start_time),
           end_time = COALESCE($3, end_time),
           location = COALESCE($4, location),
           sort_order = COALESCE($5, sort_order)
       WHERE id = $6 RETURNING *`,
      [day, start_time, end_time, location, sort_order, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Schedule not found" });
    res.json(result.rows[0]);
  } catch (error) {
    logger.error("Error updating practice schedule: " + error.message);
    res.status(500).json({ error: "Failed to update practice schedule" });
  }
};

export const deletePracticeSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `DELETE FROM hub_practice_schedules WHERE id = $1 RETURNING id`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Schedule not found" });
    res.json({ message: "Deleted" });
  } catch (error) {
    logger.error("Error deleting practice schedule: " + error.message);
    res.status(500).json({ error: "Failed to delete practice schedule" });
  }
};
