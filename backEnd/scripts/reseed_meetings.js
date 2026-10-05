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
    { slug: 'st-anthony', day: 'Every Sunday', time: '2:00 PM - 4:00 PM', venue: 'LH 24' },
    { slug: 'st-augustine', day: 'Every Thursday', time: '5:00 PM - 6:50 PM', venue: 'Lower Dias' },
    { slug: 'st-catherine', day: 'Every Wednesday', time: '5:00 PM - 6:50 PM', venue: 'Church Hall' },
    { slug: 'st-dominic', day: 'Every Sunday', time: '3:00 PM - 5:00 PM', venue: 'LH 20' },
    { slug: 'st-elizabeth', day: 'Every Wednesday', time: '5:00 PM - 6:50 PM', venue: 'Upper Dias' },
    { slug: 'st-maria-goretti', day: 'Every Sunday', time: '2:00 PM - 4:00 PM', venue: 'LH 19' },
    { slug: 'st-monica', day: 'Every Sunday', time: '2:00 PM - 4:00 PM', venue: 'LH 17' }
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
