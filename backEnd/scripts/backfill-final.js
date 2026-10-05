#!/usr/bin/env node
/**
 * Final backfill: fetch Bible text for all citation-only readings.
 * Simplifies complex references for bible-api.com.
 * Saves after every 10 entries to avoid data loss.
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, "..", "src", "data");

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function simplifyRef(ref) {
  let s = ref
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\u201C|\u201D/g, '"')
    .replace(/\s+or\s+.*$/i, "")
    .trim();

  // Psalms: use chapter only (most reliable)
  const pm = s.match(/^(Psalm)\s+(\d+)/i);
  if (pm) return `Psalm ${pm[2]}`;
  // Canticle of Daniel
  if (/^Daniel\s+3/i.test(s)) return null;

  // Remove verse suffixes: "34a" -> "34", "4b" -> "4"
  s = s.replace(/(\d)[ab]+(?!\d)/g, "$1");
  // Remove semicolon multi-chapter
  s = s.replace(/;\s*\d+.*$/, "");
  // Remove trailing "and Verse..."
  s = s.replace(/\s+and\s+\d+.*$/i, "");

  // Try simple "Book Chapter:VerseList"
  const m = s.match(/^([\d\s\w]+?)\s+(\d+):([\d,\s-]+)$/);
  if (m) {
    const book = m[1].trim();
    const verses = m[3].trim();
    // If too many verse ranges (>2 commas), use first range
    const parts = verses.split(",").map(v => v.trim());
    if (parts.length > 2) {
      return `${book} ${m[2]}:${parts.slice(0, 2).join(", ")}`;
    }
    return `${book} ${m[2]}:${verses}`;
  }

  // Try "Book Chapter" only
  const m2 = s.match(/^([\d\s\w]+?)\s+(\d+)$/);
  if (m2) return `${m2[1].trim()} ${m2[2]}`;

  return null;
}

async function fetchText(ref, retries = 2) {
  const simplified = simplifyRef(ref);
  if (!simplified) return null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const ctrl = new AbortController();
      const id = setTimeout(() => ctrl.abort(), 10000);
      const res = await fetch(`https://bible-api.com/${encodeURIComponent(simplified)}`, { signal: ctrl.signal });
      clearTimeout(id);
      if (!res.ok) {
        if (attempt < retries) { await sleep(2000); continue; }
        return null;
      }
      const data = await res.json();
      if (data?.text && data.text.trim().length > 20) return data.text.trim();
      return null;
    } catch {
      if (attempt < retries) { await sleep(2000); continue; }
      return null;
    }
  }
  return null;
}

async function main() {
  const year = parseInt(process.argv[2] || "2026", 10);
  const filePath = join(DATA_DIR, `readings-${year}.json`);

  console.log(`\n=== Final backfill for ${year} ===\n`);

  const db = JSON.parse(readFileSync(filePath, "utf8"));
  let fixed = 0, failed = 0, skipped = 0;
  let batchCount = 0;

  for (const [dateKey, entry] of Object.entries(db)) {
    for (const reading of entry.readings) {
      // Skip if already has full text
      if (reading.text && reading.text !== reading.citation && reading.text.length > 30) {
        skipped++;
        continue;
      }

      const simplified = simplifyRef(reading.citation);
      process.stdout.write(`${dateKey} ${reading.type} "${reading.citation}" → "${simplified}"... `);

      const text = await fetchText(reading.citation);
      if (text) {
        reading.text = text;
        fixed++;
        console.log(`OK (${text.length} chars)`);
      } else {
        failed++;
        console.log("failed");
      }

      batchCount++;
      // Save after every 10 fetches
      if (batchCount % 10 === 0) {
        writeFileSync(filePath, JSON.stringify(db, null, 2));
        process.stdout.write(`  [saved after ${batchCount} fetches]\n`);
      }

      await sleep(800);
    }
  }

  // Final save
  writeFileSync(filePath, JSON.stringify(db, null, 2));
  console.log(`\n=== Done ===`);
  console.log(`  Skipped (already had text): ${skipped}`);
  console.log(`  Fixed: ${fixed}`);
  console.log(`  Failed: ${failed}`);
}

main().catch(e => { console.error("FATAL:", e); process.exit(1); });
