import { testDb as pool } from '../src/Configs/dbConfig.js';

async function finalRobustMigrationV2() {
    try {
        console.log("Starting ROBUST COMPREHENSIVE Database Migration V2...");

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
            
            // 1. First, normalize (trim and lower)
            await pool.query(`UPDATE ${table} SET jumuiya_id = LOWER(TRIM(jumuiya_id)) WHERE jumuiya_id IS NOT NULL`);

            // 2. Sync data based on mappings
            for (const mapping of mappings) {
                const result = await pool.query(
                    `UPDATE ${table} SET jumuiya_id = $1 WHERE jumuiya_id = $2 OR jumuiya_id = $3`,
                    [mapping.group_id, mapping.slug, mapping.slug.toLowerCase()]
                );
                if (result.rowCount > 0) {
                    console.log(`  Updated ${result.rowCount} rows for ${mapping.slug}`);
                }
            }

            // 3. Handle stray values/empty strings that aren't UUIDs
            console.log(`  Cleaning up non-UUID stray values in ${table}...`);
            const cleanupResult = await pool.query(`
                UPDATE ${table} 
                SET jumuiya_id = NULL 
                WHERE jumuiya_id IS NOT NULL 
                AND jumuiya_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
            `);
            if (cleanupResult.rowCount > 0) {
                console.log(`  Set ${cleanupResult.rowCount} stray rows to NULL.`);
            }

            // 4. Alter type
            console.log(`  Altering ${table}.jumuiya_id type to UUID...`);
            await pool.query(`
                ALTER TABLE ${table} 
                ALTER COLUMN jumuiya_id TYPE UUID 
                USING jumuiya_id::uuid
            `);
        }

        // C. RECREATE CONSTRAINTS
        for (const table of fkTables) {
            console.log(`Recreating constraint ${table.constraint} on ${table.name} -> sub_groups(group_id)...`);
            await pool.query(`
                ALTER TABLE ${table.name} 
                ADD CONSTRAINT ${table.constraint} 
                FOREIGN KEY (jumuiya_id) REFERENCES sub_groups(group_id)
            `);
        }

        await pool.query('COMMIT');
        console.log("\nROBUST MIGRATION V2 FINISHED SUCCESSFULLY!");
        process.exit(0);

    } catch (e) {
        await pool.query('ROLLBACK');
        console.error("Critical Robust Migration V2 Error:", e);
        process.exit(1);
    }
}

finalRobustMigrationV2();
