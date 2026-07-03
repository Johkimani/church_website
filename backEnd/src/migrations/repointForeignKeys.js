import { db as pool } from "../Configs/dbConfig.js";

export const repointForeignKeys = async () => {
  const client = await pool.connect();
  try {
    const check = await client.query(`
      SELECT data_type FROM information_schema.columns
      WHERE table_name = 'group_assignments' AND column_name = 'member_id'
    `);
    if (check.rows.length && check.rows[0].data_type === 'character varying') {
      console.log('[Migration] FKs already re-pointed to members.member_id, skipping');
      return;
    }

    await client.query('BEGIN');

    await client.query(`
      ALTER TABLE group_assignments DROP CONSTRAINT IF EXISTS group_assignments_member_id_group_id_key
    `);
    await client.query(`
      ALTER TABLE group_assignments ADD COLUMN member_varchar_id VARCHAR(30)
    `);
    await client.query(`
      UPDATE group_assignments ga
      SET member_varchar_id = ir.cleaned_reg_number
      FROM import_records ir
      WHERE ir.id = ga.member_id
    `);
    await client.query(`ALTER TABLE group_assignments DROP COLUMN member_id`);
    await client.query(`ALTER TABLE group_assignments DROP COLUMN import_record_id`);
    await client.query(`ALTER TABLE group_assignments RENAME COLUMN member_varchar_id TO member_id`);
    await client.query(`ALTER TABLE group_assignments ALTER COLUMN member_id SET NOT NULL`);
    await client.query(`
      ALTER TABLE group_assignments ADD CONSTRAINT group_assignments_member_id_fkey
        FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE
    `);
    await client.query(`
      ALTER TABLE group_assignments ADD CONSTRAINT group_assignments_member_id_group_id_key
        UNIQUE (member_id, group_id)
    `);

    await client.query(`
      ALTER TABLE allocation_approvals DROP CONSTRAINT IF EXISTS allocation_approvals_import_record_id_fkey
    `);
    await client.query(`
      ALTER TABLE allocation_approvals DROP CONSTRAINT IF EXISTS allocation_approvals_import_record_id_distribution_batch_id_key
    `);
    await client.query(`
      ALTER TABLE allocation_approvals ADD COLUMN member_id VARCHAR(30)
    `);
    await client.query(`
      UPDATE allocation_approvals aa
      SET member_id = ir.cleaned_reg_number
      FROM import_records ir
      WHERE ir.id = aa.import_record_id
    `);
    await client.query(`ALTER TABLE allocation_approvals DROP COLUMN import_record_id`);
    await client.query(`ALTER TABLE allocation_approvals ALTER COLUMN member_id SET NOT NULL`);
    await client.query(`
      ALTER TABLE allocation_approvals ADD CONSTRAINT allocation_approvals_member_id_fkey
        FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE
    `);
    await client.query(`
      ALTER TABLE allocation_approvals ADD CONSTRAINT allocation_approvals_member_id_distribution_batch_id_key
        UNIQUE (member_id, distribution_batch_id)
    `);

    await client.query('COMMIT');
    console.log('[Migration] FKs re-pointed to members.member_id');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Migration] FK re-pointing failed:', error.message);
    throw error;
  } finally {
    client.release();
  }
};
