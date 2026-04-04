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
        
        console.log("--- Members Table Columns ---");
        const res = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'members'");
        console.log(res.rows);

        console.log("\n--- Sub Groups Samples ---");
        const res2 = await client.query("SELECT slug, name FROM sub_groups");
        console.log(res2.rows);

    } catch (err) {
        console.error("Query failed:", err.message);
    } finally {
        await client.end();
    }
}

run();
