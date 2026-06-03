import { testDb as pool } from '../src/Configs/dbConfig.js';

async function findAllJumuiyaIds() {
    try {
        const res = await pool.query(`
            SELECT table_name, column_name, data_type 
            FROM information_schema.columns 
            WHERE column_name = 'jumuiya_id'
        `);
        console.log("All tables with jumuiya_id column:");
        console.log(JSON.stringify(res.rows, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

findAllJumuiyaIds();
