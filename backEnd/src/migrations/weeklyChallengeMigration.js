import { testDb as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

/*
  Phase 1: attempt integrity.
  - attempts.week_start: the calendar week (Monday) the attempt belongs to.
    Legacy rows stay NULL (unaffected by the unique index).
  - Partial unique index: one attempt per (question, member, week). Replays,
    page reloads and reset-based re-entry can no longer duplicate rows.
*/
const migration = async () => {
  try {
    await pool.query(`
      ALTER TABLE attempts
        ADD COLUMN IF NOT EXISTS week_start DATE
    `);
    logger.info("attempts.week_start column ready");

    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_attempts_once_per_week
        ON attempts(question_id, member_id, week_start)
        WHERE week_start IS NOT NULL
    `);
    logger.info("unique per-week attempt index ready");

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_attempts_week_start
        ON attempts(week_start)
    `);
    logger.info("week_start index ready");
  } catch (err) {
    logger.error("weeklyChallengeMigration failed:", err.message);
    throw err;
  }
};

export default migration;
