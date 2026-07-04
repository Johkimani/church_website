import { db as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

const authAuditMigration = async () => {
  try {
    logger.info("Running auth & audit migration...");

    await pool.query(`
      ALTER TABLE members
      ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255),
      ADD COLUMN IF NOT EXISTS email_verification_expires TIMESTAMP
    `);

    await pool.query(`
      ALTER TABLE member_roles
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);

    logger.info("Auth & audit migration complete");
  } catch (error) {
    logger.error("Auth & audit migration failed:", error.message);
    throw error;
  }
};

export { authAuditMigration };
