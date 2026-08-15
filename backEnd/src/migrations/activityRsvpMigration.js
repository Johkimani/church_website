// src/migrations/activityRsvpMigration.js
// "Who's coming?" — free RSVP against a weekly or semester activity so the
// community can signal attendance without tying into the paid booking flow.
import { testDb as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

const migration = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activity_rsvps (
        id SERIAL PRIMARY KEY,
        activity_type VARCHAR(20) NOT NULL CHECK (activity_type IN ('weekly', 'semester')),
        activity_id INTEGER NOT NULL,
        member_id VARCHAR NOT NULL,
        member_name VARCHAR NOT NULL DEFAULT '',
        going BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Idempotent backfills for pre-existing tables
    await pool.query(`ALTER TABLE activity_rsvps ADD COLUMN IF NOT EXISTS member_name VARCHAR NOT NULL DEFAULT ''`);
    await pool.query(`ALTER TABLE activity_rsvps ADD COLUMN IF NOT EXISTS going BOOLEAN NOT NULL DEFAULT TRUE`);

    // Scalability: index the filter columns, and keep one row per member/activity
    // so the upsert below never creates duplicates. Non-critical on failure.
    try {
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_activity_rsvps_activity ON activity_rsvps (activity_type, activity_id);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_activity_rsvps_member ON activity_rsvps (member_id);`);
      await pool.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS activity_rsvps_member_key
        ON activity_rsvps (activity_type, activity_id, member_id);
      `);
    } catch (err) {
      logger.error("activity rsvp indexes failed (continuing):", err.message);
    }

    logger.info("activity_rsvps table ready");
  } catch (err) {
    logger.error("activityRsvpMigration failed:", err.message);
    throw err;
  }
};

export default migration;
