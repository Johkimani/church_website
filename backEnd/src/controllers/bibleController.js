import logger from "../logger/winston.js";

const DAILY_BIBLE_BASE = "https://dailybible.ca/api";
const BIBLE_API_BASE = "https://bible-api.com";

const BIBLE_VERSIONS = [
  { id: "dra", name: "Catholic Bible", subtitle: "Douay-Rheims — Traditional Catholic Translation", source: "dailybible", testaments: ["OT", "NT", "DC"] },
  { id: "kjv", name: "King James Version", subtitle: "Authorized Version 1611", source: "bible-api", testaments: ["OT", "NT"] },
  { id: "web", name: "Holy Bible", subtitle: "World English Bible — Modern Translation", source: "bible-api", testaments: ["OT", "NT"] },
  { id: "bbe", name: "Good News Bible", subtitle: "Bible in Basic English — Simple & Clear", source: "bible-api", testaments: ["OT", "NT"] },
  { id: "asv", name: "American Standard", subtitle: "American Standard Version 1901", source: "bible-api", testaments: ["OT", "NT"] },
];

// Uses lowercase names as bible-api.com expects them
const BIBLE_API_BOOKS = [
  // Old Testament
  { code: "GEN", name: "Genesis", group: "OT", apiName: "genesis", chapters: 50 },
  { code: "EXO", name: "Exodus", group: "OT", apiName: "exodus", chapters: 40 },
  { code: "LEV", name: "Leviticus", group: "OT", apiName: "leviticus", chapters: 27 },
  { code: "NUM", name: "Numbers", group: "OT", apiName: "numbers", chapters: 36 },
  { code: "DEU", name: "Deuteronomy", group: "OT", apiName: "deuteronomy", chapters: 34 },
  { code: "JOS", name: "Joshua", group: "OT", apiName: "joshua", chapters: 24 },
  { code: "JDG", name: "Judges", group: "OT", apiName: "judges", chapters: 21 },
  { code: "RUT", name: "Ruth", group: "OT", apiName: "ruth", chapters: 4 },
  { code: "1SA", name: "1 Samuel", group: "OT", apiName: "1 samuel", chapters: 31 },
  { code: "2SA", name: "2 Samuel", group: "OT", apiName: "2 samuel", chapters: 24 },
  { code: "1KI", name: "1 Kings", group: "OT", apiName: "1 kings", chapters: 22 },
  { code: "2KI", name: "2 Kings", group: "OT", apiName: "2 kings", chapters: 25 },
  { code: "1CH", name: "1 Chronicles", group: "OT", apiName: "1 chronicles", chapters: 29 },
  { code: "2CH", name: "2 Chronicles", group: "OT", apiName: "2 chronicles", chapters: 36 },
  { code: "EZR", name: "Ezra", group: "OT", apiName: "ezra", chapters: 10 },
  { code: "NEH", name: "Nehemiah", group: "OT", apiName: "nehemiah", chapters: 13 },
  { code: "EST", name: "Esther", group: "OT", apiName: "esther", chapters: 10 },
  { code: "JOB", name: "Job", group: "OT", apiName: "job", chapters: 42 },
  { code: "PSA", name: "Psalms", group: "OT", apiName: "psalms", chapters: 150 },
  { code: "PRO", name: "Proverbs", group: "OT", apiName: "proverbs", chapters: 31 },
  { code: "ECC", name: "Ecclesiastes", group: "OT", apiName: "ecclesiastes", chapters: 12 },
  { code: "SNG", name: "Song of Solomon", group: "OT", apiName: "song of solomon", chapters: 8 },
  { code: "ISA", name: "Isaiah", group: "OT", apiName: "isaiah", chapters: 66 },
  { code: "JER", name: "Jeremiah", group: "OT", apiName: "jeremiah", chapters: 52 },
  { code: "LAM", name: "Lamentations", group: "OT", apiName: "lamentations", chapters: 5 },
  { code: "EZK", name: "Ezekiel", group: "OT", apiName: "ezekiel", chapters: 48 },
  { code: "DAN", name: "Daniel", group: "OT", apiName: "daniel", chapters: 12 },
  { code: "HOS", name: "Hosea", group: "OT", apiName: "hosea", chapters: 14 },
  { code: "JOL", name: "Joel", group: "OT", apiName: "joel", chapters: 3 },
  { code: "AMO", name: "Amos", group: "OT", apiName: "amos", chapters: 9 },
  { code: "OBA", name: "Obadiah", group: "OT", apiName: "obadiah", chapters: 1 },
  { code: "JON", name: "Jonah", group: "OT", apiName: "jonah", chapters: 4 },
  { code: "MIC", name: "Micah", group: "OT", apiName: "micah", chapters: 7 },
  { code: "NAM", name: "Nahum", group: "OT", apiName: "nahum", chapters: 3 },
  { code: "HAB", name: "Habakkuk", group: "OT", apiName: "habakkuk", chapters: 3 },
  { code: "ZEP", name: "Zephaniah", group: "OT", apiName: "zephaniah", chapters: 3 },
  { code: "HAG", name: "Haggai", group: "OT", apiName: "haggai", chapters: 2 },
  { code: "ZEC", name: "Zechariah", group: "OT", apiName: "zechariah", chapters: 14 },
  { code: "MAL", name: "Malachi", group: "OT", apiName: "malachi", chapters: 4 },
  // New Testament
  { code: "MAT", name: "Matthew", group: "NT", apiName: "matthew", chapters: 28 },
  { code: "MRK", name: "Mark", group: "NT", apiName: "mark", chapters: 16 },
  { code: "LUK", name: "Luke", group: "NT", apiName: "luke", chapters: 24 },
  { code: "JHN", name: "John", group: "NT", apiName: "john", chapters: 21 },
  { code: "ACT", name: "Acts", group: "NT", apiName: "acts", chapters: 28 },
  { code: "ROM", name: "Romans", group: "NT", apiName: "romans", chapters: 16 },
  { code: "1CO", name: "1 Corinthians", group: "NT", apiName: "1 corinthians", chapters: 16 },
  { code: "2CO", name: "2 Corinthians", group: "NT", apiName: "2 corinthians", chapters: 13 },
  { code: "GAL", name: "Galatians", group: "NT", apiName: "galatians", chapters: 6 },
  { code: "EPH", name: "Ephesians", group: "NT", apiName: "ephesians", chapters: 6 },
  { code: "PHP", name: "Philippians", group: "NT", apiName: "philippians", chapters: 4 },
  { code: "COL", name: "Colossians", group: "NT", apiName: "colossians", chapters: 4 },
  { code: "1TH", name: "1 Thessalonians", group: "NT", apiName: "1 thessalonians", chapters: 5 },
  { code: "2TH", name: "2 Thessalonians", group: "NT", apiName: "2 thessalonians", chapters: 3 },
  { code: "1TI", name: "1 Timothy", group: "NT", apiName: "1 timothy", chapters: 6 },
  { code: "2TI", name: "2 Timothy", group: "NT", apiName: "2 timothy", chapters: 4 },
  { code: "TIT", name: "Titus", group: "NT", apiName: "titus", chapters: 3 },
  { code: "PHM", name: "Philemon", group: "NT", apiName: "philemon", chapters: 1 },
  { code: "HEB", name: "Hebrews", group: "NT", apiName: "hebrews", chapters: 13 },
  { code: "JAS", name: "James", group: "NT", apiName: "james", chapters: 5 },
  { code: "1PE", name: "1 Peter", group: "NT", apiName: "1 peter", chapters: 5 },
  { code: "2PE", name: "2 Peter", group: "NT", apiName: "2 peter", chapters: 3 },
  { code: "1JN", name: "1 John", group: "NT", apiName: "1 john", chapters: 5 },
  { code: "2JN", name: "2 John", group: "NT", apiName: "2 john", chapters: 1 },
  { code: "3JN", name: "3 John", group: "NT", apiName: "3 john", chapters: 1 },
  { code: "JUD", name: "Jude", group: "NT", apiName: "jude", chapters: 1 },
  { code: "REV", name: "Revelation", group: "NT", apiName: "revelation", chapters: 22 },
];

