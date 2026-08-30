/**
 * One-off script: permanently delete a single member by registration number,
 * clearing the full FK dependency tree first.
 *
 * Usage:
 *   node backEnd/src/scripts/deleteSingleMember.js "ED100/G/18019"
 *
 * Connects via the same config the API uses (backEnd/.env DB_* vars).
 */
import pg from "pg";
import { cascadeDeleteRow } from "../utils/cascadeDelete.js";

// Load env + production pool the same way the API does.
await import("../Configs/dbConfig.js");
const { db: pool } = await import("../Configs/dbConfig.js");

const id = process.argv[2];
if (!id) {
  console.error("Usage: node deleteSingleMember.js <member_id>");
  process.exit(1);
}

const client = await pool.connect();
try {
  await client.query("BEGIN");
  await client.query("SET LOCAL lock_timeout = '60000'");
  await client.query("SET LOCAL statement_timeout = '120000'");
  await cascadeDeleteRow(client, "members", "member_id", id);
  await client.query("DELETE FROM import_records WHERE cleaned_reg_number = $1", [id]);
  await client.query("COMMIT");
  console.log(`DELETED ${id}`);
} catch (e) {
  try { await client.query("ROLLBACK"); } catch (_) {}
  console.error(`FAILED ${id}: [${e.code}] ${e.message}`);
  if (e.detail) console.error(`detail: ${e.detail}`);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
