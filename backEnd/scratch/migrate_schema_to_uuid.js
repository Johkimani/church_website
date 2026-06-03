import { testDb as pool } from '../src/Configs/dbConfig.js';

async function migrateSchema() {
    try {
        console.log("Starting Database Schema Migration (VARCHAR -> UUID)...");

        // 1. Sync data in 'registered' table just to be safe (ensure no slugs remain)
        console.log("Step 1: Syncing data in 'registered' table...");
        const sgRes = await pool.query("SELECT group_id, slug FROM sub_groups");
        const mappings = sgRes.rows;
        
        await pool.query('BEGIN');
        for (const mapping of mappings) {
            await pool.query(
                "UPDATE registered SET jumuiya_id = $1 WHERE jumuiya_id = $2",
                [mapping.group_id, mapping.slug]
            );
        }
        await pool.query('COMMIT');
        console.log("Data sync complete.");

        // 2. Perform Schema Alterations
        console.log("Step 2: Altering column types...");
        await pool.query('BEGIN');

        // Alter registered table
        console.log("Altering 'registered.jumuiya_id' to UUID...");
        await pool.query(`
            ALTER TABLE registered 
            ALTER COLUMN jumuiya_id TYPE UUID 
            USING jumuiya_id::uuid
        `);

        // Alter members table
        console.log("Altering 'members.jumuiya_id' to UUID...");
        await pool.query(`
            ALTER TABLE members 
            ALTER COLUMN jumuiya_id TYPE UUID 
            USING jumuiya_id::uuid
        `);

        await pool.query('COMMIT');
        console.log("Schema migration complete! Both tables now use the UUID type for jumuiya_id.");

        // 3. Verification
        console.log("\nVerifying 'registered' table type:");
        const regType = await pool.query("SELECT data_type FROM information_schema.columns WHERE table_name = 'registered' AND column_name = 'jumuiya_id'");
        console.log(`registered.jumuiya_id: ${regType.rows[0].data_type}`);

        console.log("Verifying 'members' table type:");
        const memType = await pool.query("SELECT data_type FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'jumuiya_id'");
        console.log(`members.jumuiya_id: ${memType.rows[0].data_type}`);

        process.exit(0);
    } catch (e) {
        await pool.query('ROLLBACK');
        console.error("Migration failed:", e);
        process.exit(1);
    }
}

migrateSchema();
