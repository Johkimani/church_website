/**
 * One-off backfill: recompute stored year_of_study (1-4) for active members
 * from the admission cohort in their registration number vs. the current
 * academic year (August-based rollover).
 *
 *   /26 → Year 1, /25 → Year 2, /24 → Year 3, /23 → Year 4 (academic year 2026-27)
 *
 * Only members whose derived level lands in 1-4 are updated; older cohorts
 * (already graduated / migrated to associates) are left untouched.
 *
 * Usage:
 *   node backEnd/src/scripts/backfillYearOfStudy.js
 *
 * Connects via the same config the API uses (backEnd/.env DB_* vars).
 */
import { db as pool } from "../Configs/dbConfig.js";

const academicStartYear = () => {
  const now = new Date();
  return now.getMonth() + 1 >= 8 ? now.getFullYear() : now.getFullYear() - 1;
};

const acaStart = academicStartYear();
// derived level = acaStart - admission + 1, admission = 2000 + lastTwo
const base = acaStart - 1999;

console.log(`Academic start year: ${acaStart}  (derived level = ${base} - lastTwoDigits)`);

const client = await pool.connect();
try {
  await client.query("BEGIN");
  await client.query("SET LOCAL lock_timeout = '60000'");
  await client.query("SET LOCAL statement_timeout = '120000'");

  const before = await client.query(
    `SELECT
       CASE
         WHEN year_of_study IS NULL THEN 'NULL'
         WHEN year_of_study ~ '^[1-4]$' THEN year_of_study
         ELSE 'other'
       END AS bucket,
       COUNT(*)::int AS n
     FROM members
     WHERE RIGHT(member_id, 2) ~ '^[0-9]{2}$'
       AND (migrated_to_associates IS NULL OR migrated_to_associates = false)
     GROUP BY bucket
     ORDER BY bucket`
  );
  console.log("BEFORE (active members whose reg ends in 2 digits):");
  before.rows.forEach((r) => console.log(`  ${r.bucket}: ${r.n}`));

  const result = await client.query(
    `WITH t AS (
       SELECT member_id,
              (${base} - CAST(RIGHT(member_id, 2) AS int)) AS new_year
       FROM members
       WHERE RIGHT(member_id, 2) ~ '^[0-9]{2}$'
         AND (migrated_to_associates IS NULL OR migrated_to_associates = false)
         AND (${base} - CAST(RIGHT(member_id, 2) AS int)) BETWEEN 1 AND 4
     )
     UPDATE members m
     SET year_of_study = t.new_year::text
     FROM t
     WHERE m.member_id = t.member_id
       AND (m.year_of_study IS NULL OR m.year_of_study <> t.new_year::text)
     RETURNING m.member_id, t.new_year`
  );

  console.log(`UPDATED ${result.rowCount} members.`);
  await client.query("COMMIT");

  const after = await client.query(
    `SELECT RIGHT(member_id, 2) AS cohort, year_of_study,
            COUNT(*)::int AS n
     FROM members
     WHERE RIGHT(member_id, 2) ~ '^[0-9]{2}$'
       AND (migrated_to_associates IS NULL OR migrated_to_associates = false)
     GROUP BY cohort, year_of_study
     ORDER BY cohort DESC, year_of_study`
  );
  console.log("AFTER (cohort -> stored year_of_study, active members):");
  after.rows.forEach((r) => console.log(`  /${r.cohort}: ${r.year_of_study ?? "NULL"} (${r.n})`));
} catch (e) {
  try { await client.query("ROLLBACK"); } catch (_) {}
  console.error(`FAILED: [${e.code}] ${e.message}`);
  if (e.detail) console.error(`detail: ${e.detail}`);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}