// src/migrations/semesterConfigMigration.js
// Central "current semester" configuration, set by the CSA chair.
// Drives attendance tally windows, member semester registration, and the
// jumuiya meeting-day schedule. Replaces the previous calendar-month rule.
import { testDb as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

const migration = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS semester_configs (
        id SERIAL PRIMARY KEY,
        label VARCHAR(60) NOT NULL DEFAULT '',
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        is_current BOOLEAN NOT NULL DEFAULT false,
        created_by VARCHAR(120) NOT NULL DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    // Only one row may be the current semester at a time.
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_semester_configs_current
        ON semester_configs (is_current)
        WHERE is_current = true;
    `);

    // Seed the current semester from the historical month rule so behaviour is
    // unchanged until the CSA chair configures one explicitly.
    const { rows } = await pool.query(`SELECT COUNT(*)::int AS count FROM semester_configs`);
    if (rows[0].count === 0) {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const isSecondSem = month >= 6;
      const start = isSecondSem ? `${year}-06-01` : `${year}-01-01`;
      const end = isSecondSem ? `${year}-12-31` : `${year}-05-31`;
      const label = `${year} Semester ${isSecondSem ? "2" : "1"}`;
      await pool.query(
        `INSERT INTO semester_configs (label, start_date, end_date, is_current, created_by)
         VALUES ($1, $2, $3, true, 'migration')`,
        [label, start, end]
      );
      logger.info(`semester_configs: seeded "${label}" (${start} → ${end})`);
    }

    logger.info("semester_configs table ready");
  } catch (err) {
    logger.error("semesterConfigMigration failed:", err.message);
    throw err;
  }
};

export default migration;
