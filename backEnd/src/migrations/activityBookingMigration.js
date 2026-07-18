import { testDb as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

const migration = async () => {
  try {
    await pool.query(`
      ALTER TABLE semester_activities
        ADD COLUMN IF NOT EXISTS fare NUMERIC DEFAULT NULL;
    `);
    await pool.query(`
      ALTER TABLE weekly_activities
        ADD COLUMN IF NOT EXISTS fare NUMERIC DEFAULT NULL;
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activity_bookings (
        id SERIAL PRIMARY KEY,
        activity_type VARCHAR(20) NOT NULL CHECK (activity_type IN ('weekly', 'semester')),
        activity_id INTEGER NOT NULL,
        member_id VARCHAR NOT NULL,
        member_name VARCHAR NOT NULL DEFAULT '',
        member_email VARCHAR DEFAULT '',
        jumuiya_id VARCHAR DEFAULT '',
        year_of_study VARCHAR DEFAULT '',
        phone VARCHAR DEFAULT '',
        fare NUMERIC NOT NULL DEFAULT 0,
        paid_amount NUMERIC NOT NULL DEFAULT 0,
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'cancelled')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure columns exist on pre-existing tables (idempotent backfill)
    await pool.query(`ALTER TABLE activity_bookings ADD COLUMN IF NOT EXISTS member_name VARCHAR NOT NULL DEFAULT ''`);
    await pool.query(`ALTER TABLE activity_bookings ADD COLUMN IF NOT EXISTS member_email VARCHAR DEFAULT ''`);
    await pool.query(`ALTER TABLE activity_bookings ADD COLUMN IF NOT EXISTS jumuiya_id VARCHAR DEFAULT ''`);
    await pool.query(`ALTER TABLE activity_bookings ADD COLUMN IF NOT EXISTS year_of_study VARCHAR DEFAULT ''`);
    await pool.query(`ALTER TABLE activity_bookings ADD COLUMN IF NOT EXISTS phone VARCHAR DEFAULT ''`);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activity_payments (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER NOT NULL REFERENCES activity_bookings(id) ON DELETE CASCADE,
        amount NUMERIC NOT NULL,
        checkout_id VARCHAR UNIQUE,
        mpesa_receipt VARCHAR DEFAULT '',
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    logger.info("activity booking tables + fare columns ready");
  } catch (err) {
    logger.error("activityBookingMigration failed:", err.message);
    throw err;
  }
};

export default migration;
