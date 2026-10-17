import { db } from "../Configs/dbConfig.js";

const NAME_EXPR = `COALESCE(NULLIF(TRIM(COALESCE(m.first_name, '') || ' ' || COALESCE(m.last_name, '')), ''), l.member_id)`;
const JUMUIYA_EXPR = `(SELECT sg.name FROM sub_groups sg
    WHERE sg.group_id::text = m.jumuiya_id::text OR LOWER(sg.slug) = LOWER(m.jumuiya_id::text)
    LIMIT 1)`;

// A session is a member's time on the system, estimated as the gap between
// their most recent login and their most recent recorded activity. Capped at
// the 20h refresh-token lifetime; anything outside that is reported as unknown.
const SESSION_CAP_SECONDS = 20 * 60 * 60;
const approxSessionSeconds = (lastLogin, lastSeen) => {
  if (!lastLogin || !lastSeen) return null;
  const seconds = (new Date(lastSeen).getTime() - new Date(lastLogin).getTime()) / 1000;
  if (seconds <= 0 || seconds > SESSION_CAP_SECONDS) return null;
  return Math.round(seconds);
};

// Overall sign-in counters plus the members who appear to be struggling.
export const getSignInSummary = async (_req, res) => {
  try {
    const statsRes = await db.query(`
      SELECT
        (COUNT(*) FILTER (WHERE action = 'login_success'))::int                 AS total_logins,
        (COUNT(DISTINCT member_id) FILTER (WHERE action = 'login_success'))::int AS distinct_members,
        (COUNT(*) FILTER (WHERE action = 'login_failed_unknown'))::int          AS failed_unknown,
        (COUNT(*) FILTER (WHERE action = 'login_failed_wrong_password'))::int   AS failed_wrong_password,
        (COUNT(*) FILTER (WHERE action LIKE 'login_%locked'))::int              AS lockouts,
        (COUNT(*) FILTER (WHERE action = 'logout'))::int                        AS logouts,
        (COUNT(*) FILTER (WHERE action = 'password_changed'))::int              AS password_changes
      FROM login_audit_log
    `);

    const strugglingRes = await db.query(`
      SELECT
        l.member_id,
        ${NAME_EXPR} AS name,
        (COUNT(*) FILTER (WHERE l.action LIKE 'login_failed%'))::int AS failed,
        (COUNT(*) FILTER (WHERE l.action LIKE 'login_%locked'))::int AS lockouts,
        MAX(l.created_at) AS last_event_at,
        MAX(l.created_at) FILTER (WHERE l.action = 'login_success') AS last_login,
        (m.member_id IS NOT NULL) AS is_member,
        m.email,
        m.locked_until,
        m.last_seen_at
      FROM login_audit_log l
      LEFT JOIN members m ON m.member_id = l.member_id
      WHERE l.action IN ('login_failed_unknown', 'login_failed_wrong_password',
                         'login_blocked_locked', 'login_account_locked')
      GROUP BY l.member_id, m.first_name, m.last_name, m.member_id, m.email, m.locked_until, m.last_seen_at
      ORDER BY failed DESC, last_event_at DESC
      LIMIT 100
    `);

    const now = Date.now();
    const struggling = strugglingRes.rows
      .map((r) => {
        const locked = r.locked_until ? new Date(r.locked_until).getTime() > now : false;
        const neverSignedIn = !r.last_login;
        const failingAfterSuccess =
          r.last_login && r.last_event_at && new Date(r.last_event_at) > new Date(r.last_login);
        return {
          member_id: r.member_id,
          name: r.name,
          failed: r.failed,
          lockouts: r.lockouts,
          last_event_at: r.last_event_at,
          last_login: r.last_login,
          is_member: r.is_member,
          email: r.email,
          locked,
          never_signed_in: neverSignedIn,
          needs_help: locked || neverSignedIn || failingAfterSuccess,
        };
      })
      .filter((r) => r.needs_help)
      .slice(0, 50);

    return res.json({
      stats: statsRes.rows[0],
      struggling,
    });
  } catch (error) {
    console.error("[loginAudit] summary error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to load sign-in summary" });
  }
};

