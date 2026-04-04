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
        
        console.log("Dropping redundant jumuiya_members table...");
        await client.query("DROP TABLE IF EXISTS jumuiya_members CASCADE");

        console.log("Adding jumuiya_id column to members table...");
        // Use a slug to match sub_groups(slug)
        await client.query("ALTER TABLE members ADD COLUMN IF NOT EXISTS jumuiya_id character varying");
        
        console.log("Migration complete!");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await client.end();
    }
}

run();
