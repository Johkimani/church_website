import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { Pool } = pg;
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const query = `
      UPDATE hub_modules 
      SET 
        title = 'Mentorship Program',
        description = 'Empowering individuals to grow in faith, career guidance, and life skills through structured mentorship.',
        story = 'The Mentorship Program connects young Christians with experienced mentors to guide them in spiritual growth, professional development, and personal maturity.',
        schedule_label = 'Mentorship Sessions',
        training_time = 'Every Sunday, 3:00 PM – 5:00 PM',
        location = 'Parish Hall'
      WHERE id = 'youth'
    `;
    const res = await pool.query(query);
    console.log("✅ Mentorship Program updated in DB successfully! Rows affected:", res.rowCount);
    
    // Also let's double check if it exists or insert if missing
    if (res.rowCount === 0) {
      await pool.query(`
        INSERT INTO hub_modules (id, title, description, story, schedule_label, training_time, location)
        VALUES (
          'youth',
          'Mentorship Program',
          'Empowering individuals to grow in faith, career guidance, and life skills through structured mentorship.',
          'The Mentorship Program connects young Christians with experienced mentors to guide them in spiritual growth, professional development, and personal maturity.',
          'Mentorship Sessions',
          'Every Sunday, 3:00 PM – 5:00 PM',
          'Parish Hall'
        )
      `);
      console.log("✅ Mentorship Program inserted in DB successfully!");
    }
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Error updating database:", err);
    process.exit(1);
  }
}

run();
