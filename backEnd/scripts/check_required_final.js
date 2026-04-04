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
        
        const res = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'members' AND is_nullable = 'NO' AND column_default IS NULL
        `);
        console.log("Required Columns:", res.rows.map(r => r.column_name));

    } catch (err) {
        console.error("Query failed:", err.message);
    } finally {
        await client.end();
    }
}

run();
