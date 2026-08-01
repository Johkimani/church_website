#!/usr/bin/env node
/**
 * Targeted backfill: simplifies Catholic liturgical references
 * to something bible-api.com can handle.
 *
 * Strategy:
 * - For "Book Chapter:Verse" → try as-is
 * - For complex verse lists → try chapter only
 * - For multi-chapter → skip (too complex)
 * - For psalms → always use chapter only
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

function simplifyReference(ref) {
  // Step 1: Basic cleanup
  let s = ref
    .replace(/[\u2013\u2014]/g, "-")  // dashes
    .replace(/[\u2018\u2019]/g, "'")  // apostrophes
    .replace(/\u201C|\u201D/g, '"')   // quotes
    .replace(/\s+or\s+.*$/i, "")      // remove "or ..." alternatives
    .replace(/;\s*\d+.*$/, "")        // remove "; Chapter:..." (multi-chapter)
    .replace(/\s+and\s+\d+.*$/i, "")  // remove "and verse..." at end
    .trim();

  // Step 2: Extract book and chapter
  const match = s.match(/^([\d\s\w]+?)\s+(\d+):/);
  if (!match) return null;
  const book = match[1].trim();
  const chapter = match[2];

  // Step 3: For psalms, always use chapter only (most reliable)
  if (/^Psalm/i.test(book)) {
    return `Psalm ${chapter}`;
  }

  // Step 4: Check for complex verse selectors
  const afterColon = s.split(":")[1] || "";
  // If it has "a", "b", "ab" suffixes → too complex
  if (/\d+[ab]/.test(afterColon)) return null;
  // If it has "—" or multiple chapter references → too complex
  if (/\d+\s*-\s*\d+/.test(afterColon) && afterColon.includes(",")) return null;

  // Step 5: Try simple reference like "Isaiah 55:1-3"
  const simpleMatch = s.match(/^([\d\s\w]+?)\s+(\d+):([\d,\s-]+)$/);
  if (simpleMatch) {
    // Clean verse numbers
    let verses = simpleMatch[3].trim();
    // If too many verse ranges, just use first range
    const parts = verses.split(",").map(v => v.trim());
    if (parts.length > 2) {
      verses = parts.slice(0, 2).join(", ");
    }
    return `${book} ${chapter}:${verses}`;
  }

  // Step 6: Last resort — try just "Book Chapter"
  return `${book} ${chapter}`;
}

async function fetchBibleText(reference) {
  const simplified = simplifyReference(reference);
  if (!simplified) return null;

  const url = `${BIBLE_TEXT_API}/${encodeURIComponent(simplified)}`;
  try {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), 12000);
    const res = await fetch(url, {
      headers: { "User-Agent": "CSAKirinyaga-Targeted/1.0" },
      signal: ctrl.signal,
    });
    clearTimeout(id);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.text || data.text.trim().length < 30) return null;
    return data.text.trim();
  } catch {
    return null;
  }
}

async function main() {
  const year = parseInt(process.argv[2] || "2026", 10);
  const targetDay = process.argv[3] || null; // optional: "sunday" or specific date
  const filePath = join(DATA_DIR, `readings-${year}.json`);

  console.log(`\n=== Targeted backfill for ${year} ===\n`);

  const db = JSON.parse(readFileSync(filePath, "utf8"));
  let fixed = 0;
  let failed = 0;
  const failedList = [];

  const entries = Object.entries(db);
  for (const [dateKey, entry] of entries) {
    // Optional filter
    if (targetDay === "sunday") {
      const d = new Date(dateKey + "T12:00:00");
      if (d.getDay() !== 0) continue;
    }

    let changed = false;
    for (const reading of entry.readings) {
      if (reading.text && reading.text !== reading.citation && reading.text.length > 30) {
        continue;
      }

      process.stdout.write(`  ${dateKey} ${reading.type} (${reading.citation})... `);
      const simplified = simplifyReference(reading.citation);
      process.stdout.write(`→ "${simplified}"... `);

      const text = await fetchBibleText(reading.citation);
      if (text) {
        reading.text = text;
        changed = true;
        fixed++;
        console.log(`OK (${text.length} chars)`);
      } else {
        failed++;
        failedList.push(`${dateKey} ${reading.type} (${reading.citation})`);
        console.log("failed");
      }

      await sleep(120);
    }

    if (changed) {
      writeFileSync(filePath, JSON.stringify(db, null, 2));
    }
  }

  writeFileSync(filePath, JSON.stringify(db, null, 2));

  console.log(`\n=== Done ===`);
  console.log(`  Fixed: ${fixed}`);
  console.log(`  Failed: ${failed}`);
  if (failedList.length > 0) {
    console.log(`\n  Still failing:`);
    failedList.slice(0, 20).forEach((f) => console.log(`    ${f}`));
    if (failedList.length > 20) console.log(`    ... and ${failedList.length - 20} more`);
  }
}

main().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
