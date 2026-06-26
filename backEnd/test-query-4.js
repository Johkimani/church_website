import { db as pool } from './src/Configs/dbConfig.js';

async function run() {
  try {
    const csaWithPhoto = await pool.query("SELECT id, name, photo FROM officials WHERE photo IS NOT NULL ORDER BY id DESC LIMIT 5");
    console.log("CSA Officials WITH photo:", csaWithPhoto.rows);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
