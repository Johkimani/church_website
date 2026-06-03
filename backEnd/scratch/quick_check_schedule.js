import { testDb as pool } from '../src/Configs/dbConfig.js';

async function quickCheck() {
    try {
        const res = await pool.query("SELECT DISTINCT jumuiya_id FROM jumuiya_meeting_schedule");
        console.log("Values in meeting_schedule:", res.rows.map(r => r.jumuiya_id));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

quickCheck();
