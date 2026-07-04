import { db as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

const registeredSerialNoMigration = async () => {
  try {
    logger.info("Running registered serial_no migration...");

    await pool.query(`
      ALTER TABLE registered
      ADD COLUMN IF NOT EXISTS serial_no INTEGER
    `);

    await pool.query(`
      CREATE OR REPLACE FUNCTION auto_assign_serial_no()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.serial_no IS NULL THEN
          NEW.serial_no := (SELECT COALESCE(MAX(serial_no), 0) + 1 FROM registered);
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS trg_auto_assign_serial_no ON registered
    `);

    await pool.query(`
      CREATE TRIGGER trg_auto_assign_serial_no
        BEFORE INSERT ON registered
        FOR EACH ROW
        EXECUTE FUNCTION auto_assign_serial_no()
    `);

    const existing = await pool.query("SELECT COUNT(*) FROM registered WHERE serial_no IS NOT NULL");
    if (parseInt(existing.rows[0].count) === 0) {
      await pool.query(`
        UPDATE registered
        SET serial_no = sub.new_serial
        FROM (
          SELECT id, row_number() OVER (ORDER BY registration_date, id) as new_serial
          FROM registered
        ) sub
        WHERE registered.id = sub.id
      `);
      logger.info("Backfilled serial_no for existing registered rows");
    }

    logger.info("Registered serial_no migration complete");
  } catch (error) {
    logger.error("Registered serial_no migration failed:", error.message);
    throw error;
  }
};

export { registeredSerialNoMigration };
