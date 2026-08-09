import { db as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";
import bcrypt from "bcrypt";

const consolidateMemberData = async () => {
  try {
    logger.info("Starting member data consolidation...");

    // 1. Add columns if they don't exist and relax email constraint
    await pool.query(`
      ALTER TABLE members
      ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'legacy',
      ADD COLUMN IF NOT EXISTS status VARCHAR(20),
      ADD COLUMN IF NOT EXISTS import_batch_id INTEGER
    `);
    await pool.query(`
      ALTER TABLE members ALTER COLUMN email DROP NOT NULL
    `).catch(() => {});
    await pool.query(`
      ALTER TABLE members ALTER COLUMN jumuiya_id DROP NOT NULL
    `).catch(() => {});
    await pool.query(`
      ALTER TABLE members ALTER COLUMN jumuiaya_id DROP NOT NULL
    `).catch(() => {});
    await pool.query(`
      ALTER TABLE members ALTER COLUMN last_name DROP NOT NULL
    `).catch(() => {});
    await pool.query(`
      ALTER TABLE members ALTER COLUMN password DROP NOT NULL
    `).catch(() => {});

    // 2. Mark existing members as legacy (only if source is not yet set)
    await pool.query(`
      UPDATE members SET source = 'jum' WHERE source IN ('legacy', 'import')
    `);

    // 3. Migrate CSA import records (without email to avoid UNIQUE conflicts)
    const csaResult = await pool.query(`
      INSERT INTO members (
        member_id, first_name, last_name, phone, gender,
        source, status, import_batch_id, join_date, migrated_to_associates,
        jumuiya_id, password
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
        sg.group_id,
        ir.cleaned_reg_number
      FROM import_records ir
      JOIN member_imports mi ON mi.id = ir.import_id
      LEFT JOIN sub_groups sg ON sg.name = ir.cleaned_jumuiya
      WHERE mi.jumuiya_id = 'csa'
        AND ir.status IN ('valid', 'warning')
        AND ir.cleaned_reg_number IS NOT NULL
        AND ir.cleaned_reg_number != ''
      ON CONFLICT (member_id) DO NOTHING
    `);
    logger.info(`Migrated ${csaResult.rowCount} CSA records into members table`);

    // 4. Migrate direct import records (without email to avoid UNIQUE conflicts)
    await pool.query(`
      INSERT INTO members (
        member_id, first_name, last_name, phone, gender,
        source, status, import_batch_id, join_date, migrated_to_associates,
        jumuiya_id, password
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
        sg.group_id,
        ir.cleaned_reg_number
      FROM import_records ir
      JOIN member_imports mi ON mi.id = ir.import_id
      LEFT JOIN sub_groups sg ON sg.name = ir.cleaned_jumuiya OR sg.group_id::text = ir.cleaned_jumuiya
      WHERE mi.jumuiya_id != 'csa'
        AND ir.status IN ('valid', 'warning')
        AND ir.cleaned_reg_number IS NOT NULL
        AND ir.cleaned_reg_number != ''
      ON CONFLICT (member_id) DO NOTHING
    `);

    // 5. Populate emails where there's no conflict (covers both CSA and direct imports)
    const emailResult = await pool.query(`
      UPDATE members m
      SET email = dedup.cleaned_email
      FROM (
        SELECT DISTINCT ON (ir.cleaned_email) ir.cleaned_reg_number, ir.cleaned_email
        FROM import_records ir
        WHERE ir.cleaned_email IS NOT NULL AND ir.cleaned_email != ''
        ORDER BY ir.cleaned_email, ir.id
      ) dedup
      WHERE m.member_id = dedup.cleaned_reg_number
        AND NOT EXISTS (SELECT 1 FROM members m2 WHERE m2.email = dedup.cleaned_email AND m2.member_id != m.member_id)
    `);
    logger.info(`Set ${emailResult.rowCount} emails on members table`);

    // 6. Hash any plaintext passwords that may have been imported as raw text
    const plaintextPasswords = await pool.query(`
      SELECT member_id, password FROM members
      WHERE password IS NOT NULL
        AND password !~ '^\\$2[abxy]\\$'
    `);
    for (const row of plaintextPasswords.rows) {
      const hashed = await bcrypt.hash(row.password, 10);
      await pool.query(`UPDATE members SET password = $1 WHERE member_id = $2`, [hashed, row.member_id]);
      logger.info(`Hashed plaintext password for ${row.member_id}`);
    }
    if (plaintextPasswords.rows.length > 0) {
      logger.info(`Hashed ${plaintextPasswords.rows.length} plaintext passwords`);
    }

    logger.info("Member data consolidation complete");
  } catch (error) {
    logger.error(`Failed to consolidate member data: ${error.message}`);
    throw error;
  }
};

export { consolidateMemberData };
