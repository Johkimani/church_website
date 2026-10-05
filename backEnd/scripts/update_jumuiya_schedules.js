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

const updates = [
    { slug: 'st-anthony',       description: 'Empowered By Grace',              day: 'Every Sunday',    time: '2:00 PM - 4:00 PM', venue: 'LH 24' },
    { slug: 'st-augustine',     description: 'Our Hearts Are Restless',          day: 'Every Thursday',  time: '5:00 PM - 6:50 PM', venue: 'Lower Dias' },
    { slug: 'st-catherine',     description: 'St. Catherine The Great Family',   day: 'Every Wednesday', time: '5:00 PM - 6:50 PM', venue: 'Church Hall' },
    { slug: 'st-dominic',       description: 'God Is Good, I\'m A Witness',      day: 'Every Sunday',    time: '3:00 PM - 5:00 PM', venue: 'LH 20' },
    { slug: 'st-elizabeth',     description: 'Brothers and Sisters',             day: 'Every Wednesday', time: '5:00 PM - 6:50 PM', venue: 'Upper Dias' },
    { slug: 'st-maria-goretti', description: 'With God\'s Grace',                day: 'Every Sunday',    time: '2:00 PM - 4:00 PM', venue: 'LH 19' },
    { slug: 'st-monica',        description: 'Tusimame Imara',                   day: 'Every Sunday',    time: '2:00 PM - 4:00 PM', venue: 'LH 17' },
];

async function run() {
    try {
        await client.connect();
        console.log('Updating sub_groups descriptions and meeting schedules...\n');

        for (const u of updates) {
            const sg = await client.query(
                'SELECT group_id FROM sub_groups WHERE slug = $1',
                [u.slug]
            );
            if (!sg.rows.length) {
                console.error(`  SKIP: no sub_group found for ${u.slug}`);
                continue;
            }
            const gid = sg.rows[0].group_id;

            await client.query(
                'UPDATE sub_groups SET description = $1 WHERE slug = $2',
                [u.description, u.slug]
            );
            console.log(`  ✓ ${u.slug}: description = "${u.description}"`);

            const existing = await client.query(
                'SELECT id FROM jumuiya_meeting_schedule WHERE jumuiya_id = $1',
                [gid]
            );
            if (existing.rows.length) {
                await client.query(
                    'UPDATE jumuiya_meeting_schedule SET day = $1, time = $2, venue = $3 WHERE jumuiya_id = $4',
                    [u.day, u.time, u.venue, gid]
                );
            } else {
                await client.query(
                    'INSERT INTO jumuiya_meeting_schedule (jumuiya_id, day, time, venue) VALUES ($1, $2, $3, $4)',
                    [gid, u.day, u.time, u.venue]
                );
            }
            console.log(`  ✓ ${u.slug}: ${u.day} ${u.time} @ ${u.venue}\n`);
        }

        console.log('Done. All 7 jumuiyas updated.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

run();
