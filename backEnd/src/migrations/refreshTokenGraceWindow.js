import { db } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

/**
 * Adds grace-window columns to refresh_tokens for safe token rotation.
 *
 * Rotation previously DELETED the used refresh-token row immediately, so two
 * tabs (or parallel requests) presenting the same cookie raced: the second
 * refresh found no matching row and force-logged the user out mid-session.
 *
 * With the grace window, the replaced token stays recognizable for a short
 * period (stored hashed in previous_token, valid until previous_valid_until),
 * letting the losing racer rotate cleanly instead of being logged out.
 */
export const refreshTokenGraceWindow = async () => {
  try {
    await db.query(`
      ALTER TABLE refresh_tokens
        ADD COLUMN IF NOT EXISTS previous_token TEXT,
        ADD COLUMN IF NOT EXISTS previous_valid_until TIMESTAMPTZ;
    `);
    logger.debug("refreshTokenGraceWindow: columns ensured");
  } catch (error) {
    logger.warn(`refreshTokenGraceWindow failed (non-fatal): ${error.message}`);
  }
};

export default refreshTokenGraceWindow;
