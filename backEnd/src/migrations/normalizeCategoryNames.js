import { db as pool } from '../Configs/dbConfig.js';
import logger from '../logger/winston.js';

/**
 * One-time migration: Normalize CSA official category names to match the
 * frontend constants (adminConstants.ts / POSITION_BY_CATEGORY).
 *
 * Old names  →  New names
 *   'Rosary'    →  'Rosary Coordinators'
 *   'Liturgist' →  'Liturgists'
 */
export default async function normalizeCategoryNames() {
  try {
    const result = await pool.query(`
      UPDATE officials
      SET category = CASE
        WHEN category = 'Rosary'    THEN 'Rosary Coordinators'
        WHEN category = 'Liturgist' THEN 'Liturgists'
        ELSE category
      END
      WHERE category IN ('Rosary', 'Liturgist')
      RETURNING id, name, category
    `);

    if (result.rowCount > 0) {
      logger.info(
        `normalizeCategoryNames: renamed ${result.rowCount} official(s): ` +
        result.rows.map(r => `${r.name} → ${r.category}`).join(', ')
      );
    } else {
      logger.info('normalizeCategoryNames: no rows needed renaming.');
    }
  } catch (err) {
    logger.error('normalizeCategoryNames migration failed: ' + err.message);
  }
}
