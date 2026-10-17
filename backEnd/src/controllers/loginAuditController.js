import { db } from "../Configs/dbConfig.js";

const NAME_EXPR = `COALESCE(NULLIF(TRIM(COALESCE(m.first_name, '') || ' ' || COALESCE(m.last_name, '')), ''), l.member_id)`;
const JUMUIYA_EXPR = `(SELECT sg.name FROM sub_groups sg
    WHERE sg.group_id::text = m.jumuiya_id::text OR LOWER(sg.slug) = LOWER(m.jumuiya_id::text)
    LIMIT 1)`;

// Active-roster predicate. Mirrors the admin dashboard's "total members"
// definition (jumuiyaMemberController.getBatchStatistics) so the sign-in
// numbers reconcile with the member counts shown everywhere else.
const ACTIVE_SCOPE = `(m.migrated_to_associates IS NULL OR m.migrated_to_associates = false)
    AND (m.flagged_inactive IS NULL OR m.flagged_inactive = false)
    AND m.source IN ('jum', 'csa')`;

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

// Optional jumuiya scope shared by all three endpoints. members.jumuiya_id holds
// the sub_groups.group_id UUID, so compare as text (and tolerate a stray slug).
const jumuiyaWhere = (params, jumuiyaId) => {
  if (!jumuiyaId) return "";
  params.push(String(jumuiyaId));
  return `m.jumuiya_id::text = $${params.length}`;
};

