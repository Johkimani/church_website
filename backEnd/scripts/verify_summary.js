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
        
        console.log("--- Registration Counts per Jumuiya ---");
        const res = await client.query(`
            SELECT jumuiya_id, count(*) 
            FROM registered 
            GROUP BY jumuiya_id
        `);
        console.table(res.rows);

        console.log("\n--- Unregistered Members Count ---");
        const res2 = await client.query(`
            SELECT count(*) 
            FROM members 
            WHERE jumuiya_id IS NULL
        `);
        console.log("Total Unregistered:", res2.rows[0].count);

    } catch (err) {
        console.error("Verification failed:", err.message);
    } finally {
        await client.end();
    }
}

run();
