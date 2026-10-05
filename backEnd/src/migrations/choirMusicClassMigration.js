import { db } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

/**
 * Adds wants_music_class to enrollments.
 *
 * The choir join form replaced the self-evaluated "Sight-Reading & Music
 * Level" question with an optional "I want to join music classes" checkbox.
 * Choir officials get a dedicated Music Class tab listing members who opted
 * in (name + phone).
 */
export const choirMusicClassMigration = async () => {
  try {
    await db.query(`
      ALTER TABLE enrollments
        ADD COLUMN IF NOT EXISTS wants_music_class BOOLEAN DEFAULT FALSE;
    `);
    logger.debug("choirMusicClassMigration: column ensured");
  } catch (error) {
    // Non-fatal — never block server startup over a schema nicety
    logger.warn(`choirMusicClassMigration failed (non-fatal): ${error.message}`);
  }
};

export default choirMusicClassMigration;
