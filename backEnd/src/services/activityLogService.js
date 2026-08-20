import { db } from "../Configs/dbConfig.js";

const formatRole = (role) => {
  if (!role) return "Official";
  const roles = Array.isArray(role) ? role : [role];
  if (roles.length === 0) return "Official";
  return roles
    .map((r) =>
      String(r)
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase())
    )
    .join(", ");
};

export const resolveActorDetails = async (actor) => {
  let actorId = actor?.id ?? actor?.member_id ?? null;
  let actorName = "";
  let actorRole = actor?.role || actor?.roles || null;
  let jumuiyaId = actor?.jumuiya_id || null;
  let jumuiyaName = null;

  const first = actor?.firstName || actor?.first_name || "";
  const last = actor?.lastName || actor?.last_name || "";
  const directName = `${first} ${last}`.trim();

  if (directName && directName !== "Unknown") {
    actorName = directName;
  } else if (actor?.name && actor.name !== "Unknown") {
    actorName = actor.name;
  }

  // If name, jumuiya, or role is missing, query database using member_id
  if (actorId && (!actorName || !jumuiyaId || !actorRole || actorRole.length === 0)) {
    try {
      const { rows } = await db.query(
        `SELECT m.member_id, m.first_name, m.last_name, m.jumuiya_id,
                sg.name AS resolved_jumuiya_name,
                COALESCE(
                  ARRAY_AGG(r.role_name) FILTER (WHERE r.role_name IS NOT NULL),
                  ARRAY[]::text[]
                ) as member_roles
         FROM members m
         LEFT JOIN sub_groups sg ON (
           m.jumuiya_id = sg.group_id::text 
           OR m.jumuiya_id::text = sg.group_id::text 
           OR LOWER(m.jumuiya_id) = LOWER(sg.slug)
         )
         LEFT JOIN member_roles mr ON m.member_id = mr.member_id AND mr.status = 'approved'
         LEFT JOIN roles r ON mr.role_id = r.role_id
         WHERE m.member_id = $1
         GROUP BY m.member_id, m.first_name, m.last_name, m.jumuiya_id, sg.name`,
        [String(actorId)]
      );

      if (rows.length > 0) {
        const row = rows[0];
        if (!actorName) {
          const dbName = `${row.first_name || ""} ${row.last_name || ""}`.trim();
          actorName = dbName || String(actorId);
        }
        if (!jumuiyaId && row.jumuiya_id) {
          jumuiyaId = row.jumuiya_id;
        }
        if (row.resolved_jumuiya_name) {
          jumuiyaName = row.resolved_jumuiya_name;
        }
        if ((!actorRole || actorRole.length === 0) && row.member_roles && row.member_roles.length > 0) {
          actorRole = row.member_roles;
        }
      }
    } catch (err) {
      console.error("[activityLog] member lookup failed:", err.message);
    }
  }

  // If jumuiyaName still not resolved, query sub_groups
  if (!jumuiyaName && jumuiyaId) {
    try {
      const { rows: sgRows } = await db.query(
        `SELECT name FROM sub_groups
         WHERE LOWER(group_id::text) = LOWER($1) 
            OR LOWER(slug) = LOWER($1) 
            OR LOWER(name) = LOWER($1)
         LIMIT 1`,
        [String(jumuiyaId)]
      );
      if (sgRows.length > 0) {
        jumuiyaName = sgRows[0].name;
      }
    } catch (err) {
      console.error("[activityLog] jumuiya lookup failed:", err.message);
    }
  }

  return {
    actorId,
    actorName: actorName || String(actorId || "Unknown Official"),
    actorRole: formatRole(actorRole),
    jumuiyaId: jumuiyaId ? String(jumuiyaId) : null,
    jumuiyaName: jumuiyaName || null,
  };
};

/**
 * Records an admin action in activity_logs with full official profile details.
 */
export const logActivity = async ({
  actor,
  action,
  entityType,
  entityId,
  details,
}) => {
  try {
    const resolved = await resolveActorDetails(actor);

    await db.query(
      `INSERT INTO activity_logs
         (actor_id, actor_name, actor_role, jumuiya_id, jumuiya_name,
          action, entity_type, entity_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        resolved.actorId,
        resolved.actorName,
        resolved.actorRole,
        resolved.jumuiyaId,
        resolved.jumuiyaName,
        action,
        entityType ?? null,
        entityId != null ? String(entityId) : null,
        details && typeof details === "object" ? details : {},
        actor?.ip ?? null,
      ]
    );
  } catch (error) {
    console.error("[activityLog] failed to write log:", error.message);
  }
};
