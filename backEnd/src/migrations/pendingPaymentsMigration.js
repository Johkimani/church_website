import { db as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

const pendingPaymentsMigration = async () => {
  try {
    logger.info("Running pending payments migration...");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS pending_payments (
        id SERIAL PRIMARY KEY,
        member_id VARCHAR NOT NULL REFERENCES members(member_id),
        member_name VARCHAR NOT NULL DEFAULT '',
        jumuiya_id VARCHAR NOT NULL DEFAULT '',
        jumuiya_name VARCHAR NOT NULL DEFAULT '',
        amount INTEGER NOT NULL DEFAULT 0,
        semesters JSONB NOT NULL DEFAULT '[]',
        semester_labels JSONB NOT NULL DEFAULT '[]',
        serial_no INTEGER,
        status VARCHAR NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
        registered_by VARCHAR NOT NULL DEFAULT '',
        registered_by_name VARCHAR NOT NULL DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        settled_at TIMESTAMP,
        settled_by VARCHAR
      )
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_pending_payments_status ON pending_payments(status)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_pending_payments_jumuiya ON pending_payments(jumuiya_id)
    `);

    logger.info("Pending payments migration complete");
  } catch (error) {
    logger.error("Pending payments migration failed:", error.message);
    throw error;
  }
};

export { pendingPaymentsMigration };
