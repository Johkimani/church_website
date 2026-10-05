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
        guest_reg VARCHAR DEFAULT '',
        fare NUMERIC NOT NULL DEFAULT 0,
        paid_amount NUMERIC NOT NULL DEFAULT 0,
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'cancelled')),
        is_guest BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure columns exist on pre-existing tables (idempotent backfill)
    await pool.query(`ALTER TABLE activity_bookings ADD COLUMN IF NOT EXISTS is_guest BOOLEAN NOT NULL DEFAULT FALSE`);
    await pool.query(`ALTER TABLE activity_bookings ADD COLUMN IF NOT EXISTS member_name VARCHAR NOT NULL DEFAULT ''`);
    await pool.query(`ALTER TABLE activity_bookings ADD COLUMN IF NOT EXISTS member_email VARCHAR DEFAULT ''`);
    await pool.query(`ALTER TABLE activity_bookings ADD COLUMN IF NOT EXISTS jumuiya_id VARCHAR DEFAULT ''`);
    await pool.query(`ALTER TABLE activity_bookings ADD COLUMN IF NOT EXISTS year_of_study VARCHAR DEFAULT ''`);
    await pool.query(`ALTER TABLE activity_bookings ADD COLUMN IF NOT EXISTS phone VARCHAR DEFAULT ''`);
    await pool.query(`ALTER TABLE activity_bookings ADD COLUMN IF NOT EXISTS guest_reg VARCHAR DEFAULT ''`);
    // The original table's CHECK only allowed ('pending','paid','cancelled') and
    // CREATE TABLE IF NOT EXISTS never rewrites it, so 'partial' (cash/M-Pesa
    // top-ups) was rejected. Replace the constraint with one that includes it.
    await pool.query(`
      ALTER TABLE activity_bookings
        DROP CONSTRAINT IF EXISTS activity_bookings_status_check;
    `);
    await pool.query(`
      ALTER TABLE activity_bookings
        ADD CONSTRAINT activity_bookings_status_check
        CHECK (status IN ('pending', 'partial', 'paid', 'cancelled'));
    `);

    // Scalability: index the filter columns used by the booking queries, then
    // dedupe any pre-existing duplicates and add partial UNIQUE indexes so two
    // simultaneous requests can never book the same member/activity twice.
    // Non-critical: a failure here is logged but must not block server boot.
    try {
      await pool.query(`
        WITH ranked AS (
          SELECT id,
                 ROW_NUMBER() OVER (
                   PARTITION BY activity_type, activity_id, member_id
                   ORDER BY created_at DESC, id DESC
                 ) AS rn
          FROM activity_bookings
          WHERE status <> 'cancelled'
        )
        UPDATE activity_bookings ab
        SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
        FROM ranked r
        WHERE ab.id = r.id AND r.rn > 1;
      `);
      await pool.query(`
        WITH ranked AS (
          SELECT id,
                 ROW_NUMBER() OVER (
                   PARTITION BY activity_type, activity_id, phone
                   ORDER BY created_at DESC, id DESC
                 ) AS rn
          FROM activity_bookings
          WHERE is_guest = true AND phone <> '' AND status <> 'cancelled'
        )
        UPDATE activity_bookings ab
        SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
        FROM ranked r
        WHERE ab.id = r.id AND r.rn > 1;
      `);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_activity_bookings_activity ON activity_bookings (activity_type, activity_id);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_activity_bookings_member ON activity_bookings (member_id);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_activity_bookings_phone ON activity_bookings (phone);`);
      await pool.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS activity_bookings_active_member_key
        ON activity_bookings (activity_type, activity_id, member_id)
        WHERE status <> 'cancelled';
      `);
      await pool.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS activity_bookings_active_guest_phone_key
        ON activity_bookings (activity_type, activity_id, phone)
        WHERE is_guest = true AND phone <> '' AND status <> 'cancelled';
      `);
    } catch (err) {
      logger.error("activity booking indexes failed (continuing):", err.message);
    }

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
