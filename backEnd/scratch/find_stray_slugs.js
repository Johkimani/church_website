import { testDb as pool } from '../src/Configs/dbConfig.js';

async function findStrays() {
    try {
        const metadataTables = [
            'jumuiya_meeting_schedule',
            'jumuiya_term_of_office',
            'jumuiya_former_officials',
            'members',
            'registered',
            'jumuiya_activities',
            'jumuiya_gallery_albums',
            'jumuiya_notifications',
            'jumuiya_social_media',
            'jumuiya_tshirt_orders'
        ];

        console.log("Checking for 'jumuiya_id' values that are not valid UUIDs:");
        for (const table of metadataTables) {
            const res = await pool.query(`
                SELECT DISTINCT jumuiya_id 
                FROM ${table} 
                WHERE jumuiya_id IS NOT NULL 
                AND jumuiya_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
            `);
            if (res.rowCount > 0) {
                console.log(`Table ${table} has stray values:`, res.rows.map(r => r.jumuiya_id));
            }
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

findStrays();
