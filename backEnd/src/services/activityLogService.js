import { db } from "../Configs/dbConfig.js";

const getActorName = (actor) => {
  if (!actor) return "Unknown";
  const first = actor.firstName || "";
  const last = actor.lastName || "";
  const name = `${first} ${last}`.trim();
  return name || actor.name || String(actor.id ?? actor.member_id ?? "Unknown");
};

const getRole = (actor) => {
  if (!actor) return null;
  if (Array.isArray(actor.role)) return actor.role.join(", ");
  return actor.role ? String(actor.role) : null;
};

/**
 * Records an admin action in activity_logs. Fire-and-forget: failures are
 * swallowed so auditing can never break the request it is recording.
 * actor is typically req.user (id/member_id, role, firstName, lastName,
 * jumuiya_id). The jumuiya display name is resolved from sub_groups.
 */
export const logActivity = async ({
  actor,
  action,
  entityType,
  entityId,
  details,
}) => {
  try {
    let jumuiyaName = null;
    if (actor?.jumuiya_id) {
      const { rows } = await db.query(
        `SELECT name FROM sub_groups
         WHERE LOWER(group_id::text) = $1 OR LOWER(slug) = $1
         LIMIT 1`,
        [String(actor.jumuiya_id).toLowerCase()]
      );
      jumuiyaName = rows[0]?.name ?? null;
    }

    await db.query(
      `INSERT INTO activity_logs
         (actor_id, actor_name, actor_role, jumuiya_id, jumuiya_name,
          action, entity_type, entity_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        actor?.id ?? actor?.member_id ?? null,
        getActorName(actor),
        getRole(actor),
        actor?.jumuiya_id ?? null,
        jumuiyaName,
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
