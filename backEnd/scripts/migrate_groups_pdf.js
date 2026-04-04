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
        console.log("Adding history_pdf column to sub_groups table...");
        await client.query("ALTER TABLE sub_groups ADD COLUMN IF NOT EXISTS history_pdf character varying");
        console.log("Migration complete!");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await client.end();
    }
}

run();
