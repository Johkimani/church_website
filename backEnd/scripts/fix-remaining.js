#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, "..", "src", "data");

const DANIEL_3_CANTICLE = [
  "Bless the Lord, O waters above the heavens,",
  "all you powers of the heavens, bless the Lord.",
  "Bless the Lord, O sun and moon,",
  "all stars of heaven, bless the Lord.",
  "Bless the Lord, all rain and dew,",
  "all winds of God, bless the Lord.",
  "Bless the Lord, fire and heat,",
  "cold and warmth, bless the Lord.",
  "Bless the Lord, dew and frost,",
  "ice and cold, bless the Lord.",
  "Bless the Lord, snow and ice,",
  "hail and storm, bless the Lord.",
  "Bless the Lord, O nights and days,",
  "light and darkness, bless the Lord.",
  "Bless the Lord, O earth,",
  "mountains and hills, bless the Lord.",
].join("\n");

const year = parseInt(process.argv[2] || "2026", 10);
const filePath = join(DATA_DIR, `readings-${year}.json`);

console.log(`\n=== Fixing remaining broken entries for ${year} ===\n`);
const db = JSON.parse(readFileSync(filePath, "utf8"));
let fixed = 0;

for (const [dateKey, entry] of Object.entries(db)) {
  for (const reading of entry.readings) {
    if (reading.type !== "responsorial-psalm") continue;
    if (reading.text && reading.text !== reading.citation && reading.text.length > 40) continue;

    // Fix Daniel 3 canticle
    if (reading.citation.includes("Daniel 3") && reading.text.length < 40) {
      reading.text = DANIEL_3_CANTICLE;
      console.log(`${dateKey} Fixed Daniel 3 canticle (${DANIEL_3_CANTICLE.length} chars)`);
      fixed++;
    }

    // Fix garbled Isaiah encoding
    if (reading.citation && reading.citation.includes("IsaiahA")) {
      reading.citation = reading.citation.replace(/IsaiahA[^\d]*/, "Isaiah ");
      console.log(`${dateKey} Fixed Isaiah encoding: "${reading.citation}"`);
    }
  }
}

writeFileSync(filePath, JSON.stringify(db, null, 2));
console.log(`\nFixed: ${fixed}`);
