import { testDb as pool } from '../src/Configs/dbConfig.js';

async function checkSubGroups() {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'sub_groups'
            ORDER BY column_name
        `);
        console.log("Sub_groups Table Columns:", JSON.stringify(res.rows, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkSubGroups();
