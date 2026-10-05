/**
 * Permanently remove a member and every database row that references them.
 *
 * The app's DELETE /api/v1/jumuiya-members/:id handler (deleteJumuiyaMember)
 * only cleans registered/group_assignments/allocation_approvals/import_records/
 * associates before deleting the member. That leaves orphaned rows in many
 * tables AND fails outright if the member has a pending_payments row, because
 * pending_payments.member_id has a FK to members WITHOUT ON DELETE CASCADE.
 *
 * This script removes the member from every table that can reference them, in
 * FK-dependency-safe order, inside a single transaction.
 *
 * Usage:
 *   node scripts/remove_member.js PAUL_ONSONGO            # dry run (default)
 *   node scripts/remove_member.js PAUL_ONSONGO --commit    # actually delete
 *
 * Reads DB credentials from backEnd/.env via ../src/Configs/dbConfig.js.
 */
import { db as pool } from "../src/Configs/dbConfig.js";
import logger from "../src/logger/winston.js";

const memberId = process.argv[2];
const doCommit = process.argv.includes("--commit");

if (!memberId) {
  console.error("Usage: node scripts/remove_member.js <MEMBER_ID> [--commit]");
  process.exit(1);
}

// Each entry: table, column(s) that hold the member's id. The DELETE targets
// the member's own rows. Columns listed under `nullify` are foreign-key
// references TO this member (someone was assigned/approved BY them) — those
// must be SET NULL, not deleted, so the referrer's row survives.
const TARGETS = [
  // FK to members WITHOUT ON DELETE CASCADE — must go first or the member
  // delete fails with a constraint violation.
  { table: "pending_payments", column: "member_id" },

  // Payment/booking chain.
  { table: "activity_payments", via: "booking_id", ref: "activity_bookings" },
  { table: "activity_bookings", column: "member_id" },
  { table: "mpesa_request", column: "user_id" },
  { table: "orders", column: "user_id" },

  // Auth/session/credential tables.
  { table: "refresh_tokens", column: "member_id" },
  { table: "password_history", column: "member_id" },
  { table: "password_resets", column: "member_id" },
  { table: "member_roles", column: "member_id" },
  { table: "member_roles", nullify: ["assigned_by", "approved_by"] },

  // Registration / distribution system.
  { table: "registered", column: "member_id" },
  { table: "group_assignments", column: "member_id" },
  { table: "allocation_approvals", column: "member_id" },
  { table: "import_records", column: "cleaned_reg_number" },
  { table: "import_records", column: "member_id" },
  { table: "associates", column: "member_id" },

  // Devotions / weekly challenge / attendance.
  { table: "attempts", column: "member_id" },
  { table: "weekly_challenge_assignments", column: "member_id" },
  { table: "jumuiya_attendance", column: "member_id" },
  { table: "published_stats", column: "member_id" },
  { table: "published_stats", column: "created_by" },

  // Community feedback / gallery interactions.
  { table: "suggestions", column: "user_id" },
  { table: "hub_gallery_comments", column: "user_id" },
  { table: "hub_gallery_reactions", column: "user_id" },

  // Notifications + audit trail.
  { table: "notifications", column: "member_id" },
  { table: "notifications", column: "posted_by" },
  { table: "jumuiya_notifications", column: "posted_by" },
  { table: "activity_logs", column: "actor_id" },

  // Contributions (financial history).
  { table: "contributions", column: "member_id" },

  // Official positions recorded by registration number (they may equal the
  // member id). Removed so the member leaves no trace of leadership either.
  { table: "officials", column: "reg_number" },
  { table: "jumuiya_officials", column: "reg_number" },
  { table: "group_officials", column: "reg_number" },
];

const formatTargets = (list) =>
  list
    .map((t) => {
      const scope = t.column
        ? `column ${t.column} = '${memberId}'`
        : t.via
          ? `${t.via} IN (SELECT id FROM ${t.ref} WHERE member_id = '${memberId}')`
          : `nullify ${(t.nullify || []).join(", ")}`;
      return `  ${t.table}  (${scope})`;
    })
    .join("\n");

const run = async () => {
  const client = await pool.connect();
  try {
    // Does the member even exist?
    const exists = await client.query(
      "SELECT member_id, first_name, last_name FROM members WHERE member_id::text = $1",
      [memberId],
    );
    if (exists.rows.length === 0) {
      console.log(`Member '${memberId}' not found. Nothing to do.`);
      return;
    }
    console.log(`Member: ${exists.rows[0].first_name} ${exists.rows[0].last_name} (${memberId})`);

    await client.query("BEGIN");

    const results = [];
    let sp = 0;

    const checkpoint = async (queryText, params, meta) => {
      // Postgres aborts the whole transaction on ANY statement error, so each
      // statement runs inside its own SAVEPOINT; a failure rolls back only
      // that statement and the batch continues.
      sp += 1;
      await client.query(`SAVEPOINT sp${sp}`);
      try {
        const r = await client.query(queryText, params);
        await client.query(`RELEASE SAVEPOINT sp${sp}`);
        results.push({ ...meta, count: r.rowCount });
      } catch (err) {
        await client.query(`ROLLBACK TO SAVEPOINT sp${sp}`);
        results.push({ action: "error", ...meta, message: err.message });
      }
    };

    for (const target of TARGETS) {
      if (target.nullify) {
        for (const col of target.nullify) {
          await checkpoint(
            `UPDATE ${target.table} SET ${col} = NULL WHERE ${col}::text = $1`,
            [memberId],
            { action: "nullify", table: target.table, col },
          );
        }
        continue;
      }

      const meta = { action: "delete", table: target.table, col: target.column };
      let q;
      if (target.via) {
        q = `DELETE FROM ${target.table} WHERE ${target.via}::text IN (SELECT id::text FROM ${target.ref} WHERE member_id::text = $1)`;
      } else {
        q = `DELETE FROM ${target.table} WHERE ${target.column}::text = $1`;
      }
      await checkpoint(q, [memberId], meta);
    }

    const final = await client.query(
      "DELETE FROM members WHERE member_id::text = $1 RETURNING member_id",
      [memberId],
    );
    results.push({
      action: "delete",
      table: "members",
      col: "member_id",
      count: final.rowCount,
    });

    const rows = results
      .filter((r) => r.action !== "error")
      .map((r) => `${r.action === "nullify" ? "NULL  " : "DEL   "} ${r.table}${r.col ? "." + r.col : ""}: ${r.count}`)
      .join("\n");
    const errors = results
      .filter((r) => r.action === "error")
      .map((r) => `  ${r.table}: ${r.message}`)
      .join("\n");

    console.log(`\nPlanned/deleted rows:\n${rows}`);
    if (errors) console.log(`\nSkipped (table/column missing):\n${errors}`);

    if (doCommit) {
      await client.query("COMMIT");
      console.log(`\nCOMMITTED: member '${memberId}' removed.`);
    } else {
      await client.query("ROLLBACK");
      console.log("\nDRY RUN: nothing was changed. Re-run with --commit to execute.");
    }
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch (_) {
      /* connection may be broken */
    }
    console.error("Cleanup failed:", err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
};

logger.transports.forEach((t) => (t.silent = true));
console.log(`Cleaning up member '${memberId}' (commit=${doCommit}):\n${formatTargets(TARGETS)}\n`);
run();
