import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcrypt';
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
    const res = await pool.query(`SELECT member_id, password, length(password) as len FROM members WHERE member_id = $1`, ['PAUL_ONSONGO']);
    console.log(JSON.stringify(res.rows, null, 2));
    if (res.rows.length > 0) {
      const row = res.rows[0];
      const raw = row.password;
      const trimmed = typeof raw === 'string' ? raw.trim() : raw;
      console.log('raw len', raw.length, 'trimmed len', trimmed.length);
      console.log('raw chars:', raw.split('').map((c,i) => i < 5 || i > raw.length - 5 ? c.charCodeAt(0) : '').filter(Boolean));
      console.log('trimmed hash:', trimmed);
      const pass = 'Admin@123';
      console.log('compare raw:', await bcrypt.compare(pass, raw));
      console.log('compare trimmed:', await bcrypt.compare(pass, trimmed));
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
