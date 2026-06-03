import { testDb as pool } from '../src/Configs/dbConfig.js';

async function checkMoreTables() {
    try {
        console.log("Checking data in other Jumuiya tables:");
        
        const tables = [
            'jumuiya_notifications',
            'jumuiya_activities',
            'jumuiya_gallery_albums',
            'jumuiya_tshirt_orders'
        ];

        for (const table of tables) {
            const res = await pool.query(`SELECT jumuiya_id FROM ${table} LIMIT 1`);
            console.log(`Table ${table} first jumuiya_id:`, res.rowCount > 0 ? res.rows[0].jumuiya_id : 'Empty');
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkMoreTables();