// Map code → apiName for bible-api.com
const BIBLE_API_NAME_MAP = {};
BIBLE_API_BOOKS.forEach((b) => { BIBLE_API_NAME_MAP[b.code] = b.apiName; });

const DC_BOOKS = new Set([
  "TOBIT", "JUDITH", "WISDOM", "SIRACH", "BARUCH", "1 MACCABEES", "2 MACCABEES",
  "1 ESDRAS", "2 ESDRAS", "ADDDAN",
  "TOB", "JDT", "SIR", "BAR", "BEL", "SUS", "WIS",
  "1ESD", "2ESD", "1MACC", "2MACC", "EPJER", "ESTHGR", "PRAZAR", "PRMAN",
]);

const NT_BOOKS = new Set([
  "MAT", "MRK", "LUK", "JHN", "ACT", "ROM", "1CO", "2CO", "GAL", "EPH",
  "PHP", "COL", "1TH", "2TH", "TIT", "PHM", "HEB", "JAS",
  "1PE", "2PE", "1JN", "2JN", "3JN", "JUD", "REV",
  "1TI", "2TI",
]);

const UNFETCHABLE_BOOKS = new Set(["LETTER OF JEREMIAH", "PSALMS OF SOLOMON"]);

const bookListCache = {};
const chapterCache = {};
const CHAPTER_CACHE_TTL = 60 * 60 * 1000;

