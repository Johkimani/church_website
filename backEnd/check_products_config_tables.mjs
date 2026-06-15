import dotenv from 'dotenv';
dotenv.config();
import pkg from 'pg';
const { Pool } = pkg;
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_HOST === 'localhost' || process.env.DB_HOST === '127.0.0.1' ? false : { rejectUnauthorized: false },
});
(async () => {
  try {
    const res = await pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('products','config') ORDER BY table_name`);
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
})();
