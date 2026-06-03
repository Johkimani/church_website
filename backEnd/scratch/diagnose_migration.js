import { testDb as pool } from '../src/Configs/dbConfig.js';

async function diagnose() {
    try {
        console.log("--- SUB_GROUPS MAPPINGS ---");
        const sgRes = await pool.query("SELECT group_id, slug, name FROM sub_groups");
        console.log(JSON.stringify(sgRes.rows, null, 2));

        const metadataTables = [
            'jumuiya_meeting_schedule',
            'jumuiya_term_of_office',
            'jumuiya_former_officials',
            'jumuiya_activities',
            'jumuiya_gallery_albums',
            'jumuiya_notifications',
            'jumuiya_social_media',
            'jumuiya_tshirt_orders'
        ];

        console.log("\n--- TABLE JUMUIYA_ID VALUES ---");
        for (const table of metadataTables) {
            const res = await pool.query(`SELECT DISTINCT jumuiya_id FROM ${table}`);
            console.log(`Table ${table} values:`, res.rows.map(r => r.jumuiya_id));
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

diagnose();
