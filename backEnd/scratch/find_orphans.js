import { testDb as pool } from '../src/Configs/dbConfig.js';

async function findOrphans() {
    try {
        const sgRes = await pool.query("SELECT slug FROM sub_groups");
        const slugs = new Set(sgRes.rows.map(r => r.slug));
        console.log("Slugs in sub_groups:", Array.from(slugs));

        const metadataTables = [
            'jumuiya_meeting_schedule',
            'jumuiya_term_of_office',
            'jumuiya_former_officials',
            'jumuiya_activities',
            'jumuiya_gallery_albums',
            'jumuiya_notifications',
            'jumuiya_social_media',
            'jumuiya_tshirt_orders',
            'members',
            'registered'
        ];

        for (const table of metadataTables) {
            const res = await pool.query(`SELECT DISTINCT jumuiya_id FROM ${table} WHERE jumuiya_id IS NOT NULL`);
            const tableValues = res.rows.map(r => r.jumuiya_id);
            const orphans = tableValues.filter(v => {
                // If it's a UUID, it's not an orphan (already migrated or correctly set)
                const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(v);
                if (isUUID) return false;
                // If it's in sub_groups slugs, it's not an orphan
                return !slugs.has(v);
            });

            if (orphans.length > 0) {
                console.log(`Table ${table} has orphans (slugs not in sub_groups):`, orphans);
            }
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

findOrphans();
