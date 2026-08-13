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

    /*
      Phase 2: weekly-challenge model.
      - questions.topic/status/generated_by: AI-generated rows land as
        'draft' and are only served once a liturgist approves them.
      - weekly_challenges: one per fixed Mon-Sun calendar week.
      - weekly_challenge_questions: the assignment (question -> challenge).
      - published_stats.week_start: published snapshots become per-week.
    */
    await pool.query(`
      ALTER TABLE questions
        ADD COLUMN IF NOT EXISTS topic VARCHAR(500),
        ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft',
        ADD COLUMN IF NOT EXISTS generated_by VARCHAR(255)
    `);
    logger.info("questions.topic/status/generated_by ready");

    // Legacy rows predate the approval workflow and stay usable immediately.
    await pool.query(`UPDATE questions SET status = 'approved' WHERE status IS NULL`);
    logger.info("legacy questions backfilled to approved");

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_questions_status
        ON questions(status)
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS weekly_challenges (
        id SERIAL PRIMARY KEY,
        week_start DATE NOT NULL UNIQUE,
        week_end DATE NOT NULL,
        topic VARCHAR(500),
        status VARCHAR(20) NOT NULL DEFAULT 'draft',
        question_count INTEGER NOT NULL DEFAULT 0,
        published_at TIMESTAMP,
        created_by VARCHAR(255),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    logger.info("weekly_challenges table ready");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS weekly_challenge_questions (
        id SERIAL PRIMARY KEY,
        challenge_id INTEGER NOT NULL REFERENCES weekly_challenges(id) ON DELETE CASCADE,
        question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
        display_order INTEGER NOT NULL DEFAULT 0,
        UNIQUE (challenge_id, question_id)
      )
    `);
    logger.info("weekly_challenge_questions table ready");

    await pool.query(`
      ALTER TABLE published_stats
        ADD COLUMN IF NOT EXISTS week_start DATE
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_published_stats_week_start
        ON published_stats(week_start)
    `);
    logger.info("published_stats.week_start ready");
  } catch (err) {
    logger.error("weeklyChallengeMigration failed:", err.message);
    throw err;
  }
};

export default migration;
