#!/usr/bin/env node
/**
 * Build Swahili readings database from English readings + Swahili Bible JSON.
 * Maps English Bible references to Swahili verse text.
 *
 * Usage: node build-swahili-readings.js [year]
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, "..", "src", "data");

const BOOK_MAP = {
  "genesis": "GEN", "exodus": "EXO", "leviticus": "LEV", "numbers": "NUM",
  "deuteronomy": "DEU", "joshua": "JOS", "judges": "JDG", "ruth": "RUT",
  "1 samuel": "1SA", "2 samuel": "2SA", "1 kings": "1KI", "2 kings": "2KI",
  "1 chronicles": "1CH", "2 chronicles": "2CH", "ezra": "EZR", "nehemiah": "NEH",
  "esther": "EST", "job": "JOB", "psalm": "PSA", "psalms": "PSA",
  "proverbs": "PRO", "ecclesiastes": "ECC", "song of songs": "SNG",
  "song of solomon": "SNG", "isaiah": "ISA", "jeremiah": "JER",
  "lamentations": "LAM", "ezekiel": "EZK", "daniel": "DAN",
  "hosea": "HOS", "joel": "JOL", "amos": "AMO", "obadiah": "OBA",
  "jonah": "JON", "micah": "MIC", "nahum": "NAM", "habakkuk": "HAB",
  "zephaniah": "ZEP", "haggai": "HAG", "zechariah": "ZEC", "malachi": "MAL",
  "matthew": "MAT", "mark": "MRK", "luke": "LUK", "john": "JHN",
  "acts": "ACT", "romans": "ROM", "1 corinthians": "1CO", "2 corinthians": "2CO",
  "galatians": "GAL", "ephesians": "EPH", "philippians": "PHP",
  "colossians": "COL", "1 thessalonians": "1TH", "2 thessalonians": "2TH",
  "1 timothy": "1TI", "2 timothy": "2TI", "titus": "TIT", "philemon": "PHM",
  "hebrews": "HEB", "james": "JAS", "1 peter": "1PE", "2 peter": "2PE",
  "1 john": "1JN", "2 john": "2JN", "3 john": "3JN", "jude": "JUD",
  "revelation": "REV", "sirach": null, "wisdom": null, "tobit": null,
  "baruch": null, "1 maccabees": null, "2 maccabees": null,
  "judith": null, "additions to esther": null,
};

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function parseReference(citation) {
  let s = citation
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\u201C|\u201D/g, '"')
    .replace(/[\uFFFD]/g, "")
    .replace(/\s+or\s+.*$/i, "")
    .replace(/\.\s*$/, "")
    .replace(/\s+and\s+/g, ", ")
    .trim();

  // Handle multi-chapter refs like "Psalm 42:2, 3; 43:3, 4" — take first chapter only
  const semiIdx = s.indexOf(";");
  if (semiIdx !== -1) {
    s = s.substring(0, semiIdx).trim();
  }

  const m = s.match(/^([\d\s\w]+?)\s+(\d+):(.+)$/);
  if (!m) {
    const m2 = s.match(/^([\d\s\w]+?)\s+(\d+)$/);
    if (m2) {
      return { book: m2[1].trim(), chapter: parseInt(m2[2]), verses: null };
    }
    return null;
  }

  const book = m[1].trim();
  const chapter = parseInt(m[2]);
  const verseStr = m[3].replace(/[a-z]/gi, "").trim();
  const parts = verseStr.split(",").map(v => v.trim());
  const verses = [];
  for (const part of parts) {
    const range = part.split("-").map(v => parseInt(v.trim()));
    if (range.length === 2 && !isNaN(range[0]) && !isNaN(range[1])) {
      for (let v = range[0]; v <= range[1]; v++) verses.push(v);
    } else if (!isNaN(range[0])) {
      verses.push(range[0]);
    }
  }

  return { book, chapter, verses: verses.length > 0 ? verses : null };
}

function getBookCode(bookName) {
  const lower = bookName.toLowerCase().trim();
  return BOOK_MAP[lower] || null;
}

function getVerseId(bookCode, chapter, verse) {
  return `${bookCode}.${chapter}.${verse}`;
}

function buildSwahiliText(citation, swahiliBible) {
  const parsed = parseReference(citation);
  if (!parsed) return null;

  const bookCode = getBookCode(parsed.book);
  if (!bookCode) return null;

  const book = swahiliBible.books[bookCode];
  if (!book) return null;

  const chapterKey = `${bookCode}.${parsed.chapter}`;
  const chapter = book.chapters[chapterKey];
  if (!chapter) return null;

  const verses = [];
  if (parsed.verses) {
    for (const v of parsed.verses) {
      const verseId = getVerseId(bookCode, parsed.chapter, v);
      if (chapter.verses[verseId]) {
        verses.push(chapter.verses[verseId].trim());
      }
    }
  } else {
    // Whole chapter
    for (const [key, text] of Object.entries(chapter.verses)) {
      if (key.match(/^\d+$/)) {
        verses.push(text.trim());
      }
    }
  }

  if (verses.length === 0) return null;
  return verses.join("\n");
}

async function main() {
  const year = parseInt(process.argv[2] || "2026", 10);
  const enPath = join(DATA_DIR, `readings-${year}.json`);
  const swPath = join(DATA_DIR, `readings-${year}-sw.json`);
  const biblePath = join(__dirname, "..", "swahili-bible.json");

  console.log(`\n=== Building Swahili readings for ${year} ===\n`);

  // Load Swahili Bible
  if (!existsSync(biblePath)) {
    console.error(`Swahili Bible not found at: ${biblePath}`);
    console.error("Download from: https://www.kaggle.com/datasets/jordanyoung993/biblica-open-kiswahili-contemporary-version");
    console.error("Extract the JSON file to: backEnd/swahili-bible.json");
    process.exit(1);
  }

  console.log("Loading Swahili Bible...");
  const swahiliBible = JSON.parse(readFileSync(biblePath, "utf8"));
  const bookCount = Object.keys(swahiliBible.books).length;
  console.log(`  Loaded ${bookCount} books\n`);

  // Load English readings
  console.log("Loading English readings...");
  const enDb = JSON.parse(readFileSync(enPath, "utf8"));
  const dateCount = Object.keys(enDb).length;
  console.log(`  Loaded ${dateCount} dates\n`);

  // Build Swahili database
  const swDb = {};
  let totalReadings = 0;
  let successCount = 0;
  let failCount = 0;

  for (const [dateKey, entry] of Object.entries(enDb)) {
    swDb[dateKey] = {
      ...entry,
      readings: [],
    };

    for (const reading of entry.readings) {
      totalReadings++;
      const swText = buildSwahiliText(reading.citation, swahiliBible);

      if (swText) {
        swDb[dateKey].readings.push({
          ...reading,
          text: swText,
        });
        successCount++;
      } else {
        // Keep English text as fallback
        swDb[dateKey].readings.push(reading);
        failCount++;
      }
    }

    // Save after every 50 dates
    if (totalReadings % 500 === 0) {
      writeFileSync(swPath, JSON.stringify(swDb, null, 2));
      process.stdout.write(`  [saved after ${Object.keys(swDb).length} dates]\n`);
    }
  }

  // Final save
  writeFileSync(swPath, JSON.stringify(swDb, null, 2));

  console.log(`\n=== Done ===`);
  console.log(`  Total readings: ${totalReadings}`);
  console.log(`  Swahili text found: ${successCount}`);
  console.log(`  Fell back to English: ${failCount}`);
  console.log(`  Saved to: ${swPath}\n`);
}

main().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
