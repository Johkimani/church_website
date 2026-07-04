import { db as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

const importRecordsCourseMigration = async () => {
  try {
    logger.info("Running import_records course migration...");

    await pool.query(`
      ALTER TABLE import_records
      ADD COLUMN IF NOT EXISTS raw_course VARCHAR(255),
      ADD COLUMN IF NOT EXISTS cleaned_course VARCHAR(255)
    `);

    logger.info("import_records course migration complete");
  } catch (error) {
    logger.error("import_records course migration failed:", error.message);
    throw error;
  }
};

export { importRecordsCourseMigration };
