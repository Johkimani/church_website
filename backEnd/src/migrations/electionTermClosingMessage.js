import { db as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

/**
 * Adds a per-term closing tribute message shown beneath past-official cards
 * on the public Leadership History page. Written by admins from HistoryModal.
 */
const electionTermClosingMessage = async () => {
  try {
    await pool.query(`
      ALTER TABLE election_terms
      ADD COLUMN IF NOT EXISTS closing_message TEXT
    `);
    logger.info("electionTermClosingMessage complete — election_terms.closing_message ready");
  } catch (err) {
    logger.error("electionTermClosingMessage failed: " + err.message);
  }
};

export default electionTermClosingMessage;
