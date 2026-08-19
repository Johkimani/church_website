import { db as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

/**
 * Adds a `no` column (auto-assigned row count) to `registered` and
 * repurposes `serial_no` as the editable physical-card serial number.
 *
 * Before this migration:
 *   serial_no = auto-assigned sequential count (1, 2, 3...)
 *
 * After this migration:
 *   no         = auto-assigned sequential count (1, 2, 3...) — never editable
 *   serial_no  = physical card serial number — set manually by secretary
 */
const splitNoAndSerialNoMigration = async () => {
  try {
    logger.info("Running split-no-and-serial-no migration...");

    // 1. Add the `row_no` column (registration count)
    await pool.query(`
      ALTER TABLE registered
      ADD COLUMN IF NOT EXISTS row_no INTEGER
    `);

    // 2. Backfill any rows where row_no is still NULL (idempotent — safe to re-run)
    await pool.query(`
      WITH max_no AS (
        SELECT COALESCE(MAX(row_no), 0) AS base FROM registered
      ),
      to_fix AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY registration_date, id) + (SELECT base FROM max_no) AS row_num
        FROM registered
        WHERE row_no IS NULL
      )
      UPDATE registered
      SET row_no = to_fix.row_num
      FROM to_fix
      WHERE registered.id = to_fix.id
    `);
    logger.info('Backfilled any NULL row_no values from registration order');

    // 3. Replace the trigger function:
    //    - "no" is always auto-assigned (MAX + 1)
    //    - serial_no is auto-assigned from seed only when NULL
    await pool.query(`
      CREATE OR REPLACE FUNCTION auto_assign_serial_no()
      RETURNS TRIGGER AS $$
      DECLARE
        seed INT;
      BEGIN
        -- Auto-assign row count (row_no) if not provided
        IF NEW.row_no IS NULL THEN
          NEW.row_no := (SELECT COALESCE(MAX(row_no), 0) + 1 FROM registered);
        END IF;

        -- Auto-assign physical card serial_no from seed only when NULL
        IF NEW.serial_no IS NULL THEN
          SELECT next_serial INTO seed
            FROM serial_config WHERE id = 1 FOR UPDATE;
          IF seed IS NOT NULL THEN
            NEW.serial_no := seed;
            UPDATE serial_config
            SET next_serial = seed + 1,
                updated_at  = CURRENT_TIMESTAMP
            WHERE id = 1;
          ELSE
            NEW.serial_no := (SELECT COALESCE(MAX(serial_no), 0) + 1 FROM registered);
          END IF;
        END IF;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    logger.info("split-no-and-serial-no migration complete");
  } catch (error) {
    logger.error("split-no-and-serial-no migration failed:", error.message);
    throw error;
  }
};

export default splitNoAndSerialNoMigration;
