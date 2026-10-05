import { db as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

/**
 * Contact uniqueness on `officials` was previously enforced across ALL rows
 * (active AND archived). That blocked backfilling/handing over whenever the
 * SAME person legitimately appears more than once — e.g. adding a former
 * Assistant Bible Coordinator who is also the current CSA Chairperson:
 * both records share a phone number, so creation failed with
 * 409 "Contact already in use" (unique violation 23505).
 *
 * Uniqueness is now scoped to ACTIVE officials only:
 *  - two different CURRENT officials still cannot share a contact number
 *  - historical/archived records may share contacts with anyone
 */
const relaxOfficialContactUniqueness = async () => {
  try {
    logger.info("Running relaxOfficialContactUniqueness...");

    const existing = await pool.query(
      `SELECT indexname FROM pg_indexes
       WHERE tablename = 'officials' AND indexname = 'unique_officials_contact_idx'`
    );
    if (existing.rows.length > 0) {
      await pool.query("DROP INDEX unique_officials_contact_idx");
      logger.info("Dropped global unique_officials_contact_idx");
    }

    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS unique_officials_contact_active_idx
      ON officials (contact)
      WHERE contact IS NOT NULL AND contact != ''
        AND (status = 'active' OR status IS NULL)
    `);

    logger.info("relaxOfficialContactUniqueness complete — contact uniqueness now active-officials-only");
  } catch (err) {
    logger.error("relaxOfficialContactUniqueness failed: " + err.message);
  }
};

export default relaxOfficialContactUniqueness;
