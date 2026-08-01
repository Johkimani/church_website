#!/usr/bin/env node
/**
 * Fix psalms that have citation-only text by fetching full chapter text.
 */
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, "..", "src", "data");

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchPsalmText(citation) {
  const m = citation.match(/Psalm\s+(\d+)/i);
  if (!m) return null;
  const chapter = m[1];
  try {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), 10000);
    const res = await fetch(`https://bible-api.com/Psalm%20${chapter}`, { signal: ctrl.signal });
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

  console.log(`\n=== Fixing broken psalms for ${year} ===\n`);
  const db = JSON.parse(readFileSync(filePath, "utf8"));
  let fixed = 0;

  for (const [dateKey, entry] of Object.entries(db)) {
    for (const reading of entry.readings) {
      if (reading.type !== "responsorial-psalm") continue;
      if (reading.text && reading.text !== reading.citation && reading.text.length > 40) continue;

      process.stdout.write(`${dateKey} "${reading.citation}"... `);
      const text = await fetchPsalmText(reading.citation);
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
