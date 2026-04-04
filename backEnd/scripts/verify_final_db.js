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
        
        console.log("--- Verifying St. Anthony ---");
        const res1 = await client.query(`
            SELECT m.first_name, m.last_name 
            FROM registered r 
            JOIN members m ON r.member_id = m.member_id 
            WHERE r.jumuiya_id = 'st-anthony'
        `);
        console.log("Count:", res1.rows.length);
        console.log("Names:", res1.rows.map(r => `${r.first_name} ${r.last_name}`));

        console.log("\n--- Verifying St. Augustine ---");
        const res2 = await client.query(`
            SELECT m.first_name, m.last_name 
            FROM registered r 
            JOIN members m ON r.member_id = m.member_id 
            WHERE r.jumuiya_id = 'st-augustine'
        `);
        console.log("Count:", res2.rows.length);
        console.log("Names:", res2.rows.map(r => `${r.first_name} ${r.last_name}`));

    } catch (err) {
        console.error("Verification failed:", err.message);
    } finally {
        await client.end();
    }
}

run();
