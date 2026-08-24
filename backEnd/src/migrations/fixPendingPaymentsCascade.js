import { db as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

const fixPendingPaymentsCascade = async () => {
  try {
    logger.info("Running pending_payments ON DELETE CASCADE fix...");

    const check = await pool.query(`
      SELECT pg_get_constraintdef(oid) AS def
      FROM pg_constraint
      WHERE conrelid = 'pending_payments'::regclass
        AND conname LIKE '%member_id%'
    `);

    const currentDef = check.rows[0]?.def || "";
    if (currentDef.includes("ON DELETE CASCADE")) {
      logger.info("pending_payments FK already has ON DELETE CASCADE, skipping");
      return;
    }

    await pool.query(`
      ALTER TABLE pending_payments
        DROP CONSTRAINT IF EXISTS pending_payments_member_id_fkey
    `);
    await pool.query(`
      ALTER TABLE pending_payments
        ADD CONSTRAINT pending_payments_member_id_fkey
        FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE
    `);

    logger.info("pending_payments FK updated with ON DELETE CASCADE");
  } catch (error) {
    logger.error("pending_payments cascade fix failed:", error.message);
    throw error;
  }
};

export { fixPendingPaymentsCascade };
