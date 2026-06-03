import { testDb as pool } from '../src/Configs/dbConfig.js';

async function migrate() {
    try {
        console.log("Starting migration of 'registered' table...");
        
        // 1. Fetch slug -> group_id mapping
        const sgRes = await pool.query("SELECT group_id, slug FROM sub_groups");
        const mappings = sgRes.rows;
        console.log(`Found ${mappings.length} jumuiya mappings.`);

        // 2. Start Transaction
        await pool.query('BEGIN');

        let totalUpdated = 0;
        for (const mapping of mappings) {
            const result = await pool.query(
                "UPDATE registered SET jumuiya_id = $1 WHERE jumuiya_id = $2",
                [mapping.group_id, mapping.slug]
            );
            console.log(`Updated ${result.rowCount} rows for slug: ${mapping.slug}`);
            totalUpdated += result.rowCount;
        }

        await pool.query('COMMIT');
        console.log(`\nMigration complete. Total rows updated in 'registered': ${totalUpdated}`);
        
        // 3. Verification
        const checkRes = await pool.query("SELECT * FROM registered LIMIT 5");
        console.log("\nVerification (First 5 rows of 'registered'):");
        console.log(JSON.stringify(checkRes.rows, null, 2));

        process.exit(0);
    } catch (e) {
        await pool.query('ROLLBACK');
        console.error("Migration failed:", e);
        process.exit(1);
    }
}

migrate();
