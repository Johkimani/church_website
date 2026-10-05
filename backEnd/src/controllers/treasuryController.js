import multer from "multer";
import { createWorker } from "tesseract.js";
import logger from "../logger/winston.js";

// Dedicated in-memory upload (MUST NOT go to Cloudinary — we need the raw pixels for OCR)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 }, // 12MB
});

const DATE_PATTERNS = [
  /(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/,             // 2024-08-30
  /(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/,           // 30/08/2024 or 08/30/2024
  /(\d{1,2})[-/.](\d{1,2})/,                         // 30/08 or 08/30
  /(\d{1,2})[-/.](\d{1,2})[-/.](\d{1,2})/,           // 30-08-24
];

// Full numbers (ints or decimals, optional thousands separators) — never truncates.
const AMOUNT_RE = /\d[\d,]*\.\d{1,2}|\d[\d,]+|\d/g;

function normalizeDate(year, month, day) {
  const pad = (n) => String(n).padStart(2, "0");
  const y = String(year).length === 2 ? (Number(year) > 70 ? `19${year}` : `20${year}`) : String(year);
  return `${y}-${pad(month)}-${pad(day)}`;
}

/**
 * Best-effort OCR parser for a hand-written / printed treasurer page.
 * Splits the page into candidate rows: { date, description, income, expense }.
 * Nothing is dropped — every non-empty line becomes a candidate so the
 * treasurer can verify before saving (guarantees no records are missed).
 */
function parseCandidates(ocrText, fallbackYear) {
  const lines = ocrText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const candidates = [];
  const tokens = (s) => (s.match(/\S+/g) || []);

  for (const raw of lines) {
    let rest = raw;
    let date = "";

    // Try to pull a date off the front of the line
    for (const re of DATE_PATTERNS) {
      const m = rest.match(re);
      if (m) {
        const y = m[3] !== undefined ? m[3] : fallbackYear;
        const month = m[2];
        const day = m[1];
        if (Number(month) >= 1 && Number(month) <= 12 && Number(day) >= 1 && Number(day) <= 31) {
          date = normalizeDate(y, month, day);
          rest = rest.replace(m[0], " ").trim();
          break;
        }
      }
    }

    // Pull amounts off the tail: one -> income; two -> income + expense
    const matches = rest.match(AMOUNT_RE) || [];
    const nums = matches
      .map((n) => Number(String(n).replace(/,/g, "")))
      .filter((n) => !Number.isNaN(n) && n > 0);

    let income = "";
    let expense = "";
    const dropAmounts = (line, amts) => {
      let out = line;
      for (const a of amts) {
        const esc = String(a).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const re = new RegExp(`\\b${esc}\\b`);
        out = out.replace(re, " ").trim();
      }
      return out;
    };

    if (nums.length === 1) {
      // A single trailing amount. Prefer income unless there's an explicit
      // expense hint ("exp", "paid", "spent", "out", minus sign).
      const hint = /[-(]?\s*(exp|paid|spent|out|withdraw|debit|dr)\b/i.test(rest) || /-\s*\d/.test(rest);
      if (hint) expense = String(nums[0]);
      else income = String(nums[0]);
      rest = dropAmounts(rest, [nums[0]]);
    } else if (nums.length >= 2) {
      expense = String(nums[nums.length - 1]);
      income = String(nums[nums.length - 2]);
      rest = dropAmounts(rest, [nums[nums.length - 2], nums[nums.length - 1]]);
    }

    const description = tokens(rest).slice(0, 6).join(" ") || "Record";
    candidates.push({ date, description, income, expense, raw });
  }

  return candidates;
}

export const scanTreasuryImage = [
  upload.single("file"),
  async (req, res) => {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: "No image received" });
    }

    let worker = null;
    try {
      const fallbackYear = new Date().getFullYear();

      worker = await createWorker("eng", 1, { logger: () => {} });
      await worker.setParameters({
        tessedit_pageseg_mode: "6", // assume a single uniformly spaced block of text (good for records)
        preserve_interword_spaces: "1",
      });

      const { data } = await worker.recognize(req.file.buffer);
      const text = (data.text || "").trim();
      if (!text) {
        return res.status(422).json({ error: "Could not read any text from this image. Try a clearer/straighter photo." });
      }

      const candidates = parseCandidates(text, fallbackYear);

      res.json({ text, candidates, detectedTypes: data.blocks });
    } catch (error) {
      logger.error(`OCR error: ${error.message}`);
      res.status(500).json({ error: `OCR failed: ${error.message}` });
    } finally {
      if (worker) {
        try { await worker.terminate(); } catch (_) { /* noop */ }
      }
    }
  },
];
