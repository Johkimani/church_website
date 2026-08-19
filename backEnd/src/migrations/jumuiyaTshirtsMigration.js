import { db } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

const DEFAULT_JUMUIYAS = [
  "st-anthony",
  "st-augustine",
  "st-catherine",
  "st-dominic",
  "st-elizabeth",
  "st-maria-goretti",
  "st-monica",
];

export const jumuiyaTshirtsMigration = async () => {
  try {
    // 1. Ensure jumuiya_tshirt_settings table exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS jumuiya_tshirt_settings (
        id SERIAL PRIMARY KEY,
        jumuiya_id VARCHAR(100) UNIQUE NOT NULL,
        payment_phone VARCHAR(50),
        account_name VARCHAR(150),
        payment_instructions TEXT,
        unit_price NUMERIC(10,2) NOT NULL DEFAULT 1200,
        is_active BOOLEAN DEFAULT TRUE,
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 2. Ensure base jumuiya_tshirt_orders table exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS jumuiya_tshirt_orders (
        id SERIAL PRIMARY KEY,
        jumuiya_id VARCHAR(100) NOT NULL,
        holder_name VARCHAR(200) NOT NULL,
        payer_name VARCHAR(200),
        phone VARCHAR(50),
        size VARCHAR(10) NOT NULL DEFAULT 'M',
        quantity INTEGER NOT NULL DEFAULT 1,
        submitted_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 3. Add any enhanced tracking columns to jumuiya_tshirt_orders if missing
    await db.query(`
      ALTER TABLE jumuiya_tshirt_orders 
        ADD COLUMN IF NOT EXISTS member_id VARCHAR(100),
        ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'pending_confirmation',
        ADD COLUMN IF NOT EXISTS mpesa_code VARCHAR(100),
        ADD COLUMN IF NOT EXISTS unit_price NUMERIC(10,2) DEFAULT 1200,
        ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10,2) DEFAULT 1200,
        ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
        ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP,
        ADD COLUMN IF NOT EXISTS confirmed_by VARCHAR(100),
        ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP,
        ADD COLUMN IF NOT EXISTS completed_by VARCHAR(100),
        ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP,
        ADD COLUMN IF NOT EXISTS cancelled_by VARCHAR(100);
    `);

    // 4. Create helpful indexes
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_jumuiya_tshirt_orders_jumuiya ON jumuiya_tshirt_orders(jumuiya_id);
      CREATE INDEX IF NOT EXISTS idx_jumuiya_tshirt_orders_member ON jumuiya_tshirt_orders(member_id);
      CREATE INDEX IF NOT EXISTS idx_jumuiya_tshirt_orders_status ON jumuiya_tshirt_orders(status);
    `);

    // 5. Seed default settings for all known Jumuiyas if not existing
    for (const jId of DEFAULT_JUMUIYAS) {
      await db.query(
        `INSERT INTO jumuiya_tshirt_settings (jumuiya_id, unit_price, payment_instructions)
         VALUES ($1, 1200, 'Send payment to the provided mobile money number via M-Pesa. Use your Name/Reg as reference and enter the transaction code below.')
         ON CONFLICT (jumuiya_id) DO NOTHING;`,
        [jId]
      );
    }

    logger.info("jumuiya_tshirt_settings and jumuiya_tshirt_orders migration completed successfully");
  } catch (error) {
    logger.error("jumuiyaTshirtsMigration failed: " + error.message);
  }
};

export default jumuiyaTshirtsMigration;
