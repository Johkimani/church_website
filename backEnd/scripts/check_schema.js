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
        
        console.log("\n--- Members Columns ---");
        const res = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'members'");
        console.log(JSON.stringify(res.rows, null, 2));

        console.log("\n--- Members Sample (1 row) ---");
        const res2 = await client.query("SELECT * FROM members LIMIT 1");
        console.log(JSON.stringify(res2.rows, null, 2));

        console.log("\n--- Sub Groups Sample (1 row) ---");
        const res3 = await client.query("SELECT * FROM sub_groups LIMIT 1");
        console.log(JSON.stringify(res3.rows, null, 2));

    } catch (err) {
        console.error("Query failed:", err.message);
    } finally {
        await client.end();
    }
}

run();
