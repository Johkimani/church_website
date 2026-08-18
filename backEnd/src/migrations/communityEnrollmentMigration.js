import { db } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

export const communityEnrollmentMigration = async () => {
  try {
    await db.query(`
      ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS member_id VARCHAR(50);
    `);
    await db.query(`
      ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS gender VARCHAR(20);
    `);
    await db.query(`
      ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS course VARCHAR(100);
    `);
    await db.query(`
      ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS year_of_study VARCHAR(20);
    `);
    await db.query(`
      ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
    `);
    await db.query(`
      ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS joined_at TIMESTAMP DEFAULT NOW();
    `);
    await db.query(`
      ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS class_id VARCHAR(50);
    `);

    await db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_enrollments_module_phone
      ON enrollments(module_id, phone) WHERE phone IS NOT NULL AND phone != '';
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_enrollments_module_id
      ON enrollments(module_id);
    `);

    logger.info("community_enrollment migration complete");
  } catch (error) {
    logger.error("community_enrollment migration failed:", error.message);
  }
};

export default communityEnrollmentMigration;
