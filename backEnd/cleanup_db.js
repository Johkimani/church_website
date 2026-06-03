import { testDb as pool } from './src/Configs/dbConfig.js';

async function cleanup() {
    try {
        console.log('Starting database cleanup...');
        
        // 1. Delete orphaned registrations
        const orphanedResult = await pool.query(`
            DELETE FROM registered 
            WHERE member_id NOT IN (SELECT member_id FROM members)
        `);
        console.log(`- Deleted ${orphanedResult.rowCount} orphaned registration records.`);
        
        // 2. Delete members with null or empty names
        const emptyMemberResult = await pool.query(`
            DELETE FROM members 
            WHERE first_name IS NULL 
               OR first_name = '' 
               OR last_name IS NULL 
               OR last_name = ''
        `);
        console.log(`- Deleted ${emptyMemberResult.rowCount} members with missing name data.`);
        
        // 3. Optional: Delete members with no ID (shouldn't happen but good to clean)
        const noIdResult = await pool.query(`
            DELETE FROM members 
            WHERE member_id IS NULL OR member_id = ''
        `);
        console.log(`- Deleted ${noIdResult.rowCount} members with missing IDs.`);

        console.log('Cleanup complete.');
        process.exit(0);
    } catch (error) {
        console.error('Cleanup failed:', error);
        process.exit(1);
    }
}

cleanup();
