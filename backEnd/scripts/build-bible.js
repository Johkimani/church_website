import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://dailybible.ca/api';
const TRANSLATION = 'dra';
const DELAY_MS = 100;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const SAVE_EVERY = 5;

const TEMP_FILE = path.join(__dirname, '..', '.bible-build-progress.json');
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'data', 'bible-en.json');

const MATTHEW_ORDER = 39;

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

async function main() {
  console.log('Fetching book list from dailybible.ca...\n');
  const booksUrl = `${BASE_URL}/books?translation=${TRANSLATION}`;
  const booksData = await fetchWithRetry(booksUrl);

  if (!booksData.books || !Array.isArray(booksData.books)) {
    console.error('Unexpected API response:', JSON.stringify(booksData).slice(0, 500));
    process.exit(1);
  }

  console.log(`Found ${booksData.books.length} books\n`);

  const outputDir = path.join(__dirname, '..', 'src', 'data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let bible = {
    bible: "Douay-Rheims Catholic Bible",
    language: "en",
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
  console.log(`Build complete!`);
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

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
