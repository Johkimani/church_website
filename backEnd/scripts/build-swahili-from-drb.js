#!/usr/bin/env node
/**
 * build-swahili-from-drb.js
 * Rebuilds Swahili readings DB from DRB citations using the Swahili Bible JSON.
 * For each reading, parses the citation (e.g., "Numbers 6: 22-27"),
 * looks up each verse in the Swahili Bible, and concatenates them.
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "src", "data");
const BIBLE_PATH = join(__dirname, "..", "swahili-bible.json");

const year = parseInt(process.argv[2] || "2026", 10);

console.log(`Building Swahili readings for ${year} from DRB citations...\n`);

// Load Swahili Bible
const bible = JSON.parse(readFileSync(BIBLE_PATH, "utf8"));
const books = bible.books;

// Book name → code mapping
const BOOK_MAP = {
  "genesis": "GEN", "exodus": "EXO", "leviticus": "LEV", "numbers": "NUM",
  "deuteronomy": "DEU", "joshua": "JOS", "judges": "JDG", "ruth": "RUT",
  "1 samuel": "1SA", "2 samuel": "2SA", "1 kings": "1KI", "2 kings": "2KI",
  "1 chronicles": "1CH", "2 chronicles": "2CH", "ezra": "EZR", "nehemiah": "NEH",
  "esther": "EST", "job": "JOB", "psalms": "PSA", "psalm": "PSA",
  "proverbs": "PRO", "ecclesiastes": "ECC", "song of songs": "SNG",
  "isaiah": "ISA", "jeremiah": "JER", "lamentations": "LAM", "ezekiel": "EZK",
  "daniel": "DAN", "hosea": "HOS", "joel": "JOL", "amos": "AMO",
  "obadiah": "OBA", "jonah": "JON", "micah": "MIC", "nahum": "NAM",
  "habakkuk": "HAB", "zephaniah": "ZEP", "haggai": "HAG", "zechariah": "ZEC",
  "malachi": "MAL", "matthew": "MAT", "mark": "MRK", "luke": "LUK",
  "john": "JHN", "acts": "ACT", "romans": "ROM", "1 corinthians": "1CO",
  "2 corinthians": "2CO", "galatians": "GAL", "ephesians": "EPH",
  "philippians": "PHP", "colossians": "COL", "1 thessalonians": "1TH",
  "2 thessalonians": "2TH", "1 timothy": "1TI", "2 timothy": "2TI",
  "titus": "TIT", "philemon": "PHM", "hebrews": "HEB", "james": "JAS",
  "1 peter": "1PE", "2 peter": "2PE", "1 john": "1JN", "2 john": "2JN",
  "3 john": "3JN", "jude": "JUD", "revelation": "REV",
  "wisdom": "WIS", "sirach": "SIR", "baruch": "BAR", "1 maccabees": "1MA",
  "2 maccabees": "2MA", "tobit": "TOB", "judith": "JDT",
  "1 esdras": "1ES", "2 esdras": "2ES",
  "prayer of manasseh": "MAN",
  // Ordinal variants
  "first samuel": "1SA", "second samuel": "2SA",
  "first kings": "1KI", "second kings": "2KI",
  "first chronicles": "1CH", "second chronicles": "2CH",
  "first corinthians": "1CO", "second corinthians": "2CO",
  "first thessalonians": "1TH", "second thessalonians": "2TH",
  "first timothy": "1TI", "second timothy": "2TI",
  "first peter": "1PE", "second peter": "2PE",
  "first john": "1JN", "second john": "2JN", "third john": "3JN",
  "first maccabees": "1MA", "second maccabees": "2MA",
  "first esdras": "1ES", "second esdras": "2ES",
};

// Fallback: map first letters for unknown books
function findBookCode(name) {
  const lower = name.toLowerCase().trim();
  if (BOOK_MAP[lower]) return BOOK_MAP[lower];
  // Try partial match
  for (const [k, v] of Object.entries(BOOK_MAP)) {
    if (lower.startsWith(k) || k.startsWith(lower)) return v;
  }
  return null;
}

// Parse citation like "Numbers 6: 22-27" or "Psalms 67: 2-3, 5, 6, 8"
function parseCitation(citation) {
  if (!citation) return null;

  // Remove "or ..." alternatives
  let c = citation.split(/\s+or\b/i)[0].trim();
  // Remove "or, at an afternoon..." etc.
  c = c.split(/,\s*at\s+an?\s+/i)[0].trim();

  // Try to find book name by matching known book codes
  // Start from the longest known book name and work down
  const sortedBooks = Object.entries(BOOK_MAP).sort((a, b) => b[0].length - a[0].length);
  let bookCode = null;
  let bookName = null;
  let rest = c;
  
  for (const [name, code] of sortedBooks) {
    if (c.toLowerCase().startsWith(name)) {
      bookCode = code;
      bookName = name;
      rest = c.substring(name.length).trim();
      break;
    }
  }
  
  if (!bookCode) return null;

  // rest should be like "6: 22-27" or "6: 2-3, 5, 6, 8"
  const m = rest.match(/^(\d+[A-Z]?)[\s:]+(.+)$/i);
  if (!m) return null;

  const chapter = m[1].replace(/[a-z]$/i, "").trim();
  const versesStr = m[2].trim();

  // Parse verse ranges: "22-27, 5, 6, 8" → [{start:22,end:27}, {start:5,end:5}, ...]
  const ranges = [];
  const parts = versesStr.split(/[;,]\s*/);
  for (const part of parts) {
    // Handle "34a" or "10-22a" style
    const rm = part.match(/^(\d+)[a-z]?\s*[-–]\s*(\d+)[a-z]?$/);
    if (rm) {
      ranges.push({ start: parseInt(rm[1], 10), end: parseInt(rm[2], 10) });
    } else {
      const rv = part.match(/^(\d+)[a-z]?$/);
      if (rv) {
        const v = parseInt(rv[1], 10);
        ranges.push({ start: v, end: v });
      }
    }
  }

  // Handle chapter range like "3: 10-14; 8: 10" — split by semicolons
  // Already handled above if citation has multiple chapters
  
  return { bookCode, chapter: parseInt(chapter, 10), ranges };
}

