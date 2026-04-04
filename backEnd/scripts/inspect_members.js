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
        
        console.log("\n--- Table structures ---");
        const tables = ['members', 'jumuiya_members', 'sub_groups'];
        for (const table of tables) {
            const res = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${table}'`);
            if (res.rows.length > 0) {
                console.log(`\nTable: ${table}`);
                console.table(res.rows);
            } else {
                console.log(`\nTable: ${table} does not exist.`);
            }
        }

        console.log("\n--- Members Sample ---");
        const members = await client.query("SELECT * FROM members LIMIT 5");
        console.table(members.rows);

        console.log("\n--- Jumuiya Members Sample ---");
        const jm = await client.query("SELECT * FROM jumuiya_members LIMIT 5");
        console.table(jm.rows);

        console.log("\n--- Sub Groups (Jumuiyas) ---");
        const sg = await client.query("SELECT slug, name FROM sub_groups");
        console.table(sg.rows);

    } catch (err) {
        console.error("Inspection failed:", err.message);
    } finally {
        await client.end();
    }
}

run();
