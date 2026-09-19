import { db as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

/**
 * Prayer Partners feature (Jumuiya Liturgist ministry).
 * A jumuiya official groups members into prayer-partner units of 2 or 3
 * (ladies-first year columns on the UI). Each group is a row in
 * prayer_partner_groups; its members are rows in prayer_partner_members.
 * A member can only belong to one group at a time (unique member_id).
 */
const setupPrayerPartners = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS prayer_partner_groups (
        id SERIAL PRIMARY KEY,
        jumuiya_id UUID NOT NULL REFERENCES sub_groups(group_id) ON DELETE CASCADE,
        created_by VARCHAR(50),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS prayer_partner_members (
        id SERIAL PRIMARY KEY,
        group_id INTEGER NOT NULL REFERENCES prayer_partner_groups(id) ON DELETE CASCADE,
        member_id VARCHAR(50) NOT NULL REFERENCES members(member_id) ON DELETE CASCADE,
        position_no SMALLINT NOT NULL,
        year_of_study SMALLINT,
        gender VARCHAR(20),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_prayer_partner_member UNIQUE (member_id)
      );
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_prayer_partner_groups_jumuiya
      ON prayer_partner_groups(jumuiya_id);
    `);

    logger.info("setupPrayerPartners completed: tables prayer_partner_groups + prayer_partner_members ensured.");
  } catch (err) {
    logger.error("setupPrayerPartners failed: " + err.message);
  }
};

export default setupPrayerPartners;