import { db } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

/**
 * Drops the NOT NULL constraint on enrollments.class_id.
 *
 * The column was created nullable by communityEnrollmentMigration, but the
 * production database ended up with a NOT NULL constraint (likely from an
 * earlier manual change). The community join INSERT omits class_id, so the
 * constraint causes a 23502 error on every submission.
 */
export const relaxEnrollmentClassId = async () => {
  try {
    await db.query(
      `ALTER TABLE enrollments ALTER COLUMN class_id DROP NOT NULL;`
    );
    logger.debug("relaxEnrollmentClassId: NOT NULL dropped on enrollments.class_id");
  } catch (error) {
    // 42704 = column does not exist, P0000 = already nullable — both fine
    if (error?.code === "42704" || error?.message?.includes("is not already")) {
      logger.debug("relaxEnrollmentClassId: no-op");
      return;
    }
    logger.warn(`relaxEnrollmentClassId failed (non-fatal): ${error.message}`);
  }
};

export default relaxEnrollmentClassId;