// Per-member rollup: login counts, first/last login, last activity, password
// changes and account status. Paginated + searchable.
export const getMemberSignInRollup = async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 30, 1), 200);
    const offset = Math.max(Number(req.query.offset) || 0, 0);

    const where = [];
    const params = [];
    if (req.query.search) {
      params.push(`%${req.query.search}%`);
      const ph = `$${params.length}`;
      where.push(
        `(l.member_id ILIKE ${ph} OR m.first_name ILIKE ${ph} OR m.last_name ILIKE ${ph} OR m.email ILIKE ${ph})`
      );
    }
    if (req.query.onlyIncomplete === "true") {
      where.push(`(m.email IS NULL OR m.email = '')`);
    }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const listPromise = db.query(
      `SELECT
         l.member_id,
         ${NAME_EXPR} AS name,
         ${JUMUIYA_EXPR} AS jumuiya_name,
         (COUNT(*) FILTER (WHERE l.action = 'login_success'))::int AS logins,
         (COUNT(*) FILTER (WHERE l.action LIKE 'login_failed%'))::int AS failed,
         (COUNT(*) FILTER (WHERE l.action LIKE 'login_%locked'))::int AS lockouts,
         MIN(l.created_at) FILTER (WHERE l.action = 'login_success') AS first_login,
         MAX(l.created_at) FILTER (WHERE l.action = 'login_success') AS last_login,
         MAX(l.created_at) FILTER (WHERE l.action = 'logout') AS last_logout,
         MAX(l.created_at) FILTER (WHERE l.action = 'password_changed') AS password_changed_at,
         m.last_seen_at,
         m.email,
         m.locked_until
       FROM login_audit_log l
       LEFT JOIN members m ON m.member_id = l.member_id
       ${whereSql}
       GROUP BY l.member_id, m.first_name, m.last_name, m.jumuiya_id, m.last_seen_at, m.email, m.locked_until
       ORDER BY MAX(l.created_at) FILTER (WHERE l.action = 'login_success') DESC NULLS LAST, l.member_id
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    const countPromise = db.query(
      `SELECT COUNT(DISTINCT l.member_id)::int AS total
       FROM login_audit_log l
       LEFT JOIN members m ON m.member_id = l.member_id
       ${whereSql}`,
      params
    );

    const [listRes, countRes] = await Promise.all([listPromise, countPromise]);
    const now = Date.now();

    const data = listRes.rows.map((r) => ({
      ...r,
      locked: r.locked_until ? new Date(r.locked_until).getTime() > now : false,
      setup_complete: Boolean(r.email) && Boolean(r.password_changed_at),
      approx_session_seconds: approxSessionSeconds(r.last_login, r.last_seen_at),
    }));

    return res.json({ data, total: countRes.rows[0].total, limit, offset });
  } catch (error) {
    console.error("[loginAudit] rollup error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to load member sign-in summary" });
  }
};

// Chronological sign-in event feed (logins, failures, lockouts, logouts,
// password changes). Paginated + filterable.
export const getLoginEvents = async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 40, 1), 200);
    const offset = Math.max(Number(req.query.offset) || 0, 0);

    const where = [];
    const params = [];
    const add = (clause, value) => {
      params.push(value);
      const ph = `$${params.length}`;
      where.push(clause.replace(/\?/g, ph));
    };

    if (req.query.action) add(`l.action = ?`, req.query.action);
    if (req.query.search) {
      add(
        `(l.member_id ILIKE ? OR l.email ILIKE ? OR ${NAME_EXPR} ILIKE ? OR l.ip_address ILIKE ?)`,
        `%${req.query.search}%`
      );
    }
    if (req.query.dateFrom) add(`l.created_at >= ?`, req.query.dateFrom);
    if (req.query.dateTo) add(`l.created_at <= ?`, `${req.query.dateTo} 23:59:59`);

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const listPromise = db.query(
      `SELECT l.id, l.member_id, l.email, l.action, l.ip_address, l.user_agent, l.details, l.created_at,
              ${NAME_EXPR} AS name
       FROM login_audit_log l
       LEFT JOIN members m ON m.member_id = l.member_id
       ${whereSql}
       ORDER BY l.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );
    const countPromise = db.query(
      `SELECT COUNT(*)::int AS total
       FROM login_audit_log l
       LEFT JOIN members m ON m.member_id = l.member_id
       ${whereSql}`,
      params
    );
    const actionsPromise = db.query(`SELECT DISTINCT action FROM login_audit_log ORDER BY action`);

    const [listRes, countRes, actionsRes] = await Promise.all([listPromise, countPromise, actionsPromise]);
    return res.json({
      data: listRes.rows,
      total: countRes.rows[0].total,
      limit,
      offset,
      actions: actionsRes.rows.map((r) => r.action),
    });
  } catch (error) {
    console.error("[loginAudit] events error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to load sign-in events" });
  }
};