// Look up Swahili verse
function getSwVerse(bookCode, chapter, verse) {
  const chKey = `${bookCode}.${chapter}`;
  const vKey = `${bookCode}.${chapter}.${verse}`;
  const book = books[bookCode];
  if (!book) return null;
  const ch = book.chapters[chKey];
  if (!ch || !ch.verses) return null;
  return ch.verses[vKey] || null;
}

// Build full Swahili text for a citation
function buildSwText(citation) {
  const parsed = parseCitation(citation);
  if (!parsed) return null;

  const { bookCode, chapter, ranges } = parsed;
  const verses = [];

  for (const range of ranges) {
    for (let v = range.start; v <= range.end; v++) {
      const text = getSwVerse(bookCode, chapter, v);
      if (text) {
        verses.push(text.trim());
      }
    }
  }

  return verses.length > 0 ? verses.join("\n") : null;
}

// Also handle multi-chapter citations like "Isaiah 7: 10-14; 8: 10"
function buildSwTextMulti(citation) {
  if (!citation) return null;
  
  // Remove "or ..." alternatives
  let c = citation.split(/\s+or\b/i)[0].trim();
  c = c.split(/,\s*at\s+an?\s+/i)[0].trim();
  
  // Split by semicolons for multi-chapter
  const chapters = c.split(/;\s*/);
  const allVerses = [];
  
  for (const ch of chapters) {
    const parsed = parseCitation(ch.trim());
    if (!parsed) continue;
    
    const { bookCode, chapter, ranges } = parsed;
    for (const range of ranges) {
      for (let v = range.start; v <= range.end; v++) {
        const text = getSwVerse(bookCode, chapter, v);
        if (text) allVerses.push(text.trim());
      }
    }
  }
  
  return allVerses.length > 0 ? allVerses.join("\n") : null;
}

// Load DRB data
const drbPath = join(DATA_DIR, `readings-${year}-dr.json`);
if (!existsSync(drbPath)) {
  console.error(`DRB file not found: ${drbPath}`);
  process.exit(1);
}

const drb = JSON.parse(readFileSync(drbPath, "utf8"));
const result = {};
let totalReadings = 0, translated = 0, failed = 0;

for (const [dateKey, day] of Object.entries(drb)) {
  const readings = day.readings.map((r) => {
    totalReadings++;
    
    let swText = null;
    
    // For psalms, also handle the response
    let swResponse = null;
    if (r.type === "responsorial-psalm") {
      // Psalm responses are already in PSALM_RESPONSES_SW in the controller
      swResponse = r.response || null;
    }
    
    // Try multi-chapter first, then single
    if (r.citation) {
      swText = buildSwTextMulti(r.citation);
    }
    
    // If no Swahili text found, return null (will be handled by frontend fallback)
    if (swText) {
      translated++;
      return {
        ...r,
        text: swText,
        ...(swResponse ? { response: swResponse } : {}),
      };
    } else {
      failed++;
      // Keep DRB text as fallback (controller will handle)
      return r;
    }
  });
  
  result[dateKey] = { ...day, readings };
}

// Write output
const outPath = join(DATA_DIR, `readings-${year}-sw.json`);
writeFileSync(outPath, JSON.stringify(result, null, 2), "utf8");

console.log(`=== DONE ===`);
console.log(`Total readings: ${totalReadings}`);
console.log(`Translated to Swahili: ${translated} (${Math.round(translated/totalReadings*100)}%)`);
console.log(`Kept as DRB fallback: ${failed} (${Math.round(failed/totalReadings*100)}%)`);
console.log(`Written to: ${outPath}`);

// Show sample
const sampleDate = "2026-01-01";
if (result[sampleDate]) {
  console.log(`\n=== Sample: ${sampleDate} ===`);
  for (const r of result[sampleDate].readings) {
    const isSw = r.text && !r.text.includes("Yahweh") && !r.text.includes("And the ");
    console.log(`${r.type}: ${r.citation} | ${isSw ? "SWAHILI" : "STILL ENGLISH"}`);
    console.log(`  first 100: ${r.text.substring(0, 100)}`);
  }
}
