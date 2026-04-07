import { Pool } from "pg";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_HOST === "localhost" ? false : { rejectUnauthorized: false },
});

async function checkTables() {
  try {
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    const tables = res.rows.map(r => r.table_name);
    
    let output = "Tables in database: " + tables.join(", ") + "\n\n";

    for (const table of tables) {
        const colRes = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = '${table}'`);
        output += `Columns in '${table}' table: ` + colRes.rows.map(r => r.column_name).join(", ") + "\n";
    }

    fs.writeFileSync("db_structure.txt", output);
    console.log("Database structure written to db_structure.txt");

    await pool.end();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkTables();
