#!/usr/bin/env node
/**
 * build-dr-readings.js
 * Fetches Douay-Rheims Catholic Bible readings from Catholic Gallery
 * and builds a local JSON database for the backend.
 *
 * Source: https://www.catholicgallery.org/mass-reading/DDMMYY/
 * Format: DDMMYY (e.g., 040126 = January 4, 2026)
 *
 * Usage: node build-dr-readings.js [year]
 */

import { writeFileSync, readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, "..", "src", "data");

const BASE_URL = "https://www.catholicgallery.org/mass-reading";
const YEARLY_URL = "https://www.catholicgallery.org/mass-reading/daily-mass-readings-YEAR/";

function slugToDateKey(slug) {
  const dd = slug.substring(0, 2);
  const mm = slug.substring(2, 4);
  const yy = slug.substring(4, 6);
  const year = 2000 + parseInt(yy, 10);
  return `${year}-${mm}-${dd}`;
}

function stripHtml(html) {
  let s = html;
  s = s.replace(/<br\s*\/?>/gi, "\n");
  s = s.replace(/<\/p>/gi, "\n");
  s = s.replace(/<\/div>/gi, "\n");
  s = s.replace(/<[^>]+>/g, "");
  s = s.replace(/&ldquo;/g, "\u201c");
  s = s.replace(/&rdquo;/g, "\u201d");
  s = s.replace(/&rsquo;/g, "\u2019");
  s = s.replace(/&lsquo;/g, "\u2018");
  s = s.replace(/&hellip;/g, "...");
  s = s.replace(/&ndash;/g, "\u2013");
  s = s.replace(/&mdash;/g, "\u2014");
  s = s.replace(/&nbsp;/g, " ");
  s = s.replace(/&amp;/g, "&");
  s = s.replace(/&lt;/g, "<");
  s = s.replace(/&gt;/g, ">");
  s = s.replace(/&#\d+;/g, (m) => String.fromCharCode(parseInt(m.slice(2, -1), 10)));
  return s;
}

function parsePage(html) {
  const readings = [];

  // Extract celebration
  let celebration = "";
  const celebMatch = html.match(/class="entry-title"[^>]*>(.*?)<\/h2>/i)
    || html.match(/<h1[^>]*>(.*?)<\/h1>/i);
  if (celebMatch) celebration = stripHtml(celebMatch[1]).trim();

  // Find the detailed section (after "Lectionary:")
  const lectIdx = html.indexOf("Lectionary:");
  if (lectIdx === -1) return { celebration, readings };

  const detail = html.substring(lectIdx);

  // Split by section markers
  const markers = [
    { type: "first-reading", start: "First Reading:", end: "Responsorial Psalm:" },
    { type: "responsorial-psalm", start: "Responsorial Psalm:", end: "Second Reading:" },
    { type: "second-reading", start: "Second Reading:", end: "Gospel Acclamation:|Gospel:" },
    { type: "gospel", start: "Gospel Acclamation:|Gospel:", end: "The readings on this page|Tags:" },  // gospel ends before footer
  ];

  for (const marker of markers) {
    // Find start (handle | alternatives)
    let startIdx = -1;
    let startLen = 0;
    for (const s of marker.start.split("|")) {
      const i = detail.indexOf(s);
      if (i > 0 && (startIdx === -1 || i < startIdx)) {
        startIdx = i;
        startLen = s.length;
      }
    }
    if (startIdx === -1) continue;

    // Find end (handle | alternatives)
    let endIdx = detail.length;
    if (marker.end) {
      for (const e of marker.end.split("|")) {
        const ei = detail.indexOf(e, startIdx + startLen);
        if (ei > 0 && ei < endIdx) endIdx = ei;
      }
    }

    const chunk = detail.substring(startIdx + marker.start.length, endIdx);
    const clean = stripHtml(chunk);
    const lines = clean.split("\n")
      .map(l => l.trim())
      .filter(l => l.length > 0)
      .map(l => l.replace(/^[\w.]*catholicgallery[\w./<>-]*>\s*/i, ""))  // Strip URL prefix fragments
      .map(l => l.replace(/^[\w.]+\.(com|org|net|html?)[^>]*>\s*/i, ""));  // Strip any other URL fragments

    if (lines.length === 0) continue;

    // First non-empty line is usually the citation
    let citation = "";
    let textLines = [...lines];

    // Check if first line looks like a citation (book chapter: verse)
    // Allow multi-word book names: "First Kings", "Second Timothy", "Song of Songs", etc.
    // Also handle "Esther C: 12" where C is a chapter letter
    if (/^\d?\s*\w+(\s+\w+)*\s+[\dA-Z]+[\s:]/i.test(lines[0])) {
      citation = lines[0];
      textLines = lines.slice(1);
    }

    // Remove verse numbers from text, then strip junk
    let cleanedText = textLines
      .map(l => l.replace(/^\d+[a-z]*(?:-\d+[a-z]*)?\s+/, ""))
      .join("\n");

    // Pre-filter: remove lines that are clearly CSS/JS junk
    cleanedText = cleanedText
      .split("\n")
      .filter(l => {
        const t = l.trim();
        if (!t) return false;
        if (/^\.?\w*\s*\{/.test(t)) return false;  // CSS rules: .adslot { or .Bible {
        if (/^@media/.test(t)) return false;
        if (/^\(adsbygoogle/.test(t)) return false;
        if (/^document\./.test(t)) return false;
        if (/^window\./.test(t)) return false;
        if (/^var\s+/.test(t)) return false;
        if (/^\}?\s*$/.test(t)) return false;
        if (/\.push\(\{/.test(t)) return false;
        if (/\.adslot/.test(t) && t.length < 200) return false;
        return true;
      })
      .join("\n");

    // Strip junk: CSS, ads, footer, navigation, social links, sourceURL, etc.
    cleanedText = cleanedText
      .replace(/@media[^{]*\{[^}]*\}/g, '')
      .replace(/\.adslot[^}]*\{[^}]*\}/g, '')
      .replace(/\.Bible[^}]*\{[^}]*\}/g, '')
      .replace(/\(adsbygoogle\s*=\s*window\.adsbygoogle\s*\|\|\s*\[\]\)\.push\(\{[^}]*\}\);?/g, '')
      .replace(/document\.addEventListener\s*\(\s*['"][^'"]+['"][^)]*\)/g, '')
      .replace(/document\.getElementById\s*\([^)]*\)[^;]*;/g, '')
      .replace(/window\.__CF\$cv\$params[^;]*;/g, '')
      .replace(/document\.createElement\s*\([^)]*\)[^;]*;/g, '')
      .replace(/document\.getElementsByTagName\s*\([^)]*\)[^;]*;/g, '')
      .replace(/SourceURL=[^\s]+/g, '')
      .replace(/\(adsbygoogle\s*=\s*window\.adsbygoogle\s*\|\|\s*\[\]\)\.push\(\{[^}]*\}\)/g, '')
      .replace(/\s*\.cgAd[^}]*\{[^}]*\}/g, '')
      .replace(/\s*#bio_ep[^}]*\{[^}]*\}/g, '')
      .replace(/\s*\.paExit[^}]*\{[^}]*\}/g, '')
      .replace(/\s*\.bioep[^}]*\{[^}]*\}/g, '')
      .replace(/No Thanks/g, '')
      .replace(/Your Faith\. Your Way\./g, '')
      .replace(/Follow us on (Facebook|Instagram|X|YouTube|WhatsApp)/g, '')
      .replace(/Subscribe to our YouTube Channel/g, '')
      .replace(/Download our App[\s\S]*$/g, '')
      .replace(/Stay Connected[\s\S]*$/g, '')
      .replace(/Related Articles[\s\S]*$/g, '')
      .replace(/Tags:.*$/gm, '')
      .replace(/Share:[\s\S]*$/g, '')
      .replace(/Pradeep Augustine[\s\S]*$/g, '')
      .replace(/Leave a Reply[\s\S]*$/g, '')
      .replace(/The readings on this page are taken from[\s\S]*$/g, '')
      .replace(/Daily Mass Readings - 202[5-9][\s\S]*$/g, '')
      .replace(/Daily Mass Readings - (Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),[\s\S]*$/g, '')
      .replace(/Easter Triduum ends after Evening Prayer[\s\S]*$/g, '')
      .replace(/Prayer of the Faithful[\s\S]*$/g, '')
      .replace(/General Intercessions[\s\S]*$/g, '')
      .replace(/December - \d+[\s\S]*$/g, '')
      .replace(/January - \d+[\s\S]*$/g, '')
      .replace(/February - \d+[\s\S]*$/g, '')
      .replace(/March - \d+[\s\S]*$/g, '')
      .replace(/April - \d+[\s\S]*$/g, '')
      .replace(/May - \d+[\s\S]*$/g, '')
      .replace(/June - \d+[\s\S]*$/g, '')
      .replace(/July - \d+[\s\S]*$/g, '')
      .replace(/August - \d+[\s\S]*$/g, '')
      .replace(/September - \d+[\s\S]*$/g, '')
      .replace(/October - \d+[\s\S]*$/g, '')
      .replace(/November - \d+[\s\S]*$/g, '')
      .replace(/Available on:[\s\S]*$/g, '')
      .replace(/Follow Pradeep on[\s\S]*$/g, '')
      .replace(/\.cgAd3[\s\S]*$/g, '')
      .replace(/\(adsbygoogle[\s\S]*$/g, '')
      .replace(/window\.__CF[\s\S]*$/g, '')
      .replace(/function\s+\w+\s*\(\)\s*\{[^}]*\}/g, '')
      .replace(/^\s*\}\s*$/gm, '')
      .replace(/\s{3,}/g, '\n')
      .trim();

    // For psalms, extract response
    let response = null;
    if (marker.type === "responsorial-psalm") {
      // Strip HTML tags from chunk before regex matching
      const psClean = stripHtml(chunk);
      // Try: R. (2a) Response text
      const rMatch = psClean.match(/R\.\s*\(\d+[a-z]*(?:-\d+[a-z]*)?\)\s*([^.!?\n]+[.!?])/i);
      if (rMatch) {
        response = rMatch[1].trim();
      } else {
        // Fallback: R. Response text (no parenthesized number)
        const rSimple = psClean.match(/R\.\s+([A-Z][^.!?\n]+[.!?])/i);
        if (rSimple && !rSimple[1].toLowerCase().includes("alleluia")) {
          response = rSimple[1].trim();
        }
      }
    }

    if (cleanedText.length > 5) {
      const reading = {
        type: marker.type,
        title: marker.type === "gospel" ? "Gospel" : marker.type === "responsorial-psalm" ? "Responsorial Psalm" : marker.type === "first-reading" ? "First Reading" : "Second Reading",
        citation,
        text: cleanedText,
      };
      if (response) reading.response = response;
      readings.push(reading);
    }
  }

  return { celebration, readings };
}

