// src/controllers/activitiesController.js
import { db } from "../Configs/dbConfig.js";

// ─── Weekly Activities ─────────────────────────────────────────────

export const getWeeklyActivities = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM weekly_activities ORDER BY id ASC`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching weekly activities:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createWeeklyActivity = async (req, res) => {
  const { day, time, activity, venue } = req.body;
  if (!day || !time || !activity || !venue) {
    return res.status(400).json({ success: false, error: "All fields are required: day, time, activity, venue" });
  }
  try {
    const result = await db.query(
      `INSERT INTO weekly_activities (day, time, activity, venue) VALUES ($1, $2, $3, $4) RETURNING *`,
      [day, time, activity, venue]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error creating weekly activity:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateWeeklyActivity = async (req, res) => {
  const { id } = req.params;
  const { day, time, activity, venue } = req.body;
  try {
    const result = await db.query(
      `UPDATE weekly_activities SET day=$1, time=$2, activity=$3, venue=$4 WHERE id=$5 RETURNING *`,
      [day, time, activity, venue, id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, error: "Record not found" });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteWeeklyActivity = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `DELETE FROM weekly_activities WHERE id=$1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, error: "Record not found" });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── Semester Activities ───────────────────────────────────────────

export const getSemesterActivities = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM semester_activities ORDER BY date_time ASC`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching semester activities:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createSemesterActivity = async (req, res) => {
  const { title, date_time, venue, description } = req.body;
  if (!title || !date_time || !venue) {
    return res.status(400).json({ success: false, error: "title, date_time, and venue are required" });
  }
  try {
    const result = await db.query(
      `INSERT INTO semester_activities (title, date_time, venue, description) VALUES ($1, $2, $3, $4) RETURNING *`,
      [title, date_time, venue, description || ""]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error creating semester activity:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateSemesterActivity = async (req, res) => {
  const { id } = req.params;
  const { title, date_time, venue, description } = req.body;
  try {
    const result = await db.query(
      `UPDATE semester_activities SET title=$1, date_time=$2, venue=$3, description=$4 WHERE id=$5 RETURNING *`,
      [title, date_time, venue, description, id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, error: "Record not found" });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteSemesterActivity = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `DELETE FROM semester_activities WHERE id=$1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, error: "Record not found" });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};