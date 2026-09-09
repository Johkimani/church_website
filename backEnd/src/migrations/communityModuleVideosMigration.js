import { db as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

export default async function communityModuleVideosMigration() {
  try {
    logger.info("Running community module videos migration...");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS community_module_videos (
        id SERIAL PRIMARY KEY,
        module_id VARCHAR(50) NOT NULL,
        platform VARCHAR(50) NOT NULL,
        video_url VARCHAR(500) NOT NULL,
        title VARCHAR(255) NOT NULL DEFAULT '',
        description TEXT DEFAULT '',
        thumbnail_url VARCHAR(500) DEFAULT NULL,
        posted_by VARCHAR(100) DEFAULT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(module_id, video_url)
      );
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_community_module_videos_module_id
      ON community_module_videos(module_id);
    `);

    logger.info("Community module videos migration complete");
  } catch (error) {
    logger.error("Community module videos migration failed:", error.message);
  }
}
