
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }
});

async function getJumuiyas() {
  try {
    const result = await pool.query(
      `SELECT group_id, name, full_name FROM sub_groups ORDER BY name ASC`
    );

    console.log(`\nFound ${result.rows.length} Jumuiya(s):\n`);
    console.table(result.rows);

    process.exit(0);
  } catch (err) {
    console.error('Query failed:', err.message);
    process.exit(1);
  }
}

getJumuiyas();
