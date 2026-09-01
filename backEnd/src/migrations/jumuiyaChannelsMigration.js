import { db } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

/**
 * Converts legacy "Email" contact channels into "TikTok" for jumuiyas.
 *
 * The user-facing channels for each jumuiya historically offered WhatsApp,
 * Facebook and Email, but the email link was unused. Going forward the
 * three channels are WhatsApp, Facebook and TikTok. This migration relabels
 * any existing jumuiya_social_media row whose platform is Email/Mail to
 * TikTok, dropping the now-meaningless mailto: URL in favour of a neutral
 * placeholder that officials can replace from the new Channels admin page.
 *
 * Note: only the Email->TikTok conversion lives here. The actual per-jumuiya
 * channel URLs (WhatsApp/Facebook/TikTok) are managed through the admin
 * Channels page, which upserts the same table.
 *
 * Idempotent: matches case-insensitively and skips rows that have already
 * been converted or lack an Email platform.
 */
export const jumuiyaChannelsMigration = async () => {
  try {
    const PLACEHOLDER_URL = "https://www.tiktok.com/@csakirinyaga";

    const result = await db.query(
      `UPDATE jumuiya_social_media
       SET platform = 'TikTok',
           url = $1
       WHERE LOWER(platform) IN ('email', 'mail', 'e-mail')
       RETURNING jumuiya_id, id, url`,
      [PLACEHOLDER_URL]
    );

    if (result.rows.length > 0) {
      logger.info(
        `jumuiyaChannelsMigration: converted ${result.rows.length} Email channel(s) to TikTok`
      );
    } else {
      logger.debug("jumuiyaChannelsMigration: no Email channels to convert");
    }
  } catch (error) {
    // Never block server startup over a cleanup migration
    logger.warn(`jumuiyaChannelsMigration failed (non-fatal): ${error.message}`);
  }
};

export default jumuiyaChannelsMigration;