async function fetchPage(url, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 15000);
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "text/html",
        },
        signal: ctrl.signal,
      });
      clearTimeout(t);
      if (res.ok) return await res.text();
      if (res.status === 404) return null;
      if (attempt < retries) await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
    } catch (err) {
      if (attempt < retries) await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
      else { console.log(`  FAIL: ${err.message}`); return null; }
    }
  }
  return null;
}

async function getSlugsForYear(year) {
  const url = YEARLY_URL.replace("YEAR", year);
  const html = await fetchPage(url);
  if (!html) return [];
  const pattern = /href="https:\/\/www\.catholicgallery\.org\/mass-reading\/(\d{6})\/"/g;
  const slugs = new Set();
  let m;
  while ((m = pattern.exec(html)) !== null) {
    const dk = slugToDateKey(m[1]);
    if (dk.startsWith(String(year))) slugs.add(m[1]);
  }
  return [...slugs];
}

async function buildYear(year) {
  console.log(`\n=== Building DR readings for ${year} ===\n`);
  const slugs = await getSlugsForYear(year);
  console.log(`Found ${slugs.length} slugs`);
  if (!slugs.length) return { ok: 0, fail: 0 };

  const db = {};
  let ok = 0, fail = 0;

  for (const slug of slugs) {
    const dateKey = slugToDateKey(slug);
    process.stdout.write(`  ${dateKey} ... `);
    const html = await fetchPage(`${BASE_URL}/${slug}/`);
    if (!html) { console.log("SKIP"); fail++; continue; }

    const { celebration, readings } = parsePage(html);
    if (!readings.length) { console.log("SKIP (no readings)"); fail++; continue; }

    const [y, m, d] = dateKey.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    db[dateKey] = {
      date: dateKey,
      weekday: dt.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
      celebration: celebration || "Daily Mass",
      season: "",
      liturgicalYear: "",
      readings,
      source: "catholicgallery-dr",
    };
    ok++;
    console.log(`OK (${readings.length})`);
    await new Promise(r => setTimeout(r, 400));
  }

  const outPath = join(DATA_DIR, `readings-${year}-dr.json`);
  writeFileSync(outPath, JSON.stringify(db, null, 2), "utf8");
  console.log(`Written ${outPath}`);
  return { ok, fail };
}

async function main() {
  const years = process.argv[2] ? [parseInt(process.argv[2], 10)] : [2026, 2027];
  console.log("DR Readings Builder (Catholic Gallery)");
  let totOk = 0, totFail = 0;
  for (const y of years) {
    const r = await buildYear(y);
    totOk += r.ok; totFail += r.fail;
  }
  console.log(`\n=== TOTAL: ${totOk} ok, ${totFail} failed ===`);
}

main().catch(console.error);
