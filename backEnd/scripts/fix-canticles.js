#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, "..", "src", "data");

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const CANTICLE_MAP = {
  "Jeremiah 31:10, 11-12abcd, 13": "Jeremiah 31:10-14",
  "Jeremiah 31:10, 11-12ab, 13": "Jeremiah 31:10-14",
  "Daniel 3:52, 53, 54, 55, 56": "Daniel 3:52-57",
  "Daniel 3:52, 53, 54, 55, 56, 57": "Daniel 3:52-57",
  "Isaiah 38:10, 11, 12abcd, 16": "Isaiah 38:10-20",
  "Isaiah 12:2-3, 4bcd, 5-6": "Isaiah 12:1-6",
  "IsaiahA\u00AC12:2-3, 4bcd, 5-6": "Isaiah 12:1-6",
  "Deuteronomy 32:35cd-36ab, 39abcd, 41": "Deuteronomy 32:35-43",
  "Deuteronomy 32:26-27ab, 27cd-28, 30, 35cd-36ab": "Deuteronomy 32:26-43",
  "Judith 13:18bcde, 19": "Judith 16:13-15",
};

async function fetchText(ref) {
  try {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), 10000);
    const res = await fetch(`https://bible-api.com/${encodeURIComponent(ref)}`, { signal: ctrl.signal });
    clearTimeout(id);
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.text && data.text.trim().length > 50) return data.text.trim();
    return null;
  } catch { return null; }
}

async function main() {
  const year = parseInt(process.argv[2] || "2026", 10);
  const filePath = join(DATA_DIR, `readings-${year}.json`);

  console.log(`\n=== Fixing broken canticles for ${year} ===\n`);
  const db = JSON.parse(readFileSync(filePath, "utf8"));
  let fixed = 0;

  for (const [dateKey, entry] of Object.entries(db)) {
    for (const reading of entry.readings) {
      if (reading.type !== "responsorial-psalm") continue;
      if (reading.text && reading.text !== reading.citation && reading.text.length > 40) continue;

      const simplified = CANTICLE_MAP[reading.citation];
      if (!simplified) {
        console.log(`${dateKey} "${reading.citation}" -> no mapping, skipping`);
        continue;
      }

      process.stdout.write(`${dateKey} "${reading.citation}" -> "${simplified}"... `);
      const text = await fetchText(simplified);
      if (text) {
        reading.text = text;
        fixed++;
        console.log(`OK (${text.length} chars)`);
        writeFileSync(filePath, JSON.stringify(db, null, 2));
      } else {
        console.log("failed");
      }
      await sleep(800);
    }
  }

  writeFileSync(filePath, JSON.stringify(db, null, 2));
  console.log(`\nFixed: ${fixed}`);
}

main().catch(e => { console.error("FATAL:", e); process.exit(1); });
