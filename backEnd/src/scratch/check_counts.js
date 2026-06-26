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
        
        console.log("--- Total Counts ---");
        const membersCount = await client.query("SELECT COUNT(*) FROM members");
        const registeredCount = await client.query("SELECT COUNT(*) FROM registered");
        const subGroupsCount = await client.query("SELECT COUNT(*) FROM sub_groups");
        console.log("Members count:", membersCount.rows[0].count);
        console.log("Registered count:", registeredCount.rows[0].count);
        console.log("Sub Groups count:", subGroupsCount.rows[0].count);

        console.log("\n--- Sub Groups details ---");
        const sg = await client.query("SELECT group_id, name, slug FROM sub_groups");
        console.table(sg.rows);

        console.log("\n--- Registered count by Jumuiya UUID ---");
        const regCount = await client.query(`
            SELECT r.jumuiya_id, sg.name, sg.slug, COUNT(r.member_id) 
            FROM registered r 
            LEFT JOIN sub_groups sg ON r.jumuiya_id = sg.group_id 
            GROUP BY r.jumuiya_id, sg.name, sg.slug
        `);
        console.table(regCount.rows);

        console.log("\n--- Members count by Jumuiya UUID ---");
        const memCount = await client.query(`
            SELECT m.jumuiya_id, sg.name, sg.slug, COUNT(m.member_id) 
            FROM members m 
            LEFT JOIN sub_groups sg ON m.jumuiya_id = sg.group_id 
            GROUP BY m.jumuiya_id, sg.name, sg.slug
        `);
        console.table(memCount.rows);

    } catch (err) {
        console.error("Query failed:", err.message);
    } finally {
        await client.end();
    }
}

run();
