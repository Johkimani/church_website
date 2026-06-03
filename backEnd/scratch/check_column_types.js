import { testDb as pool } from '../src/Configs/dbConfig.js';

async function checkDetails() {
    try {
        console.log("--- TABLE SCHEMAS ---");
        
        const registeredCols = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'registered'
        `);
        console.log("Registered Table Columns:", JSON.stringify(registeredCols.rows, null, 2));

        const membersCols = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'members'
        `);
        console.log("Members Table Columns:", JSON.stringify(membersCols.rows, null, 2));

        console.log("--- END ---");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkDetails();
