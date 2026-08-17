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

async function run() {
    try {
        await client.connect();
        console.log('Adding jumuiya_id to weekly_activities and semester_activities...\n');

        await client.query(`
            ALTER TABLE weekly_activities
            ADD COLUMN IF NOT EXISTS jumuiya_id UUID REFERENCES sub_groups(group_id) ON DELETE CASCADE
        `);
        console.log('  ✓ weekly_activities.jumuiya_id added');

        await client.query(`
            ALTER TABLE semester_activities
            ADD COLUMN IF NOT EXISTS jumuiya_id UUID REFERENCES sub_groups(group_id) ON DELETE CASCADE
        `);
        console.log('  ✓ semester_activities.jumuiya_id added');

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_weekly_activities_jumuiya ON weekly_activities(jumuiya_id)
        `);
        console.log('  ✓ index on weekly_activities.jumuiya_id');

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_semester_activities_jumuiya ON semester_activities(jumuiya_id)
        `);
        console.log('  ✓ index on semester_activities.jumuiya_id');

        console.log('\nDone.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

run();
