import { db } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

/**
 * Removes the retired "General Parish" community module.
 *
 * The community hub now shows exactly five ministry groups plus a dedicated
 * "Our Jumuiyas" link card, so the General Parish entry in hub_modules is no
 * longer used. Deleting the row cascades to its dependent content
 * (hub_gallery, announcements, schedules, etc. all reference
 * hub_modules(id) ON DELETE CASCADE).
 *
 * Idempotent: matches by id/title pattern so it is safe to run repeatedly,
 * and does nothing when the row is already gone.
 */
export const removeGeneralParishModule = async () => {
  try {
    const result = await db.query(
      `DELETE FROM hub_modules
       WHERE (id ILIKE '%parish%' OR title ILIKE '%general%parish%')
         AND id NOT IN ('choir', 'dancers', 'charismatic', 'st-francis', 'youth')
       RETURNING id, title`
    );

    if (result.rows.length > 0) {
      for (const row of result.rows) {
        logger.info(
          `removeGeneralParishModule: deleted hub_modules row "${row.id}" (${row.title})`
        );
      }
    } else {
      logger.debug("removeGeneralParishModule: no matching rows (already removed)");
    }
  } catch (error) {
    // Non-fatal — never block server startup over a cleanup migration
    logger.warn(`removeGeneralParishModule failed (non-fatal): ${error.message}`);
  }
};

export default removeGeneralParishModule;
