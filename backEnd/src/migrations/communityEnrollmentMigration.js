import { db } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

export const communityEnrollmentMigration = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id SERIAL PRIMARY KEY,
        module_id VARCHAR(50) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(255),
        gender VARCHAR(20),
        course VARCHAR(100),
        year_of_study VARCHAR(20),
        voice_type VARCHAR(50),
        music_level VARCHAR(50),
        member_id VARCHAR(50),
        status VARCHAR(50) DEFAULT 'Pending',
        rejection_reason TEXT,
        class_id VARCHAR(50),
        joined_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.query(`ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS member_id VARCHAR(50);`).catch(() => {});
    await db.query(`ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS gender VARCHAR(20);`).catch(() => {});
    await db.query(`ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS course VARCHAR(100);`).catch(() => {});
    await db.query(`ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS year_of_study VARCHAR(20);`).catch(() => {});
    await db.query(`ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS rejection_reason TEXT;`).catch(() => {});
    await db.query(`ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS joined_at TIMESTAMP DEFAULT NOW();`).catch(() => {});
    await db.query(`ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS class_id VARCHAR(50);`).catch(() => {});

    await db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_enrollments_module_phone
      ON enrollments(module_id, phone) WHERE phone IS NOT NULL AND phone != '';
    `).catch(() => {});

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_enrollments_module_id
      ON enrollments(module_id);
    `).catch(() => {});

    logger.info("community_enrollment migration complete");
  } catch (error) {
    logger.error("community_enrollment migration failed:", error.message);
  }
};

export default communityEnrollmentMigration;
