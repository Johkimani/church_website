import { testDb as pool } from "../src/Configs/dbConfig.js";
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  try {
    const query = `
        SELECT id, name, photo, status FROM officials
        UNION ALL
        SELECT id, name, photo, status FROM jumuiya_officials`;
    
    console.log("Running query...");
    const result = await pool.query(query);
    const msg = `Success! Rows: ${result.rows.length}\nData: ${JSON.stringify(result.rows, null, 2)}`;
    console.log(msg);
    fs.writeFileSync('./query_output.txt', msg);
  } catch (error) {
    const errMsg = `DATABASE ERROR: ${error.message}\nFULL ERROR: ${JSON.stringify(error, null, 2)}`;
    console.error(errMsg);
    fs.writeFileSync('./query_output.txt', errMsg);
  } finally {
    process.exit();
  }
}

test();
