import { db } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

export const profileImageMigration = async () => {
  try {
    await db.query(`
      ALTER TABLE members
        ADD COLUMN IF NOT EXISTS profile_image VARCHAR(500) DEFAULT NULL;
    `);
    logger.info("Members table profile_image column ensured");
  } catch (error) {
    logger.error("Profile image migration failed:", error.message);
  }
};

export default profileImageMigration;
