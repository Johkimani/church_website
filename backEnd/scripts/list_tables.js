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
        const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
        console.log("Tables:", res.rows.map(r => r.table_name));
        
        for (const table of res.rows) {
            const cols = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${table.table_name}'`);
            console.log(`-- ${table.table_name} Columns:`, cols.rows.map(c => `${c.column_name} (${c.data_type})`));
        }
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();
