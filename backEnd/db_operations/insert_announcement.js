import { db as pool } from "../src/Configs/dbConfig.js";

async function insertAnnouncement(){
  try{
    const res = await pool.query(
      `INSERT INTO hub_announcements (module_id, title, content, announcement_date)
       VALUES ($1, $2, $3, NOW()) RETURNING id, module_id, title, content`,
      ["choir", "Scripted Choir Announcement","This announcement was added by an automated script for testing."]
    );
    console.log('Inserted announcement:', res.rows[0]);
    process.exit(0);
  }catch(err){
    console.error('Error inserting announcement:', err);
    process.exit(1);
  }
}

insertAnnouncement();
