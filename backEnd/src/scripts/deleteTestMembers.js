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
import { db as pool } from "../Configs/dbConfig.js";
import { cascadeDeleteRow } from "../utils/cascadeDelete.js";

const MEMBER_IDS = [
  "OFF/39762/26",
  "OFF/45207/26",
  "OFF/35385/26",
  "OFF/34817/26",
  "OFF/45056/26",
  "OFF/59031/26",
];

const deleteOneMember = async (client, id) => {
  // Recursively clear the whole FK dependency tree for this member.
  await cascadeDeleteRow(client, "members", "member_id", id);

  // Historical import rows are keyed by registration number, not member_id.
  await client.query("DELETE FROM import_records WHERE cleaned_reg_number = $1", [id]);

  // Final delete with a safety-net retry in case a reference still remains.
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
      await client.query("BEGIN");
      try {
        const deleted = await deleteOneMember(client, id);
        await client.query("COMMIT");
        console.log(`  OK ${deleted ? id : "(already gone)"}`);
      } catch (e) {
        await client.query("ROLLBACK");
        console.error(`  FAILED ${id}: ${e.message}`);
        if (e.detail) console.error(`  detail: ${e.detail}`);
        // Continue with the next member instead of aborting everything.
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
