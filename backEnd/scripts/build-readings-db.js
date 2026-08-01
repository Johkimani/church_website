#!/usr/bin/env node
/**
 * Build a local readings database from free public APIs.
 * Run: node scripts/build-readings-db.js [year] [year2] ...
 * Example: node scripts/build-readings-db.js 2026 2027 2028 2029
 *
 * Saves after each month so partial progress is never lost.
 * Skips dates that already exist in the output file.
 */

import { writeFileSync, existsSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, "..", "src", "data");

const CATHOLIC_READINGS_API = "https://cpbjr.github.io/catholic-readings-api";
const BIBLE_TEXT_API = "https://bible-api.com";

const REF_TYPES = {
  firstReading: "first-reading",
  psalm: "responsorial-psalm",
  secondReading: "second-reading",
  gospel: "gospel",
};

const TITLES = {
  "first-reading": "First Reading",
  "responsorial-psalm": "Responsorial Psalm",
  "second-reading": "Second Reading",
  gospel: "Gospel",
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function pad(n) {
  return String(n).padStart(2, "0");
}

async function fetchJSON(url, timeout = 10000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "CSAKirinyaga-ReadingsDB/1.0" },
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(id);
  }
}

async function fetchBibleText(reference) {
  let urlRef = reference;
  const psalmMatch = reference.match(/^Psalm\s+(\d+)/i);
  if (psalmMatch) {
    urlRef = `Psalm ${psalmMatch[1]}`;
  }
  const url = `${BIBLE_TEXT_API}/${encodeURIComponent(urlRef)}`;
  const data = await fetchJSON(url, 12000);
  return data?.text || null;
}

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function loadExisting(year) {
  const outFile = join(DATA_DIR, `readings-${year}.json`);
  if (existsSync(outFile)) {
    try {
      return JSON.parse(readFileSync(outFile, "utf8"));
    } catch {
      return {};
    }
  }
  return {};
}

function saveYear(year, db) {
  const outFile = join(DATA_DIR, `readings-${year}.json`);
  writeFileSync(outFile, JSON.stringify(db, null, 2));
}

async function fetchMonth(year, month, db) {
  const days = getDaysInMonth(year, month);
  let fetched = 0;
  let skipped = 0;

  for (let day = 1; day <= days; day++) {
    const dateKey = `${year}-${pad(month)}-${pad(day)}`;

    if (db[dateKey]) {
      skipped++;
      continue;
    }

    process.stdout.write(`  ${dateKey}... `);

    const md = `${pad(month)}-${pad(day)}`;
    const url = `${CATHOLIC_READINGS_API}/readings/${year}/${md}.json`;
    const apiData = await fetchJSON(url);

    if (!apiData?.readings) {
      console.log("no API data");
      await sleep(50);
      continue;
    }

    const readings = [];
    for (const [key, type] of Object.entries(REF_TYPES)) {
      if (apiData.readings[key]) {
        const citation = apiData.readings[key];
        const text = await fetchBibleText(citation);
        readings.push({
          type,
          title: TITLES[type],
          citation,
          text: text || citation,
        });
        await sleep(80);
      }
    }

    if (readings.length > 0) {
      db[dateKey] = {
        date: dateKey,
        season: apiData.season || "Ordinary Time",
        celebration: `${apiData.season || "Daily Mass"} — ${dateKey}`,
        readings,
        source: "local-database",
      };
      fetched++;
      console.log(`${readings.length} readings OK`);
    }

    await sleep(50);
  }

  return { fetched, skipped };
}

async function main() {
  const args = process.argv.slice(2);
  const years = args.length > 0 ? args.map(Number) : [2026, 2027, 2028, 2029];

  console.log(`\n=== Building local readings database ===`);
  console.log(`Years: ${years.join(", ")}`);
  console.log(`Output: ${DATA_DIR}/readings-{year}.json\n`);

  if (!existsSync(DATA_DIR)) {
    const { mkdirSync } = await import("fs");
    mkdirSync(DATA_DIR, { recursive: true });
  }

  for (const year of years) {
    const db = loadExisting(year);
    const existingCount = Object.keys(db).length;
    console.log(`\n--- Year ${year} (${existingCount} existing entries) ---`);

    for (let month = 1; month <= 12; month++) {
      const monthName = new Date(year, month - 1).toLocaleString("en", { month: "short" });
      process.stdout.write(`\n  [${monthName}] `);

      const { fetched, skipped } = await fetchMonth(year, month, db);
      console.log(` → ${fetched} new, ${skipped} skipped`);

      saveYear(year, db);
    }

    const total = Object.keys(db).length;
    console.log(`\n  ${year} complete: ${total} entries saved\n`);
  }

  console.log("=== Done! ===");
}

main().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
