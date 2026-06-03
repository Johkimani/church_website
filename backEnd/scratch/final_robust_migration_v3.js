import { testDb as pool } from '../src/Configs/dbConfig.js';

async function finalRobustMigrationV3() {
    try {
        console.log("Starting ROBUST COMPREHENSIVE Database Migration V3...");

        // 1. Drop academic year constraint
        await pool.query("ALTER TABLE members DROP CONSTRAINT IF EXISTS year_of_study_check");

        // 2. Fetch mappings
        const sgRes = await pool.query("SELECT group_id, slug FROM sub_groups");
        const mappings = sgRes.rows;

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
            console.log(`\nMigrating table: ${table}...`);
            
            // Check current type
            const typeRes = await pool.query(`
                SELECT data_type 
                FROM information_schema.columns 
                WHERE table_name = $1 AND column_name = 'jumuiya_id'
            `, [table]);
            
            const isVarchar = typeRes.rows[0].data_type === 'character varying';

            if (isVarchar) {
                // 1. Normalize
                await pool.query(`UPDATE ${table} SET jumuiya_id = LOWER(TRIM(jumuiya_id)) WHERE jumuiya_id IS NOT NULL`);

                // 2. Sync data based on mappings
                for (const mapping of mappings) {
                    await pool.query(
                        `UPDATE ${table} SET jumuiya_id = $1 WHERE jumuiya_id = $2 OR jumuiya_id = $3`,
                        [mapping.group_id, mapping.slug, mapping.slug.toLowerCase()]
                    );
                }

                // 3. Handle stray values/empty strings that aren't UUIDs
                console.log(`  Cleaning up non-UUID stray values in ${table}...`);
                await pool.query(`
                    UPDATE ${table} 
                    SET jumuiya_id = NULL 
                    WHERE jumuiya_id IS NOT NULL 
                    AND jumuiya_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
                `);

                // 4. Alter type
                console.log(`  Altering ${table}.jumuiya_id type to UUID...`);
                await pool.query(`
                    ALTER TABLE ${table} 
                    ALTER COLUMN jumuiya_id TYPE UUID 
                    USING jumuiya_id::uuid
                `);
            } else {
                console.log(`  Table ${table}.jumuiya_id is already ${typeRes.rows[0].data_type}. Skipping sync/alter.`);
            }
        }

        // C. RECREATE CONSTRAINTS
        for (const table of fkTables) {
            console.log(`Recreating constraint ${table.constraint} on ${table.name} -> sub_groups(group_id)...`);
            try {
                await pool.query(`
                    ALTER TABLE ${table.name} 
                    ADD CONSTRAINT ${table.constraint} 
                    FOREIGN KEY (jumuiya_id) REFERENCES sub_groups(group_id)
                `);
            } catch (err) {
                console.log(`  Warning: Could not recreate FK for ${table.name}. Check if target columns match. Error: ${err.message}`);
            }
        }

        await pool.query('COMMIT');
        console.log("\nROBUST MIGRATION V3 FINISHED SUCCESSFULLY!");
        process.exit(0);

    } catch (e) {
        await pool.query('ROLLBACK');
        console.error("Critical Robust Migration V3 Error:", e);
        process.exit(1);
    }
}

finalRobustMigrationV3();
