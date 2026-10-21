/**
 * E migration: clean up every non-canonical members.member_id in one pass.
 *
 * Classification (mirrors what the forms/D-gate now reject):
 *   auto       — sanitizeRegNumber(id) alone makes it canonical
 *   suggestion — suggestRegNumber(id) yields a confident canonical fix
 *   manual     — neither; left untouched for a coordinator
 *
 * Each rename reuses the production reg-edit path (regEdit.js): every FK
 * child and loose reference is re-pointed, a default "reg-number" password is
 * re-hashed to the new reg, and refresh tokens are revoked — all inside one
 * deferred-constraints transaction.
 *
 * Usage:  node scripts/e_migrate.mjs            # dry run (default)
 *         node scripts/e_migrate.mjs --apply    # write to the database
 */
import fs from "node:fs";
import bcrypt from "bcrypt";
import { db, withTransaction } from "../src/Configs/dbConfig.js";
import {
  standardizeRegNumber,
  sanitizeRegNumber,
  suggestRegNumber,
} from "../src/utils/memberValidation.js";
import {
  ensureMemberFksDeferrable,
  REG_REFERENCE_COLUMNS,
  discoverMemberFkColumns,
} from "../src/utils/regEdit.js";

const APPLY = process.argv.includes("--apply");
const isCanonical = (v) => standardizeRegNumber(v).formatOk === true;

// Aiven connections can drop mid-run; retry a failed step on a fresh one.
db.on("error", (err) => console.log(`  pool error (ignored): ${err.message}`));
const withRetry = async (fn, tries = 4) => {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      console.log(`  attempt ${i + 1}/${tries} failed: ${e.message} — retrying in 3s`);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  throw lastErr;
};

const { rows: members } = await db.query("SELECT member_id, password FROM members");
const currentIds = new Set(members.map((m) => m.member_id));

const plan = [];
const manual = [];
for (const m of members) {
  const id = m.member_id;
  if (isCanonical(id)) continue;

  let target = null;
  let kind = null;
  const auto = sanitizeRegNumber(id);
  if (auto && auto !== id && isCanonical(auto)) {
    target = auto;
    kind = "auto";
  } else {
    const s = suggestRegNumber(id);
    if (s && isCanonical(s)) {
      target = s;
      kind = "suggestion";
    }
  }
  if (!target) manual.push(id);
  else plan.push({ old: id, target, kind });
}

const taken = new Map();
for (const p of plan) {
  if (currentIds.has(p.target)) p.blocked = "target already belongs to another member";
  else if (taken.has(p.target)) p.blocked = `same target as ${taken.get(p.target)}`;
  else taken.set(p.target, p.old);
}
const blocked = plan.filter((p) => p.blocked);
const todo = plan.filter((p) => !p.blocked);

const oldIds = todo.map((p) => p.old);
console.log(`members scanned: ${members.length}`);
console.log(`rename plan: ${todo.length} (auto ${todo.filter((p) => p.kind === "auto").length}, suggestion ${todo.filter((p) => p.kind === "suggestion").length})`);
console.log(`manual review (skipped): ${manual.length}${manual.length ? " -> " + manual.join(", ") : ""}`);
console.log(`blocked: ${blocked.length}${blocked.length ? " -> " + blocked.map((p) => `${p.old} => ${p.target} (${p.blocked})`).join("; ") : ""}`);
for (const p of todo) console.log(`  ${p.kind.padEnd(11)} ${p.old}  ->  ${p.target}`);

if (!APPLY) {
  console.log("\nDRY RUN — nothing written. Re-run with --apply to commit these renames.");
  process.exit(0);
}

if (todo.length === 0) {
  console.log("\nNothing to do.");
  process.exit(0);
}

// ---- backup the rows we are about to touch --------------------------------
const fkCols = await discoverMemberFkColumns(db);
const backup = { ts: new Date().toISOString(), plan: todo, blocked, manual, rows: {} };

