import { db as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

const backfillSemRegMigration = async () => {
  try {
    logger.info("Running sem_*_reg backfill migration...");

    const count = await pool.query(`SELECT COUNT(*)::int as cnt FROM registered WHERE status = 'active'`);
    const registeredCount = count.rows[0].cnt;

    if (registeredCount === 0) {
      logger.info("No registered members found — skipping sem_*_reg backfill");
      return;
    }

    const result = await pool.query(`
      WITH member_info AS (
        SELECT DISTINCT ON (r.member_id)
          r.member_id,
          m.year_of_study::int AS current_yos,
          r.registration_date,
          EXTRACT(YEAR FROM r.registration_date)::int AS reg_year,
          EXTRACT(MONTH FROM r.registration_date)::int AS reg_month,
          EXTRACT(YEAR FROM CURRENT_DATE)::int AS current_year
        FROM registered r
        JOIN members m ON m.member_id = r.member_id
        WHERE r.status = 'active'
          AND m.year_of_study ~ '^[1-4]$'
        ORDER BY r.member_id, r.registration_date DESC
      ),
      estimated AS (
        SELECT
          member_id,
          GREATEST(1, LEAST(4, current_yos - (current_year - reg_year))) AS yos_at_reg,
          CASE WHEN reg_month BETWEEN 1 AND 6 THEN 0 ELSE 1 END AS is_second_sem
        FROM member_info
      ),
      sem_cols AS (
        SELECT
          member_id,
          (yos_at_reg - 1) * 2 + is_second_sem AS sem_idx
        FROM estimated
        WHERE yos_at_reg BETWEEN 1 AND 4
      )
      UPDATE members m
      SET
        sem_1_reg = CASE WHEN sc.sem_idx = 0 THEN true ELSE m.sem_1_reg END,
        sem_2_reg = CASE WHEN sc.sem_idx = 1 THEN true ELSE m.sem_2_reg END,
        sem_3_reg = CASE WHEN sc.sem_idx = 2 THEN true ELSE m.sem_3_reg END,
        sem_4_reg = CASE WHEN sc.sem_idx = 3 THEN true ELSE m.sem_4_reg END,
        sem_5_reg = CASE WHEN sc.sem_idx = 4 THEN true ELSE m.sem_5_reg END,
        sem_6_reg = CASE WHEN sc.sem_idx = 5 THEN true ELSE m.sem_6_reg END,
        sem_7_reg = CASE WHEN sc.sem_idx = 6 THEN true ELSE m.sem_7_reg END,
        sem_8_reg = CASE WHEN sc.sem_idx = 7 THEN true ELSE m.sem_8_reg END
      FROM sem_cols sc
      WHERE m.member_id = sc.member_id
    `);

    logger.info(`Backfilled sem_*_reg for ${result.rowCount} members`);
    logger.info("Sem_*_reg backfill migration complete");
  } catch (error) {
    logger.error("Sem_*_reg backfill migration failed:", error.message);
    throw error;
  }
};

export { backfillSemRegMigration };
