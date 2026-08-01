import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BOOK_INFO = {
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

function main() {
  const inputPath = path.join(__dirname, '..', 'swahili-bible.json');
  const outputDir = path.join(__dirname, '..', 'src', 'data');
  const outputPath = path.join(outputDir, 'bible-sw.json');

  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Input file not found: ${inputPath}`);
    process.exit(1);
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('📖 Reading swahili-bible.json...');
  const old = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

  const bible = {
    bible: "Biblia Takatifu - Swahili",
    language: "sw",
    books: {}
  };

  let totalVerses = 0;

  for (const [code, oldBook] of Object.entries(old.books)) {
    const info = BOOK_INFO[code] || { name: code, testament: "OT" };

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
    console.log(`  ✅ ${info.name} (${code}) - ${bookChapters} chapters`);
  }

  fs.writeFileSync(outputPath, JSON.stringify(bible, null, 2), 'utf8');

  console.log(`\n${'='.repeat(50)}`);
  console.log(`✅ Swahili Bible restructured!`);
  console.log(`   Books: ${Object.keys(bible.books).length}`);
  console.log(`   Total verses: ${totalVerses}`);
  console.log(`   Output: ${outputPath}`);
  console.log(`${'='.repeat(50)}`);
}

main();
