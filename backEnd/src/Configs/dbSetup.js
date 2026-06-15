// src/configs/dbSetup.js
// Run this once to create tables and seed data: node src/configs/dbSetup.js

import { db, connectDb } from "./dbConfig.js";

const setupDatabase = async () => {
  await connectDb();

  // ─── Create Tables ────────────────────────────────────────────────
  await db.query(`
    CREATE TABLE IF NOT EXISTS weekly_activities (
      id SERIAL PRIMARY KEY,
      day VARCHAR(20) NOT NULL,
      time VARCHAR(50) NOT NULL,
      activity VARCHAR(100) NOT NULL,
      venue VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("✅ Table 'weekly_activities' ready");

  await db.query(`
    CREATE TABLE IF NOT EXISTS semester_activities (
      id SERIAL PRIMARY KEY,
      title VARCHAR(150) NOT NULL,
      date_time TIMESTAMP NOT NULL,
      venue VARCHAR(150) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("✅ Table 'semester_activities' ready");

  // ─── Seed Weekly Activities ───────────────────────────────────────
  const weeklyCount = await db.query("SELECT COUNT(*) FROM weekly_activities");
  if (parseInt(weeklyCount.rows[0].count) === 0) {
    const weekly = [
      { day: "Monday",    time: "7:30 PM – 8:00 PM", activity: "Rosary",         venue: "Church" },
      { day: "Tuesday",   time: "6:00 PM – 8:00 PM", activity: "Choir Practice", venue: "Church" },
      { day: "Wednesday", time: "7:00 PM – 8:00 PM", activity: "Bible Study",    venue: "Church" },
      { day: "Thursday",  time: "7:30 PM – 8:00 PM", activity: "Rosary",         venue: "Church" },
      { day: "Friday",    time: "7:00 PM – 9:00 PM", activity: "Mass",           venue: "Church" },
      { day: "Saturday",  time: "1:00 PM – 4:00 PM", activity: "Choir Practice", venue: "School" },
    ];

    for (const w of weekly) {
      await db.query(
        `INSERT INTO weekly_activities (day, time, activity, venue) VALUES ($1, $2, $3, $4)`,
        [w.day, w.time, w.activity, w.venue]
      );
    }
    console.log("✅ Seeded weekly activities");
  } else {
    console.log("ℹ️  Weekly activities already seeded");
  }

  // ─── Seed Semester Activities ─────────────────────────────────────
  const semCount = await db.query("SELECT COUNT(*) FROM semester_activities");
  if (parseInt(semCount.rows[0].count) === 0) {
    const semester = [
      {
        title: "Recollection Day",
        date_time: "2026-01-31T08:00:00",
        venue: "Church Hall",
        description: "A day of prayer, reflection, and spiritual renewal for all CSA members.",
      },
      {
        title: "Charity Work",
        date_time: "2026-02-21T08:00:00",
        venue: "Bethlehem Children's Home",
        description: "Outreach and service project — bringing hope to those in need.",
      },
      {
        title: "Fun Day",
        date_time: "2026-03-11T10:00:00",
        venue: "School Grounds",
        description: "A day of games, fellowship, and community bonding for all students.",
      },
      {
        title: "4th Years' Bash",
        date_time: "2026-04-11T18:00:00",
        venue: "Church",
        description: "A farewell celebration honouring our graduating fourth-year members.",
      },
    ];

    for (const s of semester) {
      await db.query(
        `INSERT INTO semester_activities (title, date_time, venue, description) VALUES ($1, $2, $3, $4)`,
        [s.title, s.date_time, s.venue, s.description]
      );
    }
    console.log("✅ Seeded semester activities");
  } else {
    console.log("ℹ️  Semester activities already seeded");
  }

  console.log("\n🎉 Database setup complete!");
  process.exit(0);
};

setupDatabase().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});