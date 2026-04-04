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
        
        console.log("Checking streamlined members table...");
        
        const res = await client.query("SELECT count(*) FROM members WHERE jumuiya_id IS NOT NULL");
        console.log("Registered Members Count:", res.rows[0].count);
        
        const samples = await client.query(`
            SELECT member_id, first_name, last_name, jumuiya_id 
            FROM members 
            WHERE jumuiya_id IS NOT NULL 
            LIMIT 10
        `);
        console.log("Sample Linked Members:", samples.rows);
        
        const subgroups = await client.query("SELECT slug, name FROM sub_groups");
        console.log("Available Jumuiya Slugs:", subgroups.rows.map(s => s.slug));

    } catch (err) {
        console.error("Check failed:", err);
    } finally {
        await client.end();
    }
}

run();
