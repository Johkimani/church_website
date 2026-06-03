import { testDb as pool } from '../src/Configs/dbConfig.js';

async function checkConstraint() {
    try {
        const res = await pool.query(`
            SELECT conname, pg_get_constraintdef(oid) 
            FROM pg_constraint 
            WHERE conname = 'year_of_study_check'
        `);
        console.log("Constraint Definition:");
        console.log(JSON.stringify(res.rows, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkConstraint();
