import { db as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

const serialConfigMigration = async () => {
  try {
    logger.info("Running serial_config migration...");

    // Singleton config row: holds the next auto-generated serial number
    await pool.query(`
      CREATE TABLE IF NOT EXISTS serial_config (
        id          SERIAL PRIMARY KEY,
        next_serial INTEGER NOT NULL DEFAULT 1,
        updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed exactly one row if the table is empty
    const { rows } = await pool.query("SELECT COUNT(*)::int AS cnt FROM serial_config");
    if (rows[0].cnt === 0) {
      // Start from MAX(serial_no) + 1 so we never overlap existing rows
      await pool.query(`
        INSERT INTO serial_config (next_serial)
        SELECT GREATEST(COALESCE(MAX(serial_no), 0) + 1, 1)
        FROM registered
      `);
      logger.info("Seeded serial_config from existing registered rows");
    }

    // Replace the trigger function to read from serial_config
    await pool.query(`
      CREATE OR REPLACE FUNCTION auto_assign_serial_no()
      RETURNS TRIGGER AS $$
      DECLARE
        seed INT;
      BEGIN
        IF NEW.serial_no IS NULL THEN
          -- Lock the config row to prevent race conditions
          SELECT next_serial INTO seed
            FROM serial_config WHERE id = 1 FOR UPDATE;
          IF seed IS NOT NULL THEN
            NEW.serial_no := seed;
            UPDATE serial_config SET next_serial = seed + 1,
                                      updated_at  = CURRENT_TIMESTAMP
            WHERE id = 1;
          ELSE
            -- Fallback: no config row yet, use MAX + 1
            NEW.serial_no := (SELECT COALESCE(MAX(serial_no), 0) + 1 FROM registered);
          END IF;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    logger.info("serial_config migration complete");
  } catch (error) {
    logger.error("serial_config migration failed:", error.message);
    throw error;
  }
};

export default serialConfigMigration;
