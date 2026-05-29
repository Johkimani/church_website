import dotenv from "dotenv";
import { db as pool } from "../src/Configs/dbConfig.js";

dotenv.config();

const setupFormsDistribution = async () => {
  try {
    console.log("Creating whatsapp_groups table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS whatsapp_groups (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        invite_link TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Creating google_forms_distribution table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS google_forms_distribution (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        form_link TEXT NOT NULL,
        group_id INTEGER REFERENCES whatsapp_groups(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Forms distribution tables created successfully.");
  } catch (err) {
    console.error("Error creating tables:", err);
  } finally {
    process.exit();
  }
};

setupFormsDistribution();
