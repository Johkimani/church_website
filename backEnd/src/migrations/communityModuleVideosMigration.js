import { db as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

export default async function communityModuleVideosMigration() {
  try {
    logger.info("Running community module videos migration...");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS community_module_videos (
        id SERIAL PRIMARY KEY,
        module_id VARCHAR(50) NOT NULL,
        platform VARCHAR(50) NOT NULL DEFAULT 'upload',
        video_url VARCHAR(500) DEFAULT NULL,
        video_file_url VARCHAR(500) DEFAULT NULL,
        video_type VARCHAR(20) NOT NULL DEFAULT 'link',
        cloudinary_public_id VARCHAR(255) DEFAULT NULL,
        title VARCHAR(255) NOT NULL DEFAULT '',
        description TEXT DEFAULT '',
        thumbnail_url VARCHAR(500) DEFAULT NULL,
        posted_by VARCHAR(100) DEFAULT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_community_module_videos_module_id
      ON community_module_videos(module_id);
    `);

    // Add columns if table already existed from previous migration
    await pool.query(`
      ALTER TABLE community_module_videos
      ADD COLUMN IF NOT EXISTS video_file_url VARCHAR(500) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS video_type VARCHAR(20) NOT NULL DEFAULT 'link',
      ADD COLUMN IF NOT EXISTS cloudinary_public_id VARCHAR(255) DEFAULT NULL;
    `);

    logger.info("Community module videos migration complete");
  } catch (error) {
    logger.error("Community module videos migration failed:", error.message);
  }
}
