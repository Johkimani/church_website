import { testDb as pool } from '../src/Configs/dbConfig.js';

async function finalRobustMigration() {
    try {
        console.log("Starting ROBUST COMPREHENSIVE Database Migration...");

        // 1. Drop academic year constraint
        await pool.query("ALTER TABLE members DROP CONSTRAINT IF EXISTS year_of_study_check");

        // 2. Fetch mappings
        const sgRes = await pool.query("SELECT group_id, slug FROM sub_groups");
        const mappings = sgRes.rows;

        // 3. Define tables and their specific constraints to drop/recreate
        // table_name -> { column: 'jumuiya_id', constraint: 'name', target_table: 'sub_groups', target_col: 'group_id' }
        const fkTables = [
            { name: 'jumuiya_meeting_schedule', constraint: 'jumuiya_meeting_schedule_jumuiya_id_fkey' },
            { name: 'jumuiya_term_of_office', constraint: 'jumuiya_term_of_office_jumuiya_id_fkey' },
            { name: 'jumuiya_former_officials', constraint: 'jumuiya_former_officials_jumuiya_id_fkey' }
        ];

        const otherTables = [
            'members',
            'registered',
            'jumuiya_activities',
            'jumuiya_gallery_albums',
            'jumuiya_notifications',
            'jumuiya_social_media',
            'jumuiya_tshirt_orders'
        ];

        await pool.query('BEGIN');

        // A. DROP CONSTRAINTS
        for (const table of fkTables) {
            console.log(`Dropping constraint ${table.constraint} on ${table.name}...`);
            await pool.query(`ALTER TABLE ${table.name} DROP CONSTRAINT IF EXISTS ${table.constraint}`);
        }

        // B. MIGRATE DATA AND TYPES FOR ALL TABLES
        const allTargetTables = [...fkTables.map(t => t.name), ...otherTables];
        
        for (const table of allTargetTables) {
            console.log(`Migrating table: ${table}...`);
            
            // Sync data
            for (const mapping of mappings) {
                await pool.query(
                    `UPDATE ${table} SET jumuiya_id = $1 WHERE jumuiya_id = $2`,
                    [mapping.group_id, mapping.slug]
                );
            }

            // Alter type (skip if already UUID)
            try {
                await pool.query(`
                    ALTER TABLE ${table} 
                    ALTER COLUMN jumuiya_id TYPE UUID 
                    USING jumuiya_id::uuid
                `);
            } catch (err) {
                console.log(`Note: ${table}.jumuiya_id might already be UUID or was skipped.`);
            }
        }

        // C. RECREATE CONSTRAINTS (POINTING TO group_id AS UUID)
        for (const table of fkTables) {
            console.log(`Recreating constraint ${table.constraint} on ${table.name} -> sub_groups(group_id)...`);
            await pool.query(`
                ALTER TABLE ${table.name} 
                ADD CONSTRAINT ${table.constraint} 
                FOREIGN KEY (jumuiya_id) REFERENCES sub_groups(group_id)
            `);
        }

        await pool.query('COMMIT');
        console.log("\nROBUST MIGRATION FINISHED SUCCESSFULLY!");
        process.exit(0);

    } catch (e) {
        await pool.query('ROLLBACK');
        console.error("Critical Robust Migration Error:", e);
        process.exit(1);
    }
}

finalRobustMigration();
