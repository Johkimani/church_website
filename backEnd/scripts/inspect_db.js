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
        
        console.log("--- Tables ---");
        const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log(tables.rows.map(r => r.table_name));

        for (const table of tables.rows.map(r => r.table_name)) {
            console.log(`\n--- Schema for ${table} ---`);
            const schema = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${table}'`);
            console.log(schema.rows);
            
            console.log(`\n--- Rows count for ${table} ---`);
            const count = await client.query(`SELECT count(*) FROM ${table}`);
            console.log(count.rows[0].count);
        }

    } catch (err) {
        console.error("Inspection failed:", err);
    } finally {
        await client.end();
    }
}

run();