backup.rows["members"] = (await db.query("SELECT * FROM members WHERE member_id = ANY($1)", [oldIds])).rows;
for (const { table, column } of fkCols) {
  const r = await db.query(`SELECT * FROM "${table}" WHERE "${column}" = ANY($1)`, [oldIds]);
  if (r.rowCount) backup.rows[`${table}.${column}`] = r.rows;
}
for (const [table, column] of REG_REFERENCE_COLUMNS) {
  const r = await db.query(`SELECT * FROM "${table}" WHERE "${column}" = ANY($1)`, [oldIds]);
  if (r.rowCount) backup.rows[`${table}.${column}`] = r.rows;
}
// raw_reg_number kept out of the update but backed up for provenance
const raw = await db.query("SELECT * FROM import_records WHERE raw_reg_number = ANY($1)", [oldIds]);
if (raw.rowCount) backup.rows["import_records.raw_reg_number"] = raw.rows;

const backupPath = `C:/Users/Kim/AppData/Local/Temp/opencode/e_backup_${Date.now()}.json`;
fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
console.log(`\nbackup written: ${backupPath}`);

// ---- apply ----------------------------------------------------------------
await ensureMemberFksDeferrable();

let pwResets = 0;
let sessionsRevoked = 0;
const touched = new Map();

for (const p of todo) {
  const res = await withRetry(() => withTransaction(async (client) => {
    await client.query("SET CONSTRAINTS ALL DEFERRED");

    for (const { table, column } of fkCols) {
      const r = await client.query(
        `UPDATE "${table}" SET "${column}" = $1 WHERE "${column}" = $2`,
        [p.target, p.old]
      );
      if (r.rowCount) touched.set(`${table}.${column}`, (touched.get(`${table}.${column}`) || 0) + r.rowCount);
    }
    for (const [table, column] of REG_REFERENCE_COLUMNS) {
      const r = await client.query(
        `UPDATE "${table}" SET "${column}" = $1 WHERE "${column}" = $2`,
        [p.target, p.old]
      );
      if (r.rowCount) touched.set(`${table}.${column}`, (touched.get(`${table}.${column}`) || 0) + r.rowCount);
    }

    const cur = await client.query("SELECT password FROM members WHERE member_id = $1", [p.old]);
    const oldHash = cur.rows[0]?.password || null;
    let passwordReset = false;
    if (oldHash && (await bcrypt.compare(p.old, oldHash))) {
      const newHash = await bcrypt.hash(p.target, 10);
      await client.query("UPDATE members SET password = $1 WHERE member_id = $2", [newHash, p.target]);
      passwordReset = true;
    }

    await client.query("UPDATE members SET member_id = $1 WHERE member_id = $2", [p.target, p.old]);

    // Sessions were issued under the old username — revoke them.
    const tok = await client.query("DELETE FROM refresh_tokens WHERE member_id = $1", [p.target]);

    return { passwordReset, revoked: tok.rowCount };
  }));
  if (res.passwordReset) pwResets += 1;
  sessionsRevoked += res.revoked;
  console.log(`renamed ${p.old} -> ${p.target} (${res.passwordReset ? "password re-hashed, " : ""}${res.revoked} session(s) revoked)`);
}

// ---- verify ----------------------------------------------------------------
const { rows: after } = await db.query("SELECT member_id FROM members");
const leftover = after.map((r) => r.member_id).filter((id) => !isCanonical(id));
const remainingRefs = [];
for (const { table, column } of fkCols) {
  const r = await db.query(`SELECT COUNT(*)::int AS n FROM "${table}" WHERE "${column}" = ANY($1)`, [oldIds]);
  if (r.rows[0].n) remainingRefs.push(`${table}.${column}=${r.rows[0].n}`);
}
for (const [table, column] of REG_REFERENCE_COLUMNS) {
  const r = await db.query(`SELECT COUNT(*)::int AS n FROM "${table}" WHERE "${column}" = ANY($1)`, [oldIds]);
  if (r.rows[0].n) remainingRefs.push(`${table}.${column}=${r.rows[0].n}`);
}

console.log(`\nrenamed: ${todo.length} | password re-hashes: ${pwResets} | sessions revoked: ${sessionsRevoked}`);
console.log(`rows touched: ${[...touched.entries()].map(([k, v]) => `${k}=${v}`).join(", ")}`);
console.log(`non-canonical members remaining: ${leftover.length}${leftover.length ? " (expected the " + manual.length + " manual + " + blocked.length + " blocked)" : ""}`);
console.log(`stale references to old ids: ${remainingRefs.length ? remainingRefs.join(", ") : "none"}`);
console.log(`backup: ${backupPath}`);
process.exit(0);
