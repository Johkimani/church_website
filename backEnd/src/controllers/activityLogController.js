import { db } from "../Configs/dbConfig.js";

const LOG_COLUMNS = `id, actor_id, actor_name, actor_role, jumuiya_id, jumuiya_name,
    action, entity_type, entity_id, details, ip_address, created_at`;

// Paginated, filterable listing of admin actions.
export const getActivityLogs = async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 30, 1), 200);
    const offset = Math.max(Number(req.query.offset) || 0, 0);

    const where = [];
    const params = [];
    const add = (clause, value) => {
      params.push(value);
      where.push(clause.replace("?", `$${params.length}`));
    };

    if (req.query.search) {
      add(`(actor_name ILIKE ? OR actor_role ILIKE ? OR action ILIKE ? OR jumuiya_name ILIKE ?)`, `%${req.query.search}%`);
    }
    if (req.query.action) add(`action = ?`, req.query.action);
    if (req.query.jumuiya_id) add(`(jumuiya_id = ? OR jumuiya_name ILIKE ?)`, req.query.jumuiya_id);
    if (req.query.role) add(`actor_role ILIKE ?`, `%${req.query.role}%`);
    if (req.query.dateFrom) add(`created_at >= ?`, req.query.dateFrom);
    if (req.query.dateTo) add(`created_at <= ?`, `${req.query.dateTo} 23:59:59`);

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const listPromise = db.query(
      `SELECT ${LOG_COLUMNS} FROM activity_logs
       ${whereSql}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );
    const countPromise = db.query(
      `SELECT COUNT(*)::int AS total FROM activity_logs ${whereSql}`,
      params
    );

    const [listRes, countRes] = await Promise.all([listPromise, countPromise]);
    return res.json({
      data: listRes.rows,
      total: countRes.rows[0].total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("[activityLog] list error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to load activity logs" });
  }
};

// Distinct values for the filter dropdowns (actions, jumuiya names, roles).
export const getActivityLogFilters = async (req, res) => {
  try {
    const [actionsRes, jumuiyasRes, rolesRes] = await Promise.all([
      db.query(`SELECT DISTINCT action FROM activity_logs ORDER BY action`),
      db.query(
        `SELECT DISTINCT jumuiya_id, jumuiya_name FROM activity_logs
         WHERE jumuiya_id IS NOT NULL OR jumuiya_name IS NOT NULL ORDER BY jumuiya_name`
      ),
      db.query(`SELECT DISTINCT actor_role FROM activity_logs WHERE actor_role IS NOT NULL ORDER BY actor_role`),
    ]);
    return res.json({
      actions: actionsRes.rows.map((r) => r.action),
      jumuiyas: jumuiyasRes.rows,
      roles: rolesRes.rows.map((r) => r.actor_role),
    });
  } catch (error) {
    console.error("[activityLog] filters error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to load log filters" });
  }
};

// Clear/Purge all activity logs (restricted to overseers)
export const clearActivityLogs = async (req, res) => {
  try {
    await db.query("TRUNCATE TABLE activity_logs RESTART IDENTITY");
    return res.json({ success: true, message: "Activity logs cleared successfully" });
  } catch (error) {
    console.error("[activityLog] clear error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to clear activity logs" });
  }
};
