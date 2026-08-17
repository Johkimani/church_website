import { db as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

const VALID_TYPES = ["weekly", "semester"];

const memberIdOf = (user) => user?.member_id || user?.id;

const activityTable = (type) => (type === "weekly" ? "weekly_activities" : "semester_activities");

export const setRsvp = async (req, res) => {
  const { activity_type, activity_id, going } = req.body;
  const memberId = memberIdOf(req.user);

  if (!VALID_TYPES.includes(activity_type) || !activity_id) {
    return res.status(400).json({ error: "activity_type and activity_id are required" });
  }

  try {
    const table = activityTable(activity_type);
    const act = await pool.query(`SELECT 1 FROM ${table} WHERE id = $1`, [activity_id]);
    if (act.rows.length === 0) {
      return res.status(404).json({ error: "Activity not found" });
    }

    const isGoing = going === true || going === "true" || going === 1;
    const name = `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim();

    if (isGoing) {
      await pool.query(
        `INSERT INTO activity_rsvps (activity_type, activity_id, member_id, member_name, going)
         VALUES ($1, $2, $3, $4, TRUE)
         ON CONFLICT (activity_type, activity_id, member_id)
         DO UPDATE SET going = TRUE, member_name = EXCLUDED.member_name, updated_at = CURRENT_TIMESTAMP`,
        [activity_type, activity_id, memberId, name]
      );
    } else {
      // "Not going" removes the RSVP entirely so counts stay accurate.
      await pool.query(
        `DELETE FROM activity_rsvps
         WHERE activity_type = $1 AND activity_id = $2 AND member_id = $3`,
        [activity_type, activity_id, memberId]
      );
    }

    const cnt = await pool.query(
      `SELECT COUNT(*)::int AS going
       FROM activity_rsvps
       WHERE activity_type = $1 AND activity_id = $2 AND going = TRUE`,
      [activity_type, activity_id]
    );

    res.json({
      success: true,
      data: { activity_type, activity_id, going: isGoing, count: cnt.rows[0].going },
    });
  } catch (err) {
    logger.error("setRsvp error:", err.message);
    res.status(500).json({ error: "Failed to update RSVP" });
  }
};

export const getRsvpCounts = async (req, res) => {
  try {
    const type = req.query.activity_type;
    const useType = VALID_TYPES.includes(type);
    const where = useType ? "WHERE activity_type = $1" : "";
    const params = useType ? [type] : [];

    const result = await pool.query(
      `SELECT activity_type, activity_id, COUNT(*)::int AS going_count
       FROM activity_rsvps
       ${where}
       GROUP BY activity_type, activity_id`,
      params
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    logger.error("getRsvpCounts error:", err.message);
    res.status(500).json({ error: "Failed to load RSVP counts" });
  }
};

export const getMyRsvps = async (req, res) => {
  const memberId = memberIdOf(req.user);
  try {
    const result = await pool.query(
      `SELECT activity_type, activity_id, going
       FROM activity_rsvps
       WHERE member_id = $1`,
      [memberId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    logger.error("getMyRsvps error:", err.message);
    res.status(500).json({ error: "Failed to load RSVPs" });
  }
};

export const getRsvpList = async (req, res) => {
  const { activity_type, activity_id } = req.query;
  if (!VALID_TYPES.includes(activity_type) || !activity_id) {
    return res.status(400).json({ error: "activity_type and activity_id are required" });
  }

  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 500);
    const offset = Math.max(Number(req.query.offset) || 0, 0);

    const countRes = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM activity_rsvps
       WHERE activity_type = $1 AND activity_id = $2 AND going = TRUE`,
      [activity_type, activity_id]
    );

    const result = await pool.query(
      `SELECT r.member_id, r.member_name,
              COALESCE(m.jumuiya_id::text, '') AS jumuiya_id,
              sg.name AS jumuiya_name,
              r.created_at
       FROM activity_rsvps r
       LEFT JOIN members m ON m.member_id = r.member_id
       LEFT JOIN sub_groups sg ON sg.group_id::text = m.jumuiya_id::text
       WHERE r.activity_type = $1 AND r.activity_id = $2 AND r.going = TRUE
       ORDER BY r.created_at DESC
       LIMIT $3 OFFSET $4`,
      [activity_type, activity_id, limit, offset]
    );

    res.json({
      success: true,
      data: result.rows,
      total: countRes.rows[0].total,
      limit,
      offset,
    });
  } catch (err) {
    logger.error("getRsvpList error:", err.message);
    res.status(500).json({ error: "Failed to load RSVP list" });
  }
};
