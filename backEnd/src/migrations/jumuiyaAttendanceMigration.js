// src/migrations/jumuiyaAttendanceMigration.js
// Per-member attendance register for each jumuiya (used by jumuiya secretaries)
// + per-jumuiya meeting-day config (authoritative source for the register).
import { testDb as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

// Meeting days per the product spec, keyed by jumuiya SLUG (UUIDs are resolved
// at runtime so the seed survives sub_groups id regeneration):
//   0 = Sunday ... 6 = Saturday
// St. Anthony, St. Dominic, St. Maria Goretti, St. Monica → Sunday
// St. Augustine, St. Elizabeth → Thursday
// St. Catherine → Wednesday
// St. Thomas Aquinas → not configured (falls back to any day)
const MEETING_DAYS = {
  "st-anthony": 0,
  "st-augustine": 4,
  "st-catherine": 3,
  "st-dominic": 0,
  "st-elizabeth": 4,
  "st-maria-goretti": 0,
  "st-monica": 0,
};

const DAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const migration = async () => {
  try {
    // Per-member attendance register (one row per member per meeting date).
    await pool.query(`
      CREATE TABLE IF NOT EXISTS jumuiya_attendance (
        id SERIAL PRIMARY KEY,
        jumuiya_id UUID NOT NULL REFERENCES sub_groups(group_id) ON DELETE CASCADE,
        member_id VARCHAR(50) NOT NULL,
        attendance_date DATE NOT NULL,
        present BOOLEAN NOT NULL DEFAULT true,
        recorded_by VARCHAR(50) NOT NULL DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (member_id, attendance_date)
      );
    `);
    await pool.query(
      `CREATE INDEX IF NOT EXISTS idx_jumuiya_attendance_date
       ON jumuiya_attendance (jumuiya_id, attendance_date);`
    );

    // Per-jumuiya meeting day used to validate register days + drive the UI.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS jumuiya_meeting_config (
        jumuiya_id UUID PRIMARY KEY REFERENCES sub_groups(group_id) ON DELETE CASCADE,
        meeting_day SMALLINT NOT NULL CHECK (meeting_day BETWEEN 0 AND 6),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const slugs = Object.keys(MEETING_DAYS);
    const sgResult = await pool.query(
      `SELECT group_id, slug FROM sub_groups WHERE slug = ANY($1)`,
      [slugs]
    );
    const idBySlug = new Map(sgResult.rows.map((r) => [r.slug, r.group_id]));
    let seeded = 0;
    for (const [slug, meetingDay] of Object.entries(MEETING_DAYS)) {
      const jumuiyaId = idBySlug.get(slug);
      if (!jumuiyaId) {
        logger.warn(`jumuiyaAttendanceMigration: no sub_group with slug "${slug}" — skipping meeting day`);
        continue;
      }
      await pool.query(
        `INSERT INTO jumuiya_meeting_config (jumuiya_id, meeting_day)
         VALUES ($1, $2)
         ON CONFLICT (jumuiya_id) DO UPDATE SET meeting_day = EXCLUDED.meeting_day`,
        [jumuiyaId, meetingDay]
      );
      seeded += 1;
    }
    logger.info(`jumuiya_attendance + jumuiya_meeting_config ready (seeded ${seeded}/${slugs.length} meeting days)`);
  } catch (err) {
    logger.error("jumuiyaAttendanceMigration failed:", err.message);
    throw err;
  }
};

export default migration;
