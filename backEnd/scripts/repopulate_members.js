import { db } from "../src/Configs/dbConfig.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config(); // Ensure env vars are loaded

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedPath = path.join(__dirname, "../api_output_v3.json");

async function repopulate() {
  try {
    const rawData = fs.readFileSync(seedPath, "utf8");
    const cleanData = rawData.replace(/^\uFEFF/, "");
    const json = JSON.parse(cleanData);
    const data = json.data;

    if (!Array.isArray(data)) {
        throw new Error("JSON data is not an array");
    }

    console.log("Starting repopulation of member assignments...");

    let totalUpdated = 0;

    for (const group of data) {
      const jumuiyaId = group.id; // e.g. "st-monica"
      if (!group.members || !Array.isArray(group.members)) continue;

      for (const member of group.members) {
        const memberId = member.id; // e.g. "S1/001" or "MEM001"
        
        const res = await db.query(
          "UPDATE members SET jumuiya_id = $1 WHERE member_id = $2 RETURNING *",
          [jumuiyaId, memberId]
        );

        if (res.rows.length > 0) {
          totalUpdated++;
          console.log(`Assigned ${memberId} to ${jumuiyaId}`);
        }
      }
    }

    console.log(`Repopulation complete. Updated ${totalUpdated} member assignments.`);
    process.exit(0);
  } catch (error) {
    console.error("Error during repopulation:", error.message);
    process.exit(1);
  }
}

repopulate();
