#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, "..", "src", "data");

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

const year = parseInt(process.argv[2] || "2027", 10);
const filePath = join(DATA_DIR, `readings-${year}.json`);

console.log(`\n=== Fixing remaining broken psalms for ${year} ===\n`);
const db = JSON.parse(readFileSync(filePath, "utf8"));
let fixed = 0;

const MAPS = [
  ["2027-03-07", "137:1-2, 3, 4-5, 6", "Psalm 137"],
  ["2027-06-04", "Isaiah 12:2-3, 4, 5-6.", "Isaiah 12:1-6"],
  ["2027-07-19", "Exodus 15:1bc-2, 3-4, 5-6", "Exodus 15:1-6"],
  ["2027-11-08", "Psalm 139:1b-3, 4-6, 7-8, 9-10", "Psalm 139"],
  ["2027-11-19", "1 Chronicles 29:10bcd, 11abc, 11d-12a, 12bcd", "1 Chronicles 29:10-13"],
  ["2027-11-30", "Psalm 19:8, 9, 10, 11", "Psalm 19"],
  ["2027-12-12", "Isaiah 12:2-3, 4, 5-6.", "Isaiah 12:1-6"],
  ["2027-12-22", "1 Samuel 2:1, 4-5, 6-7, 8abcd", "1 Samuel 2:1-10"],
];

for (const [dateKey, citation, ref] of MAPS) {
  const entry = db[dateKey];
  if (!entry) continue;
  for (const r of entry.readings) {
    if (r.type === "responsorial-psalm" && (r.text === r.citation || r.text.length < 40)) {
      process.stdout.write(`${dateKey} "${citation}" -> "${ref}"... `);
      const text = await fetchText(ref);
      if (text) {
        r.text = text;
        fixed++;
        console.log(`OK (${text.length} chars)`);
      } else {
        console.log("failed");
      }
      await new Promise(r => setTimeout(r, 800));
    }
  }
}

writeFileSync(filePath, JSON.stringify(db, null, 2));
console.log(`\nFixed: ${fixed}`);
