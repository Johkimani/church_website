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
        const res = await client.query("SELECT id, name, slug FROM sub_groups");
        console.log("Sub Groups Check:", res.rows);
        
        // Fix missing slugs if any
        for (const row of res.rows) {
            if (!row.slug) {
                const newSlug = row.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
                console.log(`Fixing slug for ${row.name} -> ${newSlug}`);
                await client.query("UPDATE sub_groups SET slug = $1 WHERE id = $2", [newSlug, row.id]);
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();