function getTestament(code) {
  if (NT_BOOKS.has(code)) return "NT";
  if (DC_BOOKS.has(code)) return "DC";
  return "OT";
}

async function fetchJson(url, label) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
    }
    return await res.json();
  } catch (err) {
    logger.error(`Bible API fetch failed (${label}): ${err.message}`);
    throw err;
  }
}

async function fetchDailyBibleBooks() {
  const url = `${DAILY_BIBLE_BASE}/books?translation=dra`;
  const data = await fetchJson(url, "dailybible books dra");
  if (!data.books || !Array.isArray(data.books)) {
    throw new Error("Unexpected response format from dailybible.ca");
  }
  return data.books.map((b) => ({
    code: b.book_id.toUpperCase(),
    name: b.book_name,
    chapters: b.chapters,
  }));
}

async function fetchDailyBibleChapter(bookCode, chapter) {
  const bookParam = bookCode.toLowerCase().replace(/ /g, "+");
  const url = `${DAILY_BIBLE_BASE}/${bookParam}+${chapter}?translation=dra`;
  const data = await fetchJson(url, `dailybible chapter ${bookCode} ${chapter}`);
  if (!data.verses || !Array.isArray(data.verses)) {
    throw new Error("Unexpected response format from dailybible.ca");
  }
  return data.verses.map((v) => ({
    verse: v.verse,
    text: v.text,
  }));
}

async function fetchBibleApiChapter(bookCode, chapter, version) {
  const apiName = BIBLE_API_NAME_MAP[bookCode];
  if (!apiName) {
    throw new Error(`Book "${bookCode}" is not mapped for bible-api.com.`);
  }
  const ref = `${apiName}+${chapter}`;
  const url = `${BIBLE_API_BASE}/${encodeURIComponent(ref)}?translation=${version}`;
  const data = await fetchJson(url, `bible-api ${version} ${bookCode} ${chapter}`);
  if (!data.verses) {
    throw new Error("Unexpected response format from bible-api.com");
  }
  return data.verses.map((v) => ({
    verse: v.verse,
    text: v.text.trim(),
  }));
}

async function getBookList(version) {
  if (bookListCache[version]) return bookListCache[version];

  const verInfo = BIBLE_VERSIONS.find((v) => v.id === version);
  let books;

  if (verInfo.source === "dailybible") {
    const apiBooks = await fetchDailyBibleBooks();
    books = apiBooks
      .filter((b) => !UNFETCHABLE_BOOKS.has(b.code))
      .map((b) => ({
        code: b.code,
        name: b.name,
        testament: getTestament(b.code),
        chapters: b.chapters,
      }));
  } else {
    books = BIBLE_API_BOOKS.map((b) => ({
      code: b.code,
      name: b.name,
      testament: b.group,
      chapters: b.chapters,
    }));
  }

  bookListCache[version] = books;
  return books;
}

