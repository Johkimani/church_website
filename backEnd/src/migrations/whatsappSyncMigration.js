import { db } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

const VALID_URL_PREFIX = "https://chat.whatsapp.com/";

/**
 * Reconciles the two WhatsApp stores so they share one link per jumuiya:
 *
 * 1. system_settings -> jumuiya_social_media
 *    The green WhatsApp button reads whatsapp_jumuiya_<slug>_link from
 *    system_settings. Backfill this into the jumuiya Channels tab
 *    (jumuiya_social_media) so both surfaces point at the same group link.
 *
 * 2. jumuiya_social_media -> system_settings
 *    If a jumuiya's social_media WhatsApp row already holds a valid group link
 *    that system_settings does not, promote it so the green button agrees too.
 *
 * Idempotent: safe to run repeatedly on server startup.
 */
export const whatsappSyncMigration = async () => {
  try {
    const subGroups = await db.query(
      `SELECT slug, group_id FROM sub_groups WHERE slug IS NOT NULL`
    );

    let syncedToSocial = 0;
    let syncedToSettings = 0;

    for (const sg of subGroups.rows) {
      const key = `whatsapp_jumuiya_${sg.slug}_link`;
      const settingsRes = await db.query(
        `SELECT value FROM system_settings WHERE key = $1`,
        [key]
      );
      const settingLink = settingsRes.rows.length
        ? String(settingsRes.rows[0].value || "").trim()
        : "";

      const socialRes = await db.query(
        `SELECT url FROM jumuiya_social_media
         WHERE jumuiya_id = $1 AND LOWER(platform) = 'whatsapp'
         ORDER BY id LIMIT 1`,
        [sg.group_id]
      );
      const socialLink = socialRes.rows.length
        ? String(socialRes.rows[0]?.url || "").trim()
        : "";

      const settingIsValid = settingLink.startsWith(VALID_URL_PREFIX);
      const socialIsValid = socialLink.startsWith(VALID_URL_PREFIX);

      if (settingIsValid && settingLink !== socialLink) {
        // system_settings wins (it is the green-button source of truth)
        await db.query(
          `DELETE FROM jumuiya_social_media
           WHERE jumuiya_id = $1 AND LOWER(platform) = 'whatsapp'`,
          [sg.group_id]
        );
        await db.query(
          `INSERT INTO jumuiya_social_media (jumuiya_id, platform, url)
           VALUES ($1, 'WhatsApp', $2)`,
          [sg.group_id, settingLink]
        );
        syncedToSocial += 1;
      } else if (!settingIsValid && socialIsValid) {
        // Only the social row is valid — promote it to the green button store
        await db.query(
          `INSERT INTO system_settings (key, value, updated_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
          [key, socialLink]
        );
        syncedToSettings += 1;
      }
    }

    logger.info(
      `whatsappSyncMigration complete — social: ${syncedToSocial}, settings: ${syncedToSettings}`
    );
  } catch (error) {
    // Never block server startup over a reconciliation migration
    logger.warn(`whatsappSyncMigration failed (non-fatal): ${error.message}`);
  }
};

export default whatsappSyncMigration;
