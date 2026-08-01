#!/usr/bin/env node
/**
 * Backfill missing Bible text in the local readings database.
 * Handles complex Catholic liturgical references by cleaning them up.
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, "..", "src", "data");
const BIBLE_TEXT_API = "https://bible-api.com";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function cleanReference(ref) {
  let cleaned = ref
    .replace(/\u2013/g, "-")   // en-dash → hyphen
    .replace(/\u2014/g, "-")   // em-dash → hyphen
    .replace(/\u2019/g, "'")   // curly apostrophe
    .replace(/\u2018/g, "'")
    .replace(/\u201C/g, '"')
    .replace(/\u201D/g, '"')
    .trim();

  // Remove "or ..." alternatives
  cleaned = cleaned.replace(/\s+or\s+\d.*$/i, "");

  // Remove semicolons with chapter refs (e.g., "1 Kings 11:29-32; 12:19")
  cleaned = cleaned.replace(/;\s*\d+:\d+.*$/, "");

  // Remove complex multi-chapter ranges after comma
  // e.g., "2 Samuel 18:9-10, 14b, 24-25a, 30–19:3" → too complex, skip
  if (cleaned.match(/\d+:\d+.*\d+:\d+/) && cleaned.match(/;\s*\d/) || cleaned.match(/,.*\d+:\d+.*,\s*\d+:\d+/)) {
    return null; // too complex
  }

  // Remove verse suffixes like "a", "b", "ab", "bc" from verse ranges
  // e.g., "Psalm 51:3-4, 5-6ab, 12-13, 14 and 17"
  // Keep it simple: just get the main chapter
  const psalmMatch = cleaned.match(/^Psalm\s+(\d+)/i);
  if (psalmMatch) {
    // For psalms, just reference the chapter
    return `Psalm ${psalmMatch[1]}`;
  }

  // Remove "and" connectors in verse lists
  cleaned = cleaned.replace(/\s+and\s+\d+/g, "");

  // Remove trailing complex verse lists after first comma group
  // Keep first range only: "Isaiah 50:4-9a" → OK
  // "Isaiah 50:4-7, 10-12" → try "Isaiah 50:4-12" or just first range
  const parts = cleaned.split(",");
  if (parts.length > 2) {
    // Too many verse ranges, just use first part
    cleaned = parts[0].trim();
  }

  return cleaned || null;
}

async function fetchBibleText(reference) {
  const cleaned = cleanReference(reference);
  if (!cleaned) return null;

  const url = `${BIBLE_TEXT_API}/${encodeURIComponent(cleaned)}`;
  try {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), 15000);
    const res = await fetch(url, {
      headers: { "User-Agent": "CSAKirinyaga-Backfill/1.0" },
      signal: ctrl.signal,
    });
    clearTimeout(id);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.text) return null;
    // Sanity check: text should be at least 30 chars
    if (data.text.trim().length < 30) return null;
    return data.text.trim();
  } catch {
    return null;
  }
}

async function main() {
  const year = parseInt(process.argv[2] || "2026", 10);
  const filePath = join(DATA_DIR, `readings-${year}.json`);

  console.log(`\n=== Backfilling Bible text for ${year} ===\n`);

  const db = JSON.parse(readFileSync(filePath, "utf8"));
  let fixed = 0;
  let alreadyGood = 0;
  let failed = 0;
  let skipped = 0;
  const failedList = [];

  for (const [dateKey, entry] of Object.entries(db)) {
    let changed = false;

    for (const reading of entry.readings) {
      if (reading.text && reading.text !== reading.citation && reading.text.length > 30) {
        alreadyGood++;
        continue;
      }

      process.stdout.write(`  ${dateKey} ${reading.type}... `);

      const text = await fetchBibleText(reading.citation);
      if (text) {
        reading.text = text;
        fixed++;
        changed = true;
        console.log(`OK (${text.length} chars)`);
      } else {
        failed++;
        failedList.push(`${dateKey} ${reading.type} (${reading.citation})`);
        console.log("failed");
      }

      await sleep(150);
    }

    if (changed) {
      writeFileSync(filePath, JSON.stringify(db, null, 2));
    }

    skipped++;
  }

  writeFileSync(filePath, JSON.stringify(db, null, 2));

  console.log(`\n=== Done ===`);
  console.log(`  Already good: ${alreadyGood}`);
  console.log(`  Fixed: ${fixed}`);
  console.log(`  Failed: ${failed}`);
  console.log(`\n  Failed readings (${failedList.length}):`);
  failedList.slice(0, 30).forEach((f) => console.log(`    ${f}`));
  if (failedList.length > 30) console.log(`    ... and ${failedList.length - 30} more`);
  console.log(`\n  Saved to: ${filePath}`);
}

main().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
