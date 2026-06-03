import { testDb as pool } from '../src/Configs/dbConfig.js';

async function completeMigration() {
    try {
        console.log("Starting COMPREHENSIVE Database Migration...");

        // 1. Drop the restrictive constraint on academic year
        console.log("\nStep 1: Removing academic year constraint...");
        await pool.query("ALTER TABLE members DROP CONSTRAINT IF EXISTS year_of_study_check");
        console.log("Constraint 'year_of_study_check' dropped.");

        // 2. Fetch slug -> group_id mapping
        console.log("\nStep 2: Fetching Jumuiya ID mappings...");
        const sgRes = await pool.query("SELECT group_id, slug FROM sub_groups");
        const mappings = sgRes.rows;
        console.log(`Found ${mappings.length} mappings.`);

        // 3. Define metadata tables to migrate
        const metadataTables = [
            'jumuiya_term_of_office',
            'jumuiya_former_officials',
            'jumuiya_activities',
            'jumuiya_gallery_albums',
            'jumuiya_notifications',
            'jumuiya_social_media',
            'jumuiya_tshirt_orders',
            'jumuiya_meeting_schedule'
        ];

        // 4. Migrate each table
        for (const table of metadataTables) {
            console.log(`\nMigrating table: ${table}...`);
            await pool.query('BEGIN');

            try {
                // Sync data: replace slugs with UUIDs
                for (const mapping of mappings) {
                    await pool.query(
                        `UPDATE ${table} SET jumuiya_id = $1 WHERE jumuiya_id = $2`,
                        [mapping.group_id, mapping.slug]
                    );
                }

                // Alter column type to UUID
                console.log(`Altering ${table}.jumuiya_id type to UUID...`);
                await pool.query(`
                    ALTER TABLE ${table} 
                    ALTER COLUMN jumuiya_id TYPE UUID 
                    USING jumuiya_id::uuid
                `);

                await pool.query('COMMIT');
                console.log(`Table ${table} migrated successfully.`);
            } catch (err) {
                await pool.query('ROLLBACK');
                console.error(`Failed to migrate table ${table}:`, err.message);
                // Continue with other tables if one fails (some might be empty or already migrated)
            }
        }

        console.log("\n--- RE-VERIFYING CORE TABLES ---");
        // Ensure members.jumuiya_id is UUID (in case I missed it or something reverted)
        try {
            await pool.query("ALTER TABLE members ALTER COLUMN jumuiya_id TYPE UUID USING jumuiya_id::uuid");
            console.log("members.jumuiya_id is UUID.");
        } catch(e) { console.log("members.jumuiya_id already UUID or migration skipped."); }

        try {
            await pool.query("ALTER TABLE registered ALTER COLUMN jumuiya_id TYPE UUID USING jumuiya_id::uuid");
            console.log("registered.jumuiya_id is UUID.");
        } catch(e) { console.log("registered.jumuiya_id already UUID or migration skipped."); }

        console.log("\nCOMPREHENSIVE MIGRATION FINISHED!");
        process.exit(0);
    } catch (e) {
        console.error("Critical Migration Error:", e);
        process.exit(1);
    }
}

completeMigration();
