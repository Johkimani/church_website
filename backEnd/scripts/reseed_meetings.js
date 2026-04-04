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

const schedules = [
    { slug: 'st-anthony', day: 'Every Saturday', time: '4:30 PM - 5:30 PM', venue: 'Catholic Centre / Local Homes' },
    { slug: 'st-augustine', day: 'Every Wednesday', time: '5:00 PM - 6:00 PM', venue: 'Chapel Side B' },
    { slug: 'st-catherine', day: 'Alternate Sundays', time: '11:00 AM - 12:00 PM', venue: 'St. Catherine Hall' },
    { slug: 'st-dominic', day: 'Every Friday', time: '7:00 PM - 8:00 PM', venue: 'Virtual / Library' },
    { slug: 'st-elizabeth', day: 'Every Tuesday', time: '5:30 PM - 6:30 PM', venue: 'Member Residencies' },
    { slug: 'st-maria-goretti', day: 'Every Monday', time: '4:00 PM - 5:00 PM', venue: 'Parish Hall' },
    { slug: 'st-monica', day: 'Every Thursday', time: '6:00 PM - 7:00 PM', venue: 'Monica Gardens' }
];

async function run() {
    try {
        await client.connect();
        console.log("Seeding jumuiya_meeting_schedule...");
        
        // Clean old schedules
        await client.query("DELETE FROM jumuiya_meeting_schedule");
        
        for (const s of schedules) {
            await client.query(
                `INSERT INTO jumuiya_meeting_schedule (jumuiya_id, day, time, venue) 
                 VALUES ($1, $2, $3, $4)`,
                [s.slug, s.day, s.time, s.venue]
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
