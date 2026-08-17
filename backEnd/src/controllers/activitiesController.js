// src/controllers/activitiesController.js
import { db } from "../Configs/dbConfig.js";

export const getWeeklyActivities = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM weekly_activities ORDER BY sort_order ASC, id ASC`
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    await db.query("ROLLBACK").catch(() => {});
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─────────────────────────────────────────────
// JUMUIYA-SCOPED WEEKLY ACTIVITIES
// ─────────────────────────────────────────────

export const getJumuiyaWeeklyActivities = async (req, res) => {
  const { jumuiyaId } = req.params;
  const { all } = req.query;

  try {
    let query = `SELECT * FROM weekly_activities WHERE jumuiya_id = $1`;
    if (all !== 'true') {
      query += ` AND is_active = true`;
    }
    query += ` ORDER BY sort_order ASC, id ASC`;

    const result = await db.query(query, [jumuiyaId]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createJumuiyaWeeklyActivity = async (req, res) => {
  const { jumuiyaId } = req.params;
  const { day, time, activity, venue, fare } = req.body;

  if (!day || !activity) {
    return res.status(400).json({ success: false, error: "day and activity are required" });
  }

  try {
    const maxOrder = await db.query(
      `SELECT COALESCE(MAX(sort_order), 0) + 1 AS next FROM weekly_activities WHERE jumuiya_id = $1`,
      [jumuiyaId]
    );

    const result = await db.query(
      `INSERT INTO weekly_activities (jumuiya_id, day, time, activity, venue, fare, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [jumuiyaId, day, time || null, activity, venue || null, fare || null, maxOrder.rows[0].next]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateJumuiyaWeeklyActivity = async (req, res) => {
  const { id } = req.params;
  const { day, time, activity, venue, fare, is_active } = req.body;

  try {
    const result = await db.query(
      `UPDATE weekly_activities
       SET day = COALESCE($1, day),
           time = COALESCE($2, time),
           activity = COALESCE($3, activity),
           venue = COALESCE($4, venue),
           fare = COALESCE($5, fare),
           is_active = COALESCE($6, is_active)
       WHERE id = $7 RETURNING *`,
      [day, time, activity, venue, fare, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Record not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteJumuiyaWeeklyActivity = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `DELETE FROM weekly_activities WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Record not found" });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─────────────────────────────────────────────
// JUMUIYA-SCOPED SEMESTER ACTIVITIES
// ─────────────────────────────────────────────

export const getJumuiyaSemesterActivities = async (req, res) => {
  const { jumuiyaId } = req.params;
  const { all } = req.query;

  try {
    let query = `SELECT * FROM semester_activities WHERE jumuiya_id = $1`;
    if (all !== 'true') {
      query += ` AND is_active = true`;
    }
    query += ` ORDER BY date_time ASC, id ASC`;

    const result = await db.query(query, [jumuiyaId]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createJumuiyaSemesterActivity = async (req, res) => {
  const { jumuiyaId } = req.params;
  const { title, date_time, venue, description, fare } = req.body;

  if (!title || !date_time) {
    return res.status(400).json({ success: false, error: "title and date_time are required" });
  }

  try {
    const result = await db.query(
      `INSERT INTO semester_activities (jumuiya_id, title, date_time, venue, description, fare)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [jumuiyaId, title, date_time, venue || null, description || null, fare || null]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateJumuiyaSemesterActivity = async (req, res) => {
  const { id } = req.params;
  const { title, date_time, venue, description, fare, is_active } = req.body;

  try {
    const result = await db.query(
      `UPDATE semester_activities
       SET title = COALESCE($1, title),
           date_time = COALESCE($2, date_time),
           venue = COALESCE($3, venue),
           description = COALESCE($4, description),
           fare = COALESCE($5, fare),
           is_active = COALESCE($6, is_active)
       WHERE id = $7 RETURNING *`,
      [title, date_time, venue, description, fare, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Record not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteJumuiyaSemesterActivity = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `DELETE FROM semester_activities WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Record not found" });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createWeeklyActivity = async (req, res) => {
  console.log("[createWeekly] Request body:", req.body);
  const { day, time, activity, venue, fare, image_url } = req.body;

  if (!day || !time || !activity || !venue) {
    return res.status(400).json({
      success: false,
      error: "day, time, activity, and venue are required",
    });
  }

  try {
    const result = await db.query(
      `INSERT INTO weekly_activities (day, time, activity, venue, fare, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [day, time, activity, venue, fare || null, image_url || null]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error creating weekly activity:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateWeeklyActivity = async (req, res) => {
  const { id } = req.params;
  const { day, time, activity, venue, fare, image_url } = req.body;

  try {
    const result = await db.query(
      `UPDATE weekly_activities
       SET day=$1, time=$2, activity=$3, venue=$4, fare=$5, image_url=$6
       WHERE id=$7
       RETURNING *`,
      [day, time, activity, venue, fare || null, image_url || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Record not found",
      });
    }

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

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Record not found",
      });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Upload a custom image for a weekly activity (Cloudinary URL from multer)
export const uploadWeeklyImage = async (req, res) => {
  const { id } = req.params;

  if (!req.file?.path) {
    return res.status(400).json({
      success: false,
      error: "No image file uploaded",
    });
  }

  try {
    const result = await db.query(
      `UPDATE weekly_activities SET image_url=$1 WHERE id=$2 RETURNING *`,
      [req.file.path, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Record not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error uploading weekly activity image:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Remove the custom image for a weekly activity (falls back to public default)
export const removeWeeklyImage = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `UPDATE weekly_activities SET image_url=NULL WHERE id=$1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Record not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error removing weekly activity image:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// WEEKLY ACTIVITIES (ADMIN: activate/deactivate)
export const activateWeeklyActivity = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `UPDATE weekly_activities SET is_active=true WHERE id=$1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Record not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deactivateWeeklyActivity = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `UPDATE weekly_activities SET is_active=false WHERE id=$1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Record not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// reorder weekly activities safely
export const reorderWeeklyActivities = async (req, res) => {
  const { items } = req.body || {};

  if (!Array.isArray(items)) {
    return res.status(400).json({
      success: false,
      error: "items array is required",
    });
  }

  try {
    await db.query("BEGIN");

    for (const item of items) {
      if (!item?.id) continue;

      const sortOrder = Number(item.sort_order);
      if (!Number.isFinite(sortOrder)) continue;

      await db.query(
        `UPDATE weekly_activities SET sort_order=$1 WHERE id=$2`,
        [sortOrder, item.id]
      );
    }

    await db.query("COMMIT");

    const result = await db.query(
      `SELECT * FROM weekly_activities ORDER BY sort_order ASC, id ASC`
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    await db.query("ROLLBACK").catch(() => {});
    res.status(500).json({ success: false, error: error.message });
  }
};

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
  console.log("[createSemester] Request body:", req.body);
  const { title, date_time, venue, description, fare, image_url } = req.body;

  if (!title || !date_time || !venue) {
    return res.status(400).json({
      success: false,
      error: "title, date_time, and venue are required",
    });
  }

  try {
    const result = await db.query(
      `INSERT INTO semester_activities (title, date_time, venue, description, fare, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, date_time, venue, description || "", fare || null, image_url || null]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateSemesterActivity = async (req, res) => {
  const { id } = req.params;
  const { title, date_time, venue, description, fare, image_url } = req.body;

  try {
    const result = await db.query(
      `UPDATE semester_activities
       SET title=$1, date_time=$2, venue=$3, description=$4, fare=$5, image_url=$6
       WHERE id=$7
       RETURNING *`,
      [title, date_time, venue, description, fare || null, image_url || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Record not found",
      });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Upload a custom image for a semester event (Cloudinary URL from multer)
export const uploadSemesterImage = async (req, res) => {
  const { id } = req.params;

  if (!req.file?.path) {
    return res.status(400).json({
      success: false,
      error: "No image file uploaded",
    });
  }

  try {
    const result = await db.query(
      `UPDATE semester_activities SET image_url=$1 WHERE id=$2 RETURNING *`,
      [req.file.path, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Record not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error uploading semester activity image:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Remove the custom image for a semester event
export const removeSemesterImage = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `UPDATE semester_activities SET image_url=NULL WHERE id=$1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Record not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error removing semester activity image:", error.message);
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

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Record not found",
      });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
export const getEffectiveWeeklySchedule = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    // 1. check if a novena is active today
    const novena = await db.query(
      `SELECT *
       FROM novena_schedules
       WHERE is_active = true
       AND $1 BETWEEN start_date AND end_date
       ORDER BY start_date DESC
       LIMIT 1`,
      [today]
    );

    // 2. if novena exists → return override schedule
    if (novena.rows.length > 0) {
      const novenaId = novena.rows[0].id;

      const overrides = await db.query(
        `SELECT *
         FROM novena_override_activities
         WHERE novena_id = $1
         ORDER BY sort_order ASC, id ASC`,
        [novenaId]
      );

      return res.json({
        success: true,
        mode: "novena",
        novena: novena.rows[0],
        data: overrides.rows,
      });
    }

    // 3. fallback → weekly schedule
    const weekly = await db.query(
      `SELECT *
       FROM weekly_activities
       ORDER BY sort_order ASC, id ASC`
    );

    return res.json({
      success: true,
      mode: "weekly",
      data: weekly.rows,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
export const getNovenaSchedules = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM novena_schedules ORDER BY start_date ASC, id ASC`
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createNovenaSchedule = async (req, res) => {
  const { start_date, end_date, is_active } = req.body;

  if (!start_date || !end_date) {
    return res.status(400).json({
      success: false,
      error: "start_date and end_date are required",
    });
  }

  try {
    const result = await db.query(
      `INSERT INTO novena_schedules (start_date, end_date, is_active)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [start_date, end_date, is_active ?? true]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateNovenaSchedule = async (req, res) => {
  const { id } = req.params;
  const { start_date, end_date, is_active } = req.body;

  try {
    const result = await db.query(
      `UPDATE novena_schedules
       SET start_date=$1, end_date=$2, is_active=$3
       WHERE id=$4
       RETURNING *`,
      [start_date, end_date, is_active ?? true, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteNovenaSchedule = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `DELETE FROM novena_schedules WHERE id=$1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const activateNovenaSchedule = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `UPDATE novena_schedules SET is_active=true WHERE id=$1 RETURNING *`,
      [id]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deactivateNovenaSchedule = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `UPDATE novena_schedules SET is_active=false WHERE id=$1 RETURNING *`,
      [id]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getNovenaOverrides = async (req, res) => {
  const { novena_id } = req.query;

  try {
    const result = await db.query(
      `SELECT * FROM novena_override_activities
       WHERE novena_id=$1
       ORDER BY sort_order ASC, id ASC`,
      [novena_id]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createNovenaOverrideActivity = async (req, res) => {
  const { novena_id, day, time, activity, venue, is_active, sort_order } =
    req.body;

  if (!novena_id || !day || !time || !activity || !venue) {
    return res.status(400).json({
      success: false,
      error: "novena_id, day, time, activity, venue required",
    });
  }

  try {
    const result = await db.query(
      `INSERT INTO novena_override_activities
       (novena_id, day, time, activity, venue, is_active, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [
        novena_id,
        day,
        time,
        activity,
        venue,
        is_active ?? true,
        sort_order ?? 0,
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateNovenaOverrideActivity = async (req, res) => {
  const { id } = req.params;
  const { day, time, activity, venue, is_active } = req.body;

  try {
    const result = await db.query(
      `UPDATE novena_override_activities
       SET day=$1, time=$2, activity=$3, venue=$4, is_active=$5
       WHERE id=$6
       RETURNING *`,
      [day, time, activity, venue, is_active ?? true, id]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteNovenaOverrideActivity = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `DELETE FROM novena_override_activities WHERE id=$1 RETURNING *`,
      [id]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const activateSemesterActivity = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `UPDATE semester_activities SET is_active=true WHERE id=$1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Record not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deactivateSemesterActivity = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `UPDATE semester_activities SET is_active=false WHERE id=$1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Record not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const reorderNovenaOverrides = async (req, res) => {
  const { items } = req.body || {};

  if (!Array.isArray(items)) {
    return res.status(400).json({
      success: false,
      error: "items array is required",
    });
  }

  try {
    await db.query("BEGIN");

    for (const item of items) {
      if (!item?.id) continue;

      const sortOrder = Number(item.sort_order);
      if (!Number.isFinite(sortOrder)) continue;

      await db.query(
        `UPDATE novena_override_activities SET sort_order=$1 WHERE id=$2`,
        [sortOrder, item.id]
      );
    }

    await db.query("COMMIT");

    const result = await db.query(
      `SELECT * FROM novena_override_activities ORDER BY sort_order ASC, id ASC`
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    await db.query("ROLLBACK").catch(() => {});
    res.status(500).json({ success: false, error: error.message });
  }
};
