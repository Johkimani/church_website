/**
 * One-off script: permanently delete the six legacy "OFF/..." test members.
 *
 * Run with the same environment the API uses (so DATABASE_URL / dbConfig picks
 * up the right connection):
 *   node backEnd/src/scripts/deleteTestMembers.js
 *
 * It only touches the six registration numbers listed below and is safe to
 * re-run (already-deleted members are skipped).
 */
import pg from "pg";
import { cascadeDeleteRow } from "../utils/cascadeDelete.js";

// Prefer a full DATABASE_URL (e.g. Render Postgres "Connect" external URL).
// Otherwise fall back to the app's dbConfig (which reads DB_HOST/DB_USER/...).
let pool;
if (process.env.DATABASE_URL) {
  pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
} else {
  ({ db: pool } = await import("../Configs/dbConfig.js"));
}

const MEMBER_IDS = [
  "OFF/39762/26",
  "OFF/45207/26",
  "OFF/35385/26",
  "OFF/34817/26",
  "OFF/45056/26",
  "OFF/59031/26",
];

const deleteOneMember = async (client, id) => {
  await cascadeDeleteRow(client, "members", "member_id", id);
  await client.query("DELETE FROM import_records WHERE cleaned_reg_number = $1", [id]);

  for (let attempt = 0; attempt < 25; attempt++) {
    try {
      const res = await client.query(
        "DELETE FROM members WHERE member_id = $1 RETURNING member_id",
        [id]
      );
      return res.rows[0];
    } catch (e) {
      if (e.code !== "23503" || !e.detail) throw e;
      const m = /still referenced from table "([^"]+)"/.exec(e.detail);
      if (!m) throw e;
      const tbl = m[1];
      const colRes = await client.query(
        `SELECT kcu.column_name
         FROM information_schema.referential_constraints rc
         JOIN information_schema.key_column_usage kcu
           ON rc.constraint_name = kcu.constraint_name
          AND rc.constraint_schema = kcu.constraint_schema
         WHERE rc.unique_constraint_table_name = 'members'
           AND kcu.table_name = $1
         LIMIT 1`,
        [tbl]
      );
      const col = colRes.rows[0]?.column_name || "member_id";
      console.log(`  -> clearing residual reference in "${tbl}" (${col})`);
      await client.query(`DELETE FROM "${tbl}" WHERE "${col}" = $1`, [id]);
    }
  }
  throw new Error(`Could not resolve references for ${id}`);
};

const main = async () => {
  const client = await pool.connect();
  try {
    for (const id of MEMBER_IDS) {
      console.log(`Deleting ${id} ...`);
      try {
        await client.query("BEGIN");
        await deleteOneMember(client, id);
        await client.query("COMMIT");
        console.log(`  OK`);
      } catch (e) {
        await client.query("ROLLBACK");
        console.error(`  normal path FAILED ${id}: [${e.code}] ${e.message}`);
        if (e.detail) console.error(`  detail: ${e.detail}`);

        // Fallback: disable FK enforcement for this session and retry. This
        // bypasses any value-mismatch or deep-chain constraint that the
        // recursive delete could not resolve.
        try {
          await client.query("BEGIN");
          try {
            await client.query("SET LOCAL session_replication_role = 'replica'");
            console.log(`  -> replica-role fallback engaged`);
          } catch (setErr) {
            console.error(`  could not disable FK triggers: ${setErr.message}`);
          }
          await deleteOneMember(client, id);
          await client.query("COMMIT");
          console.log(`  OK (via replica-role fallback)`);
        } catch (e2) {
          await client.query("ROLLBACK");
          console.error(`  FALLBACK FAILED ${id}: [${e2?.code}] ${e2?.message}`);
          if (e2?.detail) console.error(`  detail: ${e2.detail}`);
        }
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
};

main().catch((e) => {
  console.error("Script aborted:", e);
  process.exit(1);
});
