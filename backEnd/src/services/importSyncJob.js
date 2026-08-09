import { db as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";
import bcrypt from "bcrypt";

const SYNC_INTERVAL = 5 * 60 * 1000;
let intervalHandle = null;

export const syncNewImportRecords = async () => {
  try {
    const csaResult = await pool.query(`
      INSERT INTO members (
        member_id, first_name, last_name, phone, gender,
        source, status, import_batch_id, join_date, migrated_to_associates,
        jumuiya_id
      )
      SELECT
        ir.cleaned_reg_number,
        split_part(ir.cleaned_name, ' ', 1),
        substr(ir.cleaned_name, strpos(ir.cleaned_name || ' ', ' ') + 1),
        ir.cleaned_phone,
        CASE WHEN LOWER(ir.cleaned_gender) IN ('male', 'female') THEN LOWER(ir.cleaned_gender) ELSE NULL END,
        'csa',
        ir.status,
        mi.id,
        mi.created_at,
        COALESCE(ir.migrated_to_associates, false),
        sg.group_id
      FROM import_records ir
      JOIN member_imports mi ON mi.id = ir.import_id
      LEFT JOIN sub_groups sg ON sg.name = ir.cleaned_jumuiya
      WHERE mi.jumuiya_id = 'csa'
        AND ir.status IN ('valid', 'warning')
        AND ir.cleaned_reg_number IS NOT NULL AND ir.cleaned_reg_number != ''
        AND NOT EXISTS (SELECT 1 FROM members WHERE member_id = ir.cleaned_reg_number)
      ON CONFLICT (member_id) DO NOTHING
    `);

    const directResult = await pool.query(`
      INSERT INTO members (
        member_id, first_name, last_name, phone, gender,
        source, status, import_batch_id, join_date, migrated_to_associates,
        jumuiya_id
      )
      SELECT
        ir.cleaned_reg_number,
        split_part(ir.cleaned_name, ' ', 1),
        substr(ir.cleaned_name, strpos(ir.cleaned_name || ' ', ' ') + 1),
        NULLIF(ir.cleaned_phone, ''),
        CASE WHEN LOWER(ir.cleaned_gender) IN ('male', 'female') THEN LOWER(ir.cleaned_gender) ELSE NULL END,
        'jum',
        ir.status,
        mi.id,
        mi.created_at,
        COALESCE(ir.migrated_to_associates, false),
        sg.group_id
      FROM import_records ir
      JOIN member_imports mi ON mi.id = ir.import_id
      LEFT JOIN sub_groups sg ON sg.name = ir.cleaned_jumuiya OR sg.group_id::text = ir.cleaned_jumuiya
      WHERE mi.jumuiya_id != 'csa'
        AND ir.status IN ('valid', 'warning')
        AND ir.cleaned_reg_number IS NOT NULL AND ir.cleaned_reg_number != ''
        AND NOT EXISTS (SELECT 1 FROM members WHERE member_id = ir.cleaned_reg_number)
      ON CONFLICT (member_id) DO NOTHING
    `);

    const total = (csaResult.rowCount || 0) + (directResult.rowCount || 0);

    if (total > 0) {
      await pool.query(`
        UPDATE members m
        SET email = dedup.cleaned_email
        FROM (
          SELECT DISTINCT ON (ir.cleaned_email) ir.cleaned_reg_number, ir.cleaned_email
          FROM import_records ir
          WHERE ir.cleaned_email IS NOT NULL AND ir.cleaned_email != ''
            AND ir.cleaned_reg_number IN (
              SELECT member_id FROM members
              WHERE email IS NULL
                AND member_id = ir.cleaned_reg_number
            )
          ORDER BY ir.cleaned_email, ir.id
        ) dedup
        WHERE m.member_id = dedup.cleaned_reg_number
          AND m.email IS NULL
          AND NOT EXISTS (SELECT 1 FROM members m2 WHERE m2.email = dedup.cleaned_email AND m2.member_id != m.member_id)
      `);
    }

    if (total > 0) {
      logger.info(`Sync: inserted ${total} new members from import_records`);
    }

    // Backfill bcrypt passwords for any member with a missing or plaintext
    // password asynchronously and concurrently so HTTP requests return instantly.
    const needHashing = await pool.query(
      `SELECT member_id FROM members
       WHERE password IS NULL OR password NOT LIKE '$2%'`
    );
    if (needHashing.rows.length > 0) {
      setImmediate(async () => {
        try {
          const CHUNK_SIZE = 10;
          for (let i = 0; i < needHashing.rows.length; i += CHUNK_SIZE) {
            const chunk = needHashing.rows.slice(i, i + CHUNK_SIZE);
            await Promise.all(
              chunk.map(async (row) => {
                const hash = await bcrypt.hash(row.member_id, 10);
                await pool.query(
                  `UPDATE members SET password = $1 WHERE member_id = $2`,
                  [hash, row.member_id]
                );
              })
            );
          }
          logger.info(`Sync: hashed ${needHashing.rows.length} member password(s)`);
        } catch (hErr) {
          logger.warn(`Password hashing error: ${hErr.message}`);
        }
      });
    }
  } catch (error) {
    logger.warn(`Import sync cycle failed: ${error.message}`);
  }
};

export const startImportSyncWorker = () => {
  if (intervalHandle) return;
  logger.info("Import sync worker started (every 5 min)");
  setTimeout(syncNewImportRecords, 15000);
  intervalHandle = setInterval(syncNewImportRecords, SYNC_INTERVAL);
};

export const stopImportSyncWorker = () => {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
    logger.info("Import sync worker stopped");
  }
};
