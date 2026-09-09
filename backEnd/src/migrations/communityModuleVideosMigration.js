import { db as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

export default async function communityModuleVideosMigration() {
  logger.info("Running community module videos migration...");

  // 1. Create table if it doesn't exist yet
  try {
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
    logger.info("[videos migration] Table ensured.");
  } catch (e) {
    logger.error("[videos migration] CREATE TABLE failed:", e.message);
  }

  // 2. Ensure index on module_id
  try {
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_community_module_videos_module_id
      ON community_module_videos(module_id);
    `);
  } catch (e) {
    logger.warn("[videos migration] Index creation skipped:", e.message);
  }

  // 3. Add missing columns one at a time (safe: each statement is independent)
  const alterations = [
    `ALTER TABLE community_module_videos ADD COLUMN IF NOT EXISTS video_file_url VARCHAR(500) DEFAULT NULL`,
    `ALTER TABLE community_module_videos ADD COLUMN IF NOT EXISTS cloudinary_public_id VARCHAR(255) DEFAULT NULL`,
    `ALTER TABLE community_module_videos ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR(500) DEFAULT NULL`,
    `ALTER TABLE community_module_videos ADD COLUMN IF NOT EXISTS posted_by VARCHAR(100) DEFAULT NULL`,
    // video_type: add without NOT NULL first (safe for existing rows), then set default
    `ALTER TABLE community_module_videos ADD COLUMN IF NOT EXISTS video_type VARCHAR(20) DEFAULT 'link'`,
  ];

  for (const sql of alterations) {
    try {
      await pool.query(sql);
    } catch (e) {
      logger.warn(`[videos migration] Alteration skipped (${e.message}): ${sql.slice(0, 60)}`);
    }
  }

  // 4. Back-fill any NULL video_type values so NOT NULL is safe
  try {
    await pool.query(`UPDATE community_module_videos SET video_type = 'link' WHERE video_type IS NULL`);
  } catch (e) {
    logger.warn("[videos migration] Back-fill video_type skipped:", e.message);
  }

  // 5. Unique constraint needed for ON CONFLICT (module_id, video_url) on link videos
  try {
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_community_module_videos_module_url
      ON community_module_videos(module_id, video_url)
      WHERE video_url IS NOT NULL;
    `);
    logger.info("[videos migration] Unique index on (module_id, video_url) ensured.");
  } catch (e) {
    logger.warn("[videos migration] Unique index skipped:", e.message);
  }

  // 6. Relax NOT NULL on video_url — uploaded videos have no video_url, only video_file_url.
  //    The original table was created with video_url NOT NULL, blocking all upload inserts.
  try {
    await pool.query(`ALTER TABLE community_module_videos ALTER COLUMN video_url DROP NOT NULL`);
    logger.info("[videos migration] video_url NOT NULL constraint removed.");
  } catch (e) {
    logger.warn("[videos migration] video_url NOT NULL drop skipped:", e.message);
  }

  // 7. Relax NOT NULL on platform — the column has DEFAULT 'upload' but original schema
  //    may have set it NOT NULL without a default, which can cause issues on edge cases.
  try {
    await pool.query(`ALTER TABLE community_module_videos ALTER COLUMN platform DROP NOT NULL`);
    logger.info("[videos migration] platform NOT NULL constraint removed.");
  } catch (e) {
    logger.warn("[videos migration] platform NOT NULL drop skipped:", e.message);
  }

  logger.info("Community module videos migration complete.");
}