function getCachedChapter(cacheKey) {
  const cached = chapterCache[cacheKey];
  if (!cached) return null;
  if (Date.now() - cached.timestamp > CHAPTER_CACHE_TTL) {
    delete chapterCache[cacheKey];
    return null;
  }
  return cached.data;
}

function setChapterCache(cacheKey, data) {
  chapterCache[cacheKey] = { data, timestamp: Date.now() };
}

export const getVersions = (_req, res) => {
  try {
    return res.json({ versions: BIBLE_VERSIONS });
  } catch (err) {
    logger.error(`Bible getVersions error: ${err.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getBooks = async (req, res) => {
  try {
    const version = (req.query.version || "dra").toLowerCase();

    if (!BIBLE_VERSIONS.some((v) => v.id === version)) {
      return res.status(400).json({
        error: `Unknown version "${version}".`,
        available: BIBLE_VERSIONS.map((v) => v.id),
      });
    }

    const books = await getBookList(version);

    return res.json({
      version,
      totalBooks: books.length,
      books,
    });
  } catch (err) {
    logger.error(`Bible getBooks error: ${err.message}`);
    res.status(502).json({
      error: "Failed to fetch book list from Bible API.",
      details: err.message,
    });
  }
};

export const getChapter = async (req, res) => {
  try {
    const { book, chapter } = req.query;
    const version = (req.query.version || "dra").toLowerCase();

    if (!book || !chapter) {
      return res.status(400).json({
        error: 'Missing required query parameters: "book" and "chapter".',
      });
    }

    const verInfo = BIBLE_VERSIONS.find((v) => v.id === version);
    if (!verInfo) {
      return res.status(400).json({
        error: `Unknown version "${version}".`,
        available: BIBLE_VERSIONS.map((v) => v.id),
      });
    }

    const bookCode = book.toUpperCase();
    const chapterNum = parseInt(chapter, 10);

    if (isNaN(chapterNum) || chapterNum < 1) {
      return res.status(400).json({ error: "Chapter must be a positive integer." });
    }

    let bookInfo;
    try {
      const books = await getBookList(version);
      bookInfo = books.find((b) => b.code === bookCode);
    } catch {
      return res.status(502).json({
        error: "Failed to fetch book list from Bible API.",
      });
    }

    if (!bookInfo) {
      return res.status(404).json({
        error: `Book "${bookCode}" not found in version "${version}".`,
      });
    }

    if (chapterNum > bookInfo.chapters) {
      return res.status(404).json({
        error: `Book "${bookCode}" has only ${bookInfo.chapters} chapters. Requested chapter ${chapterNum}.`,
      });
    }

    const cacheKey = `${version}:${bookCode}:${chapterNum}`;
    const cached = getCachedChapter(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    let verses;
    if (verInfo.source === "dailybible") {
      verses = await fetchDailyBibleChapter(bookCode, chapterNum);
    } else {
      verses = await fetchBibleApiChapter(bookCode, chapterNum, version);
    }

    const response = {
      book: bookCode,
      bookName: bookInfo.name,
      chapter: chapterNum,
      testament: bookInfo.testament,
      totalVerses: verses.length,
      verses,
    };

    setChapterCache(cacheKey, response);

    return res.json(response);
  } catch (err) {
    logger.error(`Bible getChapter error: ${err.message}`);
    res.status(502).json({
      error: "Failed to fetch chapter from Bible API.",
      details: err.message,
    });
  }
};

export const searchVerses = async (req, res) => {
  try {
    const { q, version } = req.query;
    const ver = (version || "dra").toLowerCase();

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        error: 'Missing required query parameter: "q".',
      });
    }

    if (!BIBLE_VERSIONS.some((v) => v.id === ver)) {
      return res.status(400).json({
        error: `Unknown version "${ver}".`,
        available: BIBLE_VERSIONS.map((v) => v.id),
      });
    }

    return res.status(501).json({
      error: "Server-side Bible search is not supported by the upstream APIs.",
      message:
        "Please implement client-side search on the frontend by fetching chapters and searching locally.",
      query: q,
      version: ver,
    });
  } catch (err) {
    logger.error(`Bible searchVerses error: ${err.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};