// Overall sign-in counters plus the members who appear to be struggling.
export const getSignInSummary = async (req, res) => {
  try {
    const statsParams = [];
    const statsScope = jumuiyaWhere(statsParams, req.query.jumuiya_id);
    const statsPromise = db.query(
      `SELECT
        (COUNT(*) FILTER (WHERE l.action = 'login_success'))::int                 AS total_logins,
        (COUNT(DISTINCT l.member_id) FILTER (WHERE l.action = 'login_success'))::int AS distinct_members,
        (COUNT(*) FILTER (WHERE l.action = 'login_failed_unknown'))::int          AS failed_unknown,
        (COUNT(*) FILTER (WHERE l.action = 'login_failed_wrong_password'))::int   AS failed_wrong_password,
        (COUNT(*) FILTER (WHERE l.action LIKE 'login_%locked'))::int              AS lockouts,
        (COUNT(*) FILTER (WHERE l.action = 'logout'))::int                        AS logouts,
        (COUNT(*) FILTER (WHERE l.action = 'password_changed'))::int              AS password_changes
       FROM login_audit_log l
       LEFT JOIN members m ON m.member_id = l.member_id
       ${statsScope ? `WHERE ${statsScope}` : ""}`,
      statsParams
    );

    const strugglingParams = [];
    const strugglingScope = jumuiyaWhere(strugglingParams, req.query.jumuiya_id);
    const strugglingPromise = db.query(
      `SELECT
        l.member_id,
        ${NAME_EXPR} AS name,
        (COUNT(*) FILTER (WHERE l.action LIKE 'login_failed%'))::int AS failed,
        (COUNT(*) FILTER (WHERE l.action LIKE 'login_%locked'))::int AS lockouts,
        MAX(l.created_at) AS last_event_at,
        MAX(l.created_at) FILTER (WHERE l.action = 'login_success') AS last_login,
        (m.member_id IS NOT NULL) AS is_member,
        m.email,
        m.phone,
        m.locked_until,
        m.last_seen_at,
        ${JUMUIYA_EXPR} AS jumuiya_name
       FROM login_audit_log l
       LEFT JOIN members m ON m.member_id = l.member_id
       WHERE l.action IN ('login_failed_unknown', 'login_failed_wrong_password',
                          'login_blocked_locked', 'login_account_locked')
       ${strugglingScope ? `AND ${strugglingScope}` : ""}
       GROUP BY l.member_id, m.first_name, m.last_name, m.member_id, m.email, m.phone, m.locked_until, m.last_seen_at, m.jumuiya_id
       ORDER BY failed DESC, last_event_at DESC
       LIMIT 100`,
      strugglingParams
    );

    const jumuiyasPromise = db.query(
      // St. Thomas Aquinas is the patron of the CSA family, not a jumuiya, so
      // it never appears as a filter option.
      `SELECT group_id::text AS jumuiya_id, name AS jumuiya_name
       FROM sub_groups
       WHERE name <> 'St. Thomas Aquinas' AND LOWER(COALESCE(slug, '')) <> 'st-thomas'
       ORDER BY name ASC`
    );

    // Roster-based counts so "Members who signed in" + "Never signed in" add up
    // to the dashboard's total members for the same scope.
    const rosterParams = [];
    const rosterScope = jumuiyaWhere(rosterParams, req.query.jumuiya_id);
    const rosterPromise = db.query(
      `SELECT
         COUNT(*)::int AS total_members,
         COUNT(*) FILTER (WHERE EXISTS (
           SELECT 1 FROM login_audit_log l
           WHERE l.member_id = m.member_id AND l.action = 'login_success'
         ))::int AS members_signed_in
       FROM members m
       WHERE ${ACTIVE_SCOPE}
       ${rosterScope ? `AND ${rosterScope}` : ""}`,
      rosterParams
    );

    const [statsRes, strugglingRes, jumuiyasRes, rosterRes] = await Promise.all([
      statsPromise,
      strugglingPromise,
      jumuiyasPromise,
      rosterPromise,
    ]);

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
          phone: r.phone,
          jumuiya_name: r.jumuiya_name,
          locked,
          never_signed_in: neverSignedIn,
          needs_help: locked || neverSignedIn || failingAfterSuccess,
        };
      })
      .filter((r) => r.needs_help)
      .slice(0, 50);

    const eventStats = statsRes.rows[0] || {};
    const roster = rosterRes.rows[0] || { total_members: 0, members_signed_in: 0 };
    const stats = {
      ...eventStats,
      total_members: roster.total_members,
      members_signed_in: roster.members_signed_in,
      never_signed_in: Math.max(0, roster.total_members - roster.members_signed_in),
    };

    return res.json({
      stats,
      struggling,
      jumuiyas: jumuiyasRes.rows,
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
    // Upper bound is generous so the "Share list" action can pull the whole
    // filtered roster (up to ~1000) in one request.
    const limit = Math.min(Math.max(Number(req.query.limit) || 30, 1), 1000);
    const offset = Math.max(Number(req.query.offset) || 0, 0);

    const where = [ACTIVE_SCOPE];
    const params = [];
    const jScope = jumuiyaWhere(params, req.query.jumuiya_id);
    if (jScope) where.push(jScope);
    if (req.query.search) {
      params.push(`%${req.query.search}%`);
      const ph = `$${params.length}`;
      where.push(
        `(m.member_id ILIKE ${ph} OR m.first_name ILIKE ${ph} OR m.last_name ILIKE ${ph} OR m.email ILIKE ${ph} OR m.phone ILIKE ${ph})`
      );
    }
    if (req.query.onlyIncomplete === "true") {
      where.push(`(m.email IS NULL OR m.email = '')`);
    }

    // Focus tabs drive which slice of the roster is listed. Because these all
    // aggregate over the audit log they are HAVING clauses, not WHERE clauses.
    const having = [];
    switch (req.query.focus) {
      case "signed_in":
        having.push(`COUNT(l.id) FILTER (WHERE l.action = 'login_success') > 0`);
        break;
      case "never":
        having.push(`COUNT(l.id) FILTER (WHERE l.action = 'login_success') = 0`);
        break;
      case "failed":
        having.push(`COUNT(l.id) FILTER (WHERE l.action LIKE 'login_failed%') > 0`);
        break;
      case "locked":
        having.push(
          `(COUNT(l.id) FILTER (WHERE l.action LIKE 'login_%locked') > 0
             OR MAX(m.locked_until) > NOW())`
        );
        break;
      case "password":
        having.push(`COUNT(l.id) FILTER (WHERE l.action = 'password_changed') > 0`);
        break;
      default:
        break;
    }

    const whereSql = `WHERE ${where.join(" AND ")}`;
    const havingSql = having.length ? `HAVING ${having.join(" AND ")}` : "";
    const groupBy = `GROUP BY m.member_id, m.first_name, m.last_name, m.jumuiya_id, m.last_seen_at, m.email, m.phone, m.locked_until`;

    const listPromise = db.query(
      `SELECT
         m.member_id,
         COALESCE(NULLIF(TRIM(COALESCE(m.first_name, '') || ' ' || COALESCE(m.last_name, '')), ''), m.member_id) AS name,
         ${JUMUIYA_EXPR} AS jumuiya_name,
         (COUNT(l.id) FILTER (WHERE l.action = 'login_success'))::int AS logins,
         (COUNT(l.id) FILTER (WHERE l.action LIKE 'login_failed%'))::int AS failed,
         (COUNT(l.id) FILTER (WHERE l.action LIKE 'login_%locked'))::int AS lockouts,
         MIN(l.created_at) FILTER (WHERE l.action = 'login_success') AS first_login,
         MAX(l.created_at) FILTER (WHERE l.action = 'login_success') AS last_login,
         MAX(l.created_at) FILTER (WHERE l.action = 'logout') AS last_logout,
         MAX(l.created_at) FILTER (WHERE l.action = 'password_changed') AS password_changed_at,
         m.last_seen_at,
         m.email,
         m.phone,
         m.locked_until
       FROM members m
       LEFT JOIN login_audit_log l ON l.member_id = m.member_id
       ${whereSql}
       ${groupBy}
       ${havingSql}
       ORDER BY MAX(l.created_at) FILTER (WHERE l.action = 'login_success') DESC NULLS LAST,
                m.first_name ASC NULLS LAST, m.last_name ASC NULLS LAST, m.member_id
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    const countPromise = db.query(
      `SELECT COUNT(*)::int AS total FROM (
         SELECT m.member_id
         FROM members m
         LEFT JOIN login_audit_log l ON l.member_id = m.member_id
         ${whereSql}
         ${groupBy}
         ${havingSql}
       ) t`,
      params
    );

    const [listRes, countRes] = await Promise.all([listPromise, countPromise]);
    const now = Date.now();

    const data = listRes.rows.map((r) => ({
      ...r,
      locked: r.locked_until ? new Date(r.locked_until).getTime() > now : false,
      // A member is considered set up once they have a contact email and have
      // successfully signed in at least once. (password_changed_at is NOT used:
      // it is only recorded from the sign-ins release onward, so it would flag
      // every long-standing member as "setup incomplete".)
      setup_complete: Boolean(r.email) && r.logins > 0,
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

    // A single action (?action=) or a card-driven set (?actions=a,b,c).
    if (req.query.actions) {
      const list = String(req.query.actions)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (list.length) {
        const phs = list.map((a) => {
          params.push(a);
          return `$${params.length}`;
        });
        where.push(`l.action IN (${phs.join(", ")})`);
      }
    } else if (req.query.action) {
      add(`l.action = ?`, req.query.action);
    }
    if (req.query.jumuiya_id) add(`m.jumuiya_id::text = ?`, String(req.query.jumuiya_id));
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
