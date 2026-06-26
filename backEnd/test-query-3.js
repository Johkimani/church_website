import { db as pool } from './src/Configs/dbConfig.js';

async function run() {
  try {
    const csa = await pool.query("SELECT id, name, photo FROM officials ORDER BY id DESC LIMIT 5");
    console.log("CSA Officials:", csa.rows);

    const jumuiya = await pool.query("SELECT id, name, photo FROM jumuiya_officials ORDER BY id DESC LIMIT 5");
    console.log("Jumuiya Officials:", jumuiya.rows);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
