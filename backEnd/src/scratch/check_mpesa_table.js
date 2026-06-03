
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }
});

async function checkTable() {
  try {
    const res = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'mpesa_request'
      );
    `);
    console.log('EXISTS:', res.rows[0].exists);
    if (!res.rows[0].exists) {
      console.log('Creating table...');
      await pool.query(`
        CREATE TABLE mpesa_request (
          id SERIAL PRIMARY KEY,
          checkout_id TEXT UNIQUE NOT NULL,
          user_id TEXT NOT NULL,
          amount NUMERIC NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('Table created!');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkTable();
