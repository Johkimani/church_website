import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://dailybible.ca/api';
const TRANSLATION = 'swahili';
const DELAY_MS = 100;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const SAVE_EVERY = 5;

const TEMP_FILE = path.join(__dirname, '..', '.bible-sw-build-progress.json');
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'data', 'bible-sw.json');
const FALLBACK_FILE = path.join(__dirname, '..', 'swahili-bible.json');

const MATTHEW_ORDER = 39;

const FALLBACK_BOOK_INFO = {
  GEN: { name: "Genesis", testament: "OT" },
  EXO: { name: "Exodus", testament: "OT" },
  LEV: { name: "Leviticus", testament: "OT" },
  NUM: { name: "Numbers", testament: "OT" },
  DEU: { name: "Deuteronomy", testament: "OT" },
  JOS: { name: "Joshua", testament: "OT" },
  JDG: { name: "Judges", testament: "OT" },
  RUT: { name: "Ruth", testament: "OT" },
  "1SA": { name: "1 Samuel", testament: "OT" },
  "2SA": { name: "2 Samuel", testament: "OT" },
  "1KI": { name: "1 Kings", testament: "OT" },
  "2KI": { name: "2 Kings", testament: "OT" },
  "1CH": { name: "1 Chronicles", testament: "OT" },
  "2CH": { name: "2 Chronicles", testament: "OT" },
  EZR: { name: "Ezra", testament: "OT" },
  NEH: { name: "Nehemiah", testament: "OT" },
  EST: { name: "Esther", testament: "OT" },
  JOB: { name: "Job", testament: "OT" },
  PSA: { name: "Psalms", testament: "OT" },
  PRO: { name: "Proverbs", testament: "OT" },
  ECC: { name: "Ecclesiastes", testament: "OT" },
  SNG: { name: "Song of Solomon", testament: "OT" },
  WIS: { name: "Wisdom", testament: "OT" },
  SIR: { name: "Sirach", testament: "OT" },
  ISA: { name: "Isaiah", testament: "OT" },
  JER: { name: "Jeremiah", testament: "OT" },
  LAM: { name: "Lamentations", testament: "OT" },
  BAR: { name: "Baruch", testament: "OT" },
  EZK: { name: "Ezekiel", testament: "OT" },
  DAN: { name: "Daniel", testament: "OT" },
  HOS: { name: "Hosea", testament: "OT" },
  JOE: { name: "Joel", testament: "OT" },
  AMO: { name: "Amos", testament: "OT" },
  OBA: { name: "Obadiah", testament: "OT" },
  JON: { name: "Jonah", testament: "OT" },
  MIC: { name: "Micah", testament: "OT" },
  NAM: { name: "Nahum", testament: "OT" },
  HAB: { name: "Habakkuk", testament: "OT" },
  ZEP: { name: "Zephaniah", testament: "OT" },
  HAG: { name: "Haggai", testament: "OT" },
  ZEC: { name: "Zechariah", testament: "OT" },
  MAL: { name: "Malachi", testament: "OT" },
  MAT: { name: "Matthew", testament: "NT" },
  MRK: { name: "Mark", testament: "NT" },
  LUK: { name: "Luke", testament: "NT" },
  JHN: { name: "John", testament: "NT" },
  ACT: { name: "Acts", testament: "NT" },
  ROM: { name: "Romans", testament: "NT" },
  "1CO": { name: "1 Corinthians", testament: "NT" },
  "2CO": { name: "2 Corinthians", testament: "NT" },
  GAL: { name: "Galatians", testament: "NT" },
  EPH: { name: "Ephesians", testament: "NT" },
  PHP: { name: "Philippians", testament: "NT" },
  COL: { name: "Colossians", testament: "NT" },
  "1TH": { name: "1 Thessalonians", testament: "NT" },
  "2TH": { name: "2 Thessalonians", testament: "NT" },
  "1TM": { name: "1 Timothy", testament: "NT" },
  "2TM": { name: "2 Timothy", testament: "NT" },
  TIT: { name: "Titus", testament: "NT" },
  PHM: { name: "Philemon", testament: "NT" },
  HEB: { name: "Hebrews", testament: "NT" },
  JAS: { name: "James", testament: "NT" },
  "1PE": { name: "1 Peter", testament: "NT" },
  "2PE": { name: "2 Peter", testament: "NT" },
  "1JN": { name: "1 John", testament: "NT" },
  "2JN": { name: "2 John", testament: "NT" },
  "3JN": { name: "3 John", testament: "NT" },
  JUD: { name: "Jude", testament: "NT" },
  REV: { name: "Revelation", testament: "NT" },
};

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'ChurchWebsite/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode} for ${url}: ${JSON.stringify(json)}`));
          } else {
            resolve(json);
          }
        } catch (e) {
          reject(new Error(`JSON parse error for ${url}: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fetchJSON(url);
    } catch (err) {
      console.error(`    Attempt ${attempt}/${retries} failed: ${err.message}`);
      if (attempt < retries) {
        await sleep(RETRY_DELAY_MS);
      } else {
        throw err;
      }
    }
  }
}

function loadProgress() {
  if (fs.existsSync(TEMP_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(TEMP_FILE, 'utf8'));
    } catch {
      return null;
    }
  }
  return null;
}

function saveProgress(bible, completedBooks) {
  const temp = { bible, completedBooks };
  fs.writeFileSync(TEMP_FILE, JSON.stringify(temp), 'utf8');
}

function clearProgress() {
  if (fs.existsSync(TEMP_FILE)) {
    fs.unlinkSync(TEMP_FILE);
  }
}

async function buildFromAPI() {
  console.log('Fetching Swahili book list from dailybible.ca...\n');
  const booksUrl = `${BASE_URL}/books?translation=${TRANSLATION}`;
  const booksData = await fetchWithRetry(booksUrl);

  if (!booksData.books || !Array.isArray(booksData.books)) {
    throw new Error('Unexpected API response: ' + JSON.stringify(booksData).slice(0, 500));
  }

  console.log(`Found ${booksData.books.length} books\n`);

  const outputDir = path.join(__dirname, '..', 'src', 'data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let bible = {
    bible: "Biblia Takatifu - Swahili",
    language: "sw",
    books: {}
  };

  let completedBooks = [];
  let totalChapters = 0;
  let fetchedChapters = 0;
  let failedChapters = [];

  const saved = loadProgress();
  if (saved && saved.completedBooks) {
    bible = saved.bible;
    completedBooks = saved.completedBooks;
    console.log(`Resuming from progress file (${completedBooks.length} books already done)\n`);
  }

  const booksToFetch = booksData.books.filter(b => !completedBooks.includes(b.book_id));

  for (let i = 0; i < booksToFetch.length; i++) {
    const book = booksToFetch[i];
    const bookIndex = booksData.books.indexOf(book);
    const testament = bookIndex < MATTHEW_ORDER ? "OT" : "NT";

    bible.books[book.book_id] = {
      name: book.book_name,
      testament: testament,
      chapters: {}
    };

    console.log(`\n${book.book_name} (${book.book_id}) - ${book.chapters} chapters`);

    for (let ch = 1; ch <= book.chapters; ch++) {
      totalChapters++;
      const url = `${BASE_URL}/${book.book_name.toLowerCase()}+${ch}?translation=${TRANSLATION}`;

      try {
        const data = await fetchWithRetry(url);
        const chapterKey = `${book.book_id}.${ch}`;
        const versesObj = {};

        if (data.verses && Array.isArray(data.verses)) {
          for (const v of data.verses) {
            const verseKey = `${book.book_id}.${ch}.${v.verse}`;
            versesObj[verseKey] = v.text.replace(/\s+/g, ' ').trim();
          }
        }

        bible.books[book.book_id].chapters[chapterKey] = {
          chapter: ch,
          verses: versesObj
        };

        fetchedChapters++;
        process.stdout.write(`  Chapter ${ch}/${book.chapters} (${Object.keys(versesObj).length} verses)\r`);

      } catch (err) {
        failedChapters.push({ code: book.book_id, chapter: ch, error: err.message });
        console.error(`\n  Failed: ${book.book_id} chapter ${ch} - ${err.message}`);
      }

      await sleep(DELAY_MS);
    }

    completedBooks.push(book.book_id);
    console.log(`\n  Done: ${book.book_name} (${Object.keys(bible.books[book.book_id].chapters).length} chapters)`);

    if (completedBooks.length % SAVE_EVERY === 0) {
      saveProgress(bible, completedBooks);
      console.log(`  Progress saved`);
    }
  }

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(bible, null, 2), 'utf8');
  clearProgress();

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Swahili Bible build complete (from API)!`);
  console.log(`   Books: ${Object.keys(bible.books).length}`);
  console.log(`   Chapters fetched: ${fetchedChapters}/${totalChapters}`);
  console.log(`   Failed: ${failedChapters.length}`);
  if (failedChapters.length > 0) {
    console.log(`   Failed chapters:`);
    for (const f of failedChapters) {
      console.log(`     - ${f.code} ${f.chapter}: ${f.error}`);
    }
  }
  console.log(`   Output: ${OUTPUT_FILE}`);
  console.log(`${'='.repeat(50)}`);
}

function buildFromFallback() {
  if (!fs.existsSync(FALLBACK_FILE)) {
    console.error(`Fallback file not found: ${FALLBACK_FILE}`);
    console.error(`   The Swahili translation is not available on dailybible.ca and no local swahili-bible.json exists.`);
    process.exit(1);
  }

  console.log('Swahili translation not available on dailybible.ca');
  console.log('Falling back to restructuring swahili-bible.json...\n');

  const outputDir = path.join(__dirname, '..', 'src', 'data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const old = JSON.parse(fs.readFileSync(FALLBACK_FILE, 'utf8'));

  const bible = {
    bible: "Biblia Takatifu - Swahili",
    language: "sw",
    books: {}
  };

  let totalVerses = 0;

  for (const [code, oldBook] of Object.entries(old.books)) {
    const info = FALLBACK_BOOK_INFO[code] || { name: code, testament: "OT" };

    bible.books[code] = {
      name: info.name,
      testament: info.testament,
      chapters: {}
    };

    for (const [chKey, oldChapter] of Object.entries(oldBook.chapters)) {
      const chMatch = chKey.match(/\.(\d+)$/);
      if (!chMatch) continue;
      const chNum = parseInt(chMatch[1]);

      const newVerses = {};
      for (const [verKey, text] of Object.entries(oldChapter.verses)) {
        newVerses[verKey] = text;
        totalVerses++;
      }

      bible.books[code].chapters[chKey] = {
        chapter: chNum,
        verses: newVerses
      };
    }

    const bookChapters = Object.keys(bible.books[code].chapters).length;
    console.log(`  ${info.name} (${code}) - ${bookChapters} chapters`);
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(bible, null, 2), 'utf8');

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Swahili Bible restructured (from fallback)!`);
  console.log(`   Books: ${Object.keys(bible.books).length}`);
  console.log(`   Total verses: ${totalVerses}`);
  console.log(`   Output: ${OUTPUT_FILE}`);
  console.log(`${'='.repeat(50)}`);
}

async function main() {
  try {
    await buildFromAPI();
  } catch (err) {
    console.warn(`\nAPI fetch failed: ${err.message}`);
    console.warn(`   Falling back to local swahili-bible.json\n`);
    buildFromFallback();
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
