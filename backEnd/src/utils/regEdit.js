/**
 * Reg-edit support. `members.member_id` (a registration number) is the primary
 * key and the login username, and every table that references a member does so
 * with `ON UPDATE NO ACTION` foreign keys. A plain `UPDATE members SET
 * member_id=...` is therefore rejected by PostgreSQL, and editing the reg in
 * the UI used to explode with a constraint violation.
 *
 * The fix has two halves:
 *   1. `ensureMemberFksDeferrable` — a COMMITTED, idempotent migration that
 *      flips every FK referencing `members` to `DEFERRABLE INITIALLY IMMEDIATE`
 *      (default behaviour is unchanged; checks still happen per statement).
 *   2. `CHANGE_MEMBER_SQL` — a set of `UPDATE ... SET <col> = new WHERE <col>
 *      = old` statements for every FK child AND the loose (non-FK) tables that
 *      key off the registration number (registered, import_records, associates,
 *      notifications, etc.). Run inside a transaction AFTER issuing
 *      `SET CONSTRAINTS ALL DEFERRED`, so PostgreSQL lets us change the parent
 *      row and re-point every child within the same transaction.
 */
import { withTransaction } from "../Configs/dbConfig.js";

/**
 * COMMITTED migration: make every FK that references `members` deferrable so a
 * reg/`member_id` change can be applied atomically with its children. Idempotent
 * — re-running it is a no-op (re-ALTERing an already-deferrable constraint is
 * harmless). Safe to call before every reg edit.
 */
export async function ensureMemberFksDeferrable() {
  await withTransaction(async (client) => {
    const res = await client.query(
      `SELECT c.conname, child.relname AS ctable, a.attname AS fkcol
       FROM pg_constraint c
       JOIN pg_class child ON child.oid = c.conrelid
       JOIN pg_class parent ON parent.oid = c.confrelid
       LEFT JOIN LATERAL (
         SELECT attname
         FROM pg_attribute
         WHERE attrelid = child.oid AND attnum = c.conkey[1]
         LIMIT 1
       ) a ON true
       WHERE c.contype = 'f' AND parent.relname = 'members'`
    );

    for (const r of res.rows) {
      await client.query(
        `ALTER TABLE "${r.ctable}" ALTER CONSTRAINT "${r.conname}" DEFERRABLE INITIALLY IMMEDIATE`,
      );
    }
  });
}

/**
 * Ordered `(table, column)` pairs to re-point from the old reg to the new reg.
 * FK children are handled generically; the rest are loose references that key
 * off the registration number without a formal foreign key. `members.member_id`
 * itself is updated by the caller.
 */
export const REG_REFERENCE_COLUMNS = [
  // Loose (non-FK) references keyed by registration number / member id.
  ["registered", "member_id"],
  ["import_records", "cleaned_reg_number"],
  ["associates", "member_id"],
  ["notifications", "member_id"],
  ["suggestions", "member_id"],
  ["attempts", "member_id"],
  ["activity_logs", "member_id"],
  ["activity_rsvps", "member_id"],
  ["jumuiya_attendance", "member_id"],
  ["group_officials", "reg_number"],
  ["jumuiya_officials", "reg_number"],
  ["officials", "reg_number"],
  ["community_tshirt_orders", "member_id"],
  ["jumuiya_tshirt_orders", "member_id"],
  ["published_stats", "member_id"],
  ["weekly_challenge_assignments", "member_id"],
  ["enrollments", "member_id"],
  ["password_resets", "member_id"],
];

// FK columns referencing `members` — discovered dynamically by
// discoverMemberFkColumns() so we also cover member_roles.assigned_by/approved_by
// and mpesa_request.user_id without hardcoding.
let memberFkColumnsCache = null;

export async function discoverMemberFkColumns(client) {
  if (memberFkColumnsCache) return memberFkColumnsCache;
  const res = await client.query(
    `SELECT child.relname AS ctable, a.attname AS fkcol
     FROM pg_constraint c
     JOIN pg_class child ON child.oid = c.conrelid
     JOIN pg_class parent ON parent.oid = c.confrelid
     LEFT JOIN LATERAL (
       SELECT attname
       FROM pg_attribute
       WHERE attrelid = child.oid AND attnum = c.conkey[1]
       LIMIT 1
     ) a ON true
     WHERE c.contype = 'f' AND parent.relname = 'members'`
  );
  memberFkColumnsCache = res.rows.map((r) => ({ table: r.ctable, column: r.fkcol }));
  return memberFkColumnsCache;
}
