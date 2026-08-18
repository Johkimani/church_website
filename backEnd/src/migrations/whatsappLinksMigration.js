import { db } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

const JUMUIYAS = [
  { slug: "st-anthony", name: "St. Anthony of Padua" },
  { slug: "st-augustine", name: "St. Augustine of Hippo" },
  { slug: "st-catherine", name: "St. Catherine of Alexandria" },
  { slug: "st-dominic", name: "St. Dominic Guzman" },
  { slug: "st-elizabeth", name: "St. Elizabeth of Hungary" },
  { slug: "st-maria-goretti", name: "St. Maria Goretti" },
  { slug: "st-monica", name: "St. Monica of Hippo" },
];

const YEARS = [1, 2, 3, 4];

export const whatsappLinksMigration = async () => {
  try {
    // Ensure year_of_study column exists on members
    await db.query(`
      ALTER TABLE members
        ADD COLUMN IF NOT EXISTS year_of_study VARCHAR(9) DEFAULT NULL;
    `);
    logger.info("Members table year_of_study column ensured");

    // Build all 40 default keys
    const defaults = [
      // 1. CSA General
      { key: "whatsapp_general_link", description: "CSA main community group — all logged-in members" },

      // 2. CSA Year Groups (4)
      ...YEARS.map((y) => ({
        key: `whatsapp_year_${y}_link`,
        description: `CSA Year ${y} group — all Year ${y} students across Jumuiyas`,
      })),

      // 3. Jumuiya Main Groups (7)
      ...JUMUIYAS.map((j) => ({
        key: `whatsapp_jumuiya_${j.slug}_link`,
        description: `${j.name} general group — all members of this Jumuiya`,
      })),

      // 4. Jumuiya Year Groups (7 × 4 = 28)
      ...JUMUIYAS.flatMap((j) =>
        YEARS.map((y) => ({
          key: `whatsapp_jumuiya_${j.slug}_year_${y}_link`,
          description: `${j.name} Year ${y} group`,
        }))
      ),
    ];

    for (const { key, description } of defaults) {
      await db.query(
        `INSERT INTO system_settings (key, value, description, updated_at)
         VALUES ($1, '', $2, NOW())
         ON CONFLICT (key) DO NOTHING`,
        [key, description]
      );
    }

    logger.info(`WhatsApp links migration complete — ${defaults.length} keys seeded`);
  } catch (error) {
    logger.error("WhatsApp links migration failed:", error.message);
  }
};

export default whatsappLinksMigration;
