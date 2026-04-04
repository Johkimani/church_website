import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();
        console.log("Connected to database.");

        // 1. Create the 'registered' table if it doesn't exist
        console.log("Creating 'registered' table if it doesn't exist...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS registered (
                id SERIAL PRIMARY KEY,
                member_id TEXT NOT NULL,
                jumuiya_id TEXT NOT NULL,
                registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'active',
                UNIQUE(member_id, jumuiya_id)
            )
        `);
        console.log("'registered' table is ready.");

        // 2. Migrate existing data from 'members' table
        console.log("Migrating existing registrations from 'members' table...");
        const existingRegs = await client.query("SELECT member_id, jumuiya_id FROM members WHERE jumuiya_id IS NOT NULL");
        
        let migratedCount = 0;
        for (const row of existingRegs.rows) {
            try {
                await client.query(
                    "INSERT INTO registered (member_id, jumuiya_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
                    [row.member_id, row.jumuiya_id]
                );
                migratedCount++;
            } catch (err) {
                console.error(`Failed to migrate member ${row.member_id}: ${err.message}`);
            }
        }
        console.log(`Migration complete. Migrated ${migratedCount} registrations.`);

    } catch (err) {
        console.error("Initialization failed:", err.message);
    } finally {
        await client.end();
        console.log("Disconnected from database.");
    }
}

run();
