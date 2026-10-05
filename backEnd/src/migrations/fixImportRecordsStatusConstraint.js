import { db as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

/**
 * The import_records.status CHECK constraint was originally created with
 * ('pending', 'valid', 'warning', 'error') but the code later started
 * setting status = 'processed' to mark records that have been fully
 * imported. This migration relaxes the constraint to include 'processed'.
 */
const fixImportRecordsStatusConstraint = async () => {
  try {
    logger.info("Running import_records status CHECK constraint fix...");

    const check = await pool.query(`
      SELECT pg_get_constraintdef(oid) AS def
      FROM pg_constraint
      WHERE conrelid = 'import_records'::regclass
        AND contype = 'c'
        AND pg_get_constraintdef(oid) LIKE '%status%'
    `);

    const currentDef = check.rows[0]?.def || "";
    if (currentDef.includes("processed")) {
      logger.info("import_records CHECK already includes 'processed', skipping");
      return;
    }

    // Drop old constraint (name may vary, so use a LIKE match)
    const constraintName = await pool.query(`
      SELECT conname FROM pg_constraint
      WHERE conrelid = 'import_records'::regclass
        AND contype = 'c'
        AND pg_get_constraintdef(oid) LIKE '%status%'
    `);

    if (constraintName.rows.length) {
      const cname = constraintName.rows[0].conname;
      await pool.query(`ALTER TABLE import_records DROP CONSTRAINT ${cname}`);
      logger.info(`Dropped old constraint: ${cname}`);
    }

    await pool.query(`
      ALTER TABLE import_records
        ADD CONSTRAINT import_records_status_check
        CHECK (status IN ('pending', 'valid', 'warning', 'error', 'processed'))
    `);

    logger.info("import_records CHECK constraint updated to include 'processed'");
  } catch (error) {
    logger.error("import_records status constraint fix failed:", error.message);
    throw error;
  }
};

export { fixImportRecordsStatusConstraint };
