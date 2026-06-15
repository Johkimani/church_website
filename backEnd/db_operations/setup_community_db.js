import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure env variables are loaded from the backend directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import { setupCommunityDatabase } from '../src/migrations/communityDbInit.js';

async function run() {
  console.log("--- STARTING COMMUNITY HUB DATABASE SETUP SCRIPT ---");
  try {
    await setupCommunityDatabase();
    console.log("--- COMMUNITY HUB DATABASE SETUP SCRIPT COMPLETE ---");
    process.exit(0);
  } catch (err) {
    console.error("❌ Standalone Community Hub database setup failed:", err);
    process.exit(1);
  }
}

run();
