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

// Days must match jumuiya_meeting_config (authoritative meeting-day mapping).
const schedules = [
    { slug: 'st-anthony', day: 'Every Sunday', time: '4:30 PM - 5:30 PM', venue: 'Catholic Centre / Local Homes' },
    { slug: 'st-augustine', day: 'Every Thursday', time: '5:00 PM - 6:00 PM', venue: 'Chapel Side B' },
    { slug: 'st-catherine', day: 'Every Wednesday', time: '11:00 AM - 12:00 PM', venue: 'St. Catherine Hall' },
    { slug: 'st-dominic', day: 'Every Sunday', time: '7:00 PM - 8:00 PM', venue: 'Virtual / Library' },
    { slug: 'st-elizabeth', day: 'Every Thursday', time: '5:30 PM - 6:30 PM', venue: 'Member Residencies' },
    { slug: 'st-maria-goretti', day: 'Every Sunday', time: '4:00 PM - 5:00 PM', venue: 'Parish Hall' },
    { slug: 'st-monica', day: 'Every Sunday', time: '6:00 PM - 7:00 PM', venue: 'Monica Gardens' }
];

async function run() {
    try {
        await client.connect();
        console.log("Resolving group_ids by slug...");

        const slugIds = await client.query(
            `SELECT group_id, slug FROM sub_groups WHERE slug = ANY($1)`,
            [schedules.map(s => s.slug)]
        );
        const idBySlug = new Map(slugIds.rows.map(r => [r.slug, r.group_id]));

        const missing = schedules.filter(s => !idBySlug.has(s.slug));
        if (missing.length) {
            console.error("Aborting: no sub_group found for slugs:", missing.map(m => m.slug).join(", "));
            await client.end();
            return;
        }

        console.log("Seeding jumuiya_meeting_schedule...");

        // Clean old schedules
        await client.query("DELETE FROM jumuiya_meeting_schedule");

        for (const s of schedules) {
            await client.query(
                `INSERT INTO jumuiya_meeting_schedule (jumuiya_id, day, time, venue) 
                 VALUES ($1, $2, $3, $4)`,
                [idBySlug.get(s.slug), s.day, s.time, s.venue]
            );
        }

        console.log(`Successfully seeded ${schedules.length} meeting schedules.`);
    } catch (err) {
        console.error("Seeding failed:", err);
    } finally {
        await client.end();
    }
}

run();
