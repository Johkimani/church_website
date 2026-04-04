import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
});

const DATA_PATH = path.join(__dirname, '../api_output_v3.json');

async function run() {
    try {
        await client.connect();
        console.log("Connected to database.");

        if (!fs.existsSync(DATA_PATH)) {
            throw new Error(`Data file not found at ${DATA_PATH}`);
        }

        let rawContent = fs.readFileSync(DATA_PATH, 'utf8');
        // Strip BOM if present
        if (rawContent.charCodeAt(0) === 0xFEFF) {
            rawContent = rawContent.slice(1);
        }
        
        const rawData = JSON.parse(rawContent);
        const jumuiyaList = rawData.data;

        console.log(`Found ${jumuiyaList.length} Jumuiyas in seed data.`);

        let totalMembers = 0;
        let totalRegistered = 0;

        for (const jumuiya of jumuiyaList) {
            const jumuiyaId = jumuiya.id;
            const members = jumuiya.members || [];
            
            console.log(`Processing ${jumuiya.name} (${members.length} members)...`);

            for (const m of members) {
                // 1. Insert/Update into members table
                // Note: members table has first_name, last_name, year_of_study
                // Seed data has name (full name) and year
                const nameParts = (m.name || "").split(" ");
                const firstName = nameParts[0] || "Unknown";
                const lastName = nameParts.slice(1).join(" ") || "";

                await client.query(
                    `INSERT INTO members (member_id, first_name, last_name, email, year_of_study, password, jumuiya_id) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7) 
                     ON CONFLICT (member_id) DO UPDATE SET 
                        first_name = EXCLUDED.first_name, 
                        last_name = EXCLUDED.last_name, 
                        email = EXCLUDED.email, 
                        year_of_study = EXCLUDED.year_of_study,
                        jumuiya_id = EXCLUDED.jumuiya_id,
                        password = COALESCE(members.password, EXCLUDED.password)`,
                    [m.id, firstName, lastName, m.email, m.year || "", 'hashed_dummy_password', jumuiyaId]
                );

                // 2. Insert into registered table
                await client.query(
                    `INSERT INTO registered (member_id, jumuiya_id) 
                     VALUES ($1, $2) 
                     ON CONFLICT (member_id, jumuiya_id) DO NOTHING`,
                    [m.id, jumuiyaId]
                );

                totalMembers++;
                totalRegistered++;
            }
        }

        console.log(`\nSUCCESS: Seeded ${totalMembers} members and created ${totalRegistered} registration records.`);

    } catch (err) {
        console.error("Seeding failed:", err.message);
    } finally {
        await client.end();
        console.log("Disconnected from database.");
    }
}

run();
