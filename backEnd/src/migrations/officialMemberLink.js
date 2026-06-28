import { db as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

const setupOfficialMemberLink = async () => {
  try {
    logger.info("Adding reg_number column to officials tables...");

    await pool.query(`
      ALTER TABLE officials
      ADD COLUMN IF NOT EXISTS reg_number VARCHAR(30);
    `);

    await pool.query(`
      ALTER TABLE jumuiya_officials
      ADD COLUMN IF NOT EXISTS reg_number VARCHAR(30);
    `);

    logger.info("reg_number columns added successfully");
  } catch (error) {
    logger.error("Failed to add reg_number columns:", error.message);
    throw error;
  }
};

export { setupOfficialMemberLink };
