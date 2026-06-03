import { testDb as testDb } from '../src/Configs/dbConfig.js';

async function checkSchema() {
    try {
        console.log("--- START CHECK ---");
        
        console.log("\n1. Checking 'members' table sample:");
        const membersRes = await testDb.query("SELECT member_id, jumuiya_id FROM members LIMIT 5");
        console.log(JSON.stringify(membersRes.rows, null, 2));

        console.log("\n2. Checking 'registered' table sample:");
        const registeredRes = await testDb.query("SELECT * FROM registered LIMIT 5");
        console.log(JSON.stringify(registeredRes.rows, null, 2));

        console.log("\n3. Checking 'sub_groups' table sample:");
        const sgRes = await testDb.query("SELECT group_id, name, slug FROM sub_groups LIMIT 5");
        console.log(JSON.stringify(sgRes.rows, null, 2));

        console.log("\n--- END CHECK ---");
        process.exit(0);
    } catch (e) {
        console.error("ERROR DURING CHECK:", e);
        process.exit(1);
    }
}

checkSchema();
