import { db } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";
import { formatPhotoUrl, deleteFromCloudinary } from "../utils/helpers.js";
import { createWorker } from "tesseract.js";
import sharp from "sharp";

/**
 * Preprocesses image buffer with Sharp to dramatically boost OCR clarity:
 * - Fixes phone EXIF rotation/skew
 * - Upscales low-res scans to optimal OCR DPI (>= 2000px)
 * - Converts to high-contrast grayscale with histogram normalization & sharpening
 */
async function preprocessForOcr(inputBuffer) {
  try {
    const meta = await sharp(inputBuffer).metadata();
    let pipeline = sharp(inputBuffer).rotate(); // auto-rotate based on EXIF

    // Upscale if under 2000px width for sharp letter recognition
    const targetWidth = Math.max(meta.width || 1200, 2000);
    if ((meta.width || 0) < 2000) {
      pipeline = pipeline.resize({ width: targetWidth, withoutEnlargement: false });
    }

    // High-contrast grayscale normalization + edge sharpening
    pipeline = pipeline
      .grayscale()
      .normalize()
      .sharpen({ sigma: 1.5, m1: 0.5, m2: 2.5 })
      .linear(1.25, -20); // darken text ink, whiten paper background

    return await pipeline.png().toBuffer();
  } catch (err) {
    logger.warn("Sharp OCR preprocessing skipped: " + err.message);
    return inputBuffer;
  }
}

/**
 * Liturgical and Swahili dictionary repair for common OCR optical misreads
 */
function repairHymnOcrTypos(text) {
  if (!text) return "";
  return text
    // Headings
    .replace(/\b(?:mw[i!l1][t!l1][i!l1]k[i!l1]o|mwitiki0|mwltlko)\b/gi, "Mwitikio")
    .replace(/\b(?:ub[e3c]t[i!l1]|u8eti|u8et!)\b/gi, "Ubeti")
    .replace(/\b(?:k[i!l1][i!l1]t[i!l1]k[i!l1]o|kiitiki0)\b/gi, "Kiitikio")
    .replace(/\b(?:ch[o0]ru[s5]|ch0ru5)\b/gi, "Chorus")
    .replace(/\b(?:v[e3]rs[e3]|v3rse)\b/gi, "Verse")
    .replace(/\b(?:r[e3]fra[i!l1]n)\b/gi, "Refrain")
    // Core liturgical terms
    .replace(/\b(?:8wana|bw4na|bwan4)\b/gi, "Bwana")
    .replace(/\b(?:mvngu|mungv|munguu)\b/gi, "Mungu")
    .replace(/\b(?:s4daka|sad4ka)\b/gi, "Sadaka")
    .replace(/\b(?:k0munyo|komuny0)\b/gi, "Komunyo")
    .replace(/\b(?:[e3]kar[i!l1]st[i!l1]|ekarlstl)\b/gi, "Ekaristi")
    .replace(/\b(?:mar[i!l1]a|marla)\b/gi, "Maria")
    .replace(/\b(?:b[i!l1]k[i!l1]ra|blkira)\b/gi, "Bikira")
    .replace(/\b(?:al[e3]luy[a4]|alelu!a|a1e1uya)\b/gi, "Aleluya")
    .replace(/\b(?:utuk[u0]fu|utukvfu|vtukufu)\b/gi, "Utukufu")
    .replace(/\b(?:shukran[i!l1]|shukranl)\b/gi, "Shukrani")
    .replace(/\b(?:mtakat[i!l1]fu|mtak4tifu)\b/gi, "Mtakatifu")
    .replace(/\b(?:mwok[o0]z[i!l1]|mw0kozi)\b/gi, "Mwokozi")
    .replace(/\b(?:yes[uv]|ycsu)\b/gi, "Yesu")
    .replace(/\b(?:kr[i!l1]st[o0]|krlsto)\b/gi, "Kristo")
    // Remove music staff lines / noise characters
    .replace(/[~^¢§©®™]/g, "")
    .replace(/^[_\-=+*#|]{3,}$/gm, "");
}

function cleanPersonName(name) {
  if (!name) return "";
  return name
    .replace(/[0-9\.:\-_=]+/g, "")
    .replace(/\b(arr|comp|mtunzi|key|solfa|doh)\b/gi, "")
    .trim();
}

function formatTitle(title) {
  if (!title) return "";
  const cleaned = title.replace(/[0-9\.:\-_=]+/g, " ").trim();
  return cleaned
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function detectCategory(text) {
  const t = text.toLowerCase();
  if (/maria|bikira|ave|mama\s*yetu|malkia|nyota\s*ya\s*bahari/i.test(t)) return "marian";
  if (/mwanzo|twende|nyumbani|ingia|tuingie|mlango|shangwe/i.test(t)) return "mwanzo";
  if (/utukufu|glory|gloria|huruma|kyrie|bwana\s*u(?:t)?u?hurumie/i.test(t)) return "utukufu";
  if (/sadaka|matoleo|mkate|divai|twakutolea|tolea|toeni/i.test(t)) return "sadaka";
  if (/komunyo|ekaristi|mwili\s*wangu|damu\s*yangu|karamu|panis|altare/i.test(t)) return "komunyo";
  if (/shukrani|asante|ahsante|tunamshukuru|mshukuruni/i.test(t)) return "shukrani";
  if (/kutoka|toka|enendeni|mwisho|amani\s*ya\s*bwana/i.test(t)) return "kutoka";
  if (/kwaresma|kwaresima|mateso|msalaba|tubu/i.test(t)) return "kwaresma";
  if (/pasaka|ufufuko|aleluya|amefufuka|kaburi/i.test(t)) return "pasaka";
  if (/noeli|krismasi|bethlehemu|mtoto\s*yesu|kuzaliwa/i.test(t)) return "noeli";
  if (/roho\s*mtakatifu|pentekoste|pentecost|parakleto/i.test(t)) return "pentecost";
  if (/thomas|akwino|aquinas|msimamizi/i.test(t)) return "patron";
  return "general";
}

function detectLanguage(text) {
  const t = text.toLowerCase();
  if (/tantum\s*ergo|pange\s*lingua|sanctus|agnus\s*dei|domine|panis\s*angelicus/i.test(t)) return "Latin";
  if (/\b(the|lord|god|jesus|praise|we|come|holy|father|glory)\b/i.test(t)) return "English";
  return "Swahili";
}

function isTonicSolfaLine(line) {
  const t = line.trim();
  if (!t) return false;
  const solfaNotePattern = /\b[drmfslt1-7][,#']?\s*[:\.\-]/i;
  const solfaMeasurePattern = /[:|]\s*[drmfslt1-7][,#']?/i;
  const hasMultipleSolfa = (t.match(/[drmfslt][,#']?[:\.\-]/gi) || []).length >= 2;
  return hasMultipleSolfa || (t.includes('|') && solfaNotePattern.test(t)) || solfaMeasurePattern.test(t);
}

function extractSongTitle(lines) {
  for (let i = 0; i < Math.min(lines.length, 8); i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Skip technical music direction lines
    if (/^(key|doh|tempo|moderato|andante|allegro|\d+\/\d+|mtunzi|composer|comp|arr|arranged)/i.test(line)) continue;
    if (isTonicSolfaLine(line)) continue;
    if (/^(chorus|mwitikio|kiitikio|verse|ubeti|stanza)/i.test(line)) break;

    // Strip track numbers
    const clean = line
      .replace(/^(?:song\s*\d+|wimbo\s+wa\s+[a-z]+|no\.?\s*\d+|\d+[\.\)\-:]\s*)/i, "")
      .replace(/[_\-*~#=]+/g, "")
      .trim();

    if (clean.length >= 3 && clean.length <= 70) {
      return formatTitle(clean);
    }
  }
  return "";
}

function separateLyricsAndSolfa(lines, songTitle) {
  const lyricsLines = [];
  const solfaLines = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Skip technical headers
    if (/^(key|doh|tempo|moderato|andante|allegro|\d+\/\d+|mtunzi|composer|comp|arr|arranged)\b/i.test(trimmed)) continue;

    if (songTitle && trimmed.toLowerCase().includes(songTitle.toLowerCase())) continue;

    if (isTonicSolfaLine(trimmed)) {
      solfaLines.push(trimmed);
    } else {
      lyricsLines.push(trimmed);
    }
  }

  const formattedLyrics = [];
  for (let i = 0; i < lyricsLines.length; i++) {
    const l = lyricsLines[i];
    const isMarker = /^(chorus|kwaya|mwitikio|kiitikio|refrain|verse|ubeti|beti|\d+[\.:\)])/i.test(l);
    if (isMarker && formattedLyrics.length > 0) {
      formattedLyrics.push("");
    }
    formattedLyrics.push(l);
  }

  return {
    lyrics: formattedLyrics.join("\n"),
    solfa: solfaLines.join("\n"),
  };
}

export function splitIntoSongSections(rawText) {
  if (!rawText) return [];

  const dividerRegex = /(?:\n\s*[-=_*]{3,}\s*\n|\n\s*\n\s*(?:song\s*[2-9]|wimbo\s*wa\s*(?:pili|tatu|nne)|\b(?:ii|iii|iv)\b|[2-9]\.\s+[A-Za-z]))/i;
  const rawChunks = rawText.split(dividerRegex).map(c => c.trim()).filter(c => c.length > 20);
  if (rawChunks.length > 1) {
    return rawChunks;
  }

  // Fallback: check multiple Key declarations
  const keyMatches = [...rawText.matchAll(/(?:key|doh\s*(?:is|ni|ya))\s*[:=]?\s*[A-G]/gi)];
  if (keyMatches.length >= 2) {
    const splitIndex = keyMatches[1].index;
    const part1 = rawText.slice(0, splitIndex).trim();
    const part2 = rawText.slice(splitIndex).trim();
    if (part1.length > 30 && part2.length > 30) {
      return [part1, part2];
    }
  }

  return [rawText.trim()];
}

export function parseSmartSongSheet(rawText) {
  if (!rawText || !rawText.trim()) return [];

  const rawSections = splitIntoSongSections(rawText);
  const parsedSongs = [];

  for (let idx = 0; idx < rawSections.length; idx++) {
    const section = rawSections[idx];
    const lines = section.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    // 1. Key Signature
    let keySignature = "";
    const keyMatch = section.match(/(?:key|doh\s*(?:is|ni|ya))\s*[:=]?\s*([A-G][#b]?(?:\s*(?:major|minor|maj|min|m))?)/i);
    if (keyMatch) {
      keySignature = keyMatch[1].trim();
    } else {
      const altKey = section.match(/\b([A-G][#b]?)\s*(?:major|minor|maj|min)\b/i);
      if (altKey) keySignature = altKey[0].trim();
    }

    // 2. Time Signature
    let timeSignature = "";
    const timeMatch = section.match(/\b([2346]\/[248])\b/);
    if (timeMatch) timeSignature = timeMatch[1].trim();

    // 3. Tempo
    let tempo = "";
    const tempoMatch = section.match(/\b(allegro|andante|moderato|largo|vivace|presto|adagio|cantabile|kwa kasi|taratibu|wastani)\b/i);
    if (tempoMatch) {
      tempo = tempoMatch[1].charAt(0).toUpperCase() + tempoMatch[1].slice(1).toLowerCase();
    }

    // 4. Composer
    let composer = "";
    const composerMatch = section.match(/(?:mtunzi|composer|comp|arr|arranged\s+by|words\s*(?:&|and)\s*music\s+by|by)\s*[:=]?\s*([^\n\r,;:]{3,45})/i);
    if (composerMatch) {
      composer = cleanPersonName(composerMatch[1]);
    } else {
      const nameMatch = section.match(/\b(Fr\.\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?|Rev\.\s+[A-Z][a-z]+|Bernard\s+Mukasa|B\.\s*Mukasa|Jude\s+Njoroge|J\.\s*Njoroge)\b/i);
      if (nameMatch) composer = nameMatch[0].trim();
    }

    // 5. Title
    let title = extractSongTitle(lines);
    if (!title) {
      title = parsedSongs.length > 0 ? `Song ${idx + 1}` : "";
    }

    // 6. Category & Language
    const category = detectCategory(section + " " + title);
    const language = detectLanguage(section);

    // 7. Lyrics & Solfa
    const { lyrics, solfa } = separateLyricsAndSolfa(lines, title);

    parsedSongs.push({
      title: title || (parsedSongs.length === 0 ? "Extracted Song" : `Song ${idx + 1}`),
      category,
      composer,
      key_signature: keySignature,
      time_signature: timeSignature || "4/4",
      tempo: tempo || "Moderate",
      language,
      lyrics_text: lyrics || section.trim(),
      solfa_notation: solfa,
      raw_section: section,
    });
  }

  return parsedSongs;
}

/**
 * GET /choir-songs — Public: Fetch list of choir songs with filtering, search, pagination
 */
export const getSongs = async (req, res) => {
  try {
    const moduleId = (req.query.module_id || "choir").toLowerCase();
    const category = req.query.category || "all";
    const language = req.query.language || "all";
    const keySignature = req.query.key_signature;
    const search = req.query.search ? String(req.query.search).trim() : "";
    const sortBy = req.query.sortBy || "newest"; // 'newest', 'title_asc', 'views', 'composer'
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "24", 10)));
    const offset = (page - 1) * limit;

    const conditions = ["module_id = $1"];
    const values = [moduleId];
    let paramIndex = 2;

    if (category && category !== "all") {
      conditions.push(`LOWER(category) = $${paramIndex}`);
      values.push(category.toLowerCase());
      paramIndex++;
    }

    if (language && language !== "all") {
      conditions.push(`LOWER(language) = $${paramIndex}`);
      values.push(language.toLowerCase());
      paramIndex++;
    }

    if (keySignature && keySignature !== "all") {
      conditions.push(`LOWER(key_signature) = $${paramIndex}`);
      values.push(keySignature.toLowerCase());
      paramIndex++;
    }

    if (search) {
      conditions.push(`(
        title ILIKE $${paramIndex} OR 
        composer ILIKE $${paramIndex} OR 
        coalesce(lyrics_text, '') ILIKE $${paramIndex} OR
        coalesce(solfa_notation, '') ILIKE $${paramIndex}
      )`);
      values.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = conditions.join(" AND ");

    // Sorting
    let orderClause = "created_at DESC";
    if (sortBy === "title_asc") orderClause = "title ASC";
    else if (sortBy === "title_desc") orderClause = "title DESC";
    else if (sortBy === "views") orderClause = "views_count DESC, created_at DESC";
    else if (sortBy === "composer") orderClause = "composer ASC NULLS LAST, title ASC";

    // Count query
    const countQuery = `SELECT COUNT(*) AS total FROM choir_songs WHERE ${whereClause}`;
    const countResult = await db.query(countQuery, values);
    const total = parseInt(countResult.rows[0]?.total || "0", 10);

    // Data query
    const dataQuery = `
      SELECT 
        id, module_id, title, category, composer, key_signature, time_signature, 
        tempo, solfa_notation, lyrics_text, image_url, additional_images, audio_url, 
        language, tags, views_count, created_by, created_at, updated_at
      FROM choir_songs
      WHERE ${whereClause}
      ORDER BY ${orderClause}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    const dataValues = [...values, limit, offset];
    const result = await db.query(dataQuery, dataValues);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    logger.error("Error fetching choir songs: " + error.message, { stack: error.stack });
    res.status(500).json({ success: false, error: "Failed to fetch songs" });
  }
};

/**
 * GET /choir-songs/stats — Public: Get category breakdown & total stats
 */
export const getCategoriesAndStats = async (req, res) => {
  try {
    const moduleId = (req.query.module_id || "choir").toLowerCase();

    // Group by category counts
    const categoryResult = await db.query(
      `SELECT category, COUNT(*) as count 
       FROM choir_songs 
       WHERE module_id = $1 
       GROUP BY category 
       ORDER BY count DESC`,
      [moduleId]
    );

    // Group by language counts
    const languageResult = await db.query(
      `SELECT language, COUNT(*) as count 
       FROM choir_songs 
       WHERE module_id = $1 
       GROUP BY language 
       ORDER BY count DESC`,
      [moduleId]
    );

    // Total songs
    const totalResult = await db.query(
      `SELECT COUNT(*) as total, SUM(views_count) as total_views 
       FROM choir_songs 
       WHERE module_id = $1`,
      [moduleId]
    );

    // Top 5 most viewed songs
    const popularResult = await db.query(
      `SELECT id, title, category, composer, key_signature, views_count, image_url
       FROM choir_songs 
       WHERE module_id = $1 
       ORDER BY views_count DESC 
       LIMIT 5`,
      [moduleId]
    );

    res.json({
      success: true,
      total: parseInt(totalResult.rows[0]?.total || "0", 10),
      totalViews: parseInt(totalResult.rows[0]?.total_views || "0", 10),
      categories: categoryResult.rows,
      languages: languageResult.rows,
      popularSongs: popularResult.rows,
    });
  } catch (error) {
    logger.error("Error fetching song stats: " + error.message);
    res.status(500).json({ success: false, error: "Failed to fetch song statistics" });
  }
};

/**
 * GET /choir-songs/:id — Public: Get a single song by ID & increment view count
 */
export const getSongById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT * FROM choir_songs WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Song not found" });
    }

    // Increment view count asynchronously
    db.query(`UPDATE choir_songs SET views_count = views_count + 1 WHERE id = $1`, [id]).catch(err =>
      logger.warn("Could not increment song view: " + err.message)
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    logger.error("Error fetching song by ID: " + error.message);
    res.status(500).json({ success: false, error: "Failed to fetch song" });
  }
};

/**
 * POST /choir-songs/ocr-extract — Admin: In-memory Smart OCR extraction of lyrics from song sheet
 */
export const extractLyricsOcr = async (req, res) => {
  let worker = null;
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ success: false, error: "Image file is required for OCR extraction" });
    }

    logger.info(`Starting in-memory high-accuracy OCR extraction for image size: ${req.file.buffer.length} bytes`);

    // Step 1: High-clarity image preprocessing via Sharp (rotation, upscale, contrast stretch, noise reduction)
    const preprocessedBuffer = await preprocessForOcr(req.file.buffer);

    // Step 2: Initialize Tesseract worker with dual English + Swahili recognition models
    worker = await createWorker(['eng', 'swa']);
    await worker.setParameters({
      tessedit_pageseg_mode: '3',
    });
    
    // Step 3: Run recognition on enhanced image buffer
    const ret = await worker.recognize(preprocessedBuffer);
    let rawText = ret.data?.text || "";

    // Fallback pass: if thresholded text is too short, try raw buffer
    if (rawText.trim().length < 15 && req.file.buffer.length > 0) {
      const fallbackRet = await worker.recognize(req.file.buffer);
      if ((fallbackRet.data?.text || "").trim().length > rawText.trim().length) {
        rawText = fallbackRet.data?.text || "";
      }
    }

    // Step 4: Polish Swahili/liturgical terms and repair OCR letter swaps
    const cleanedRawText = repairHymnOcrTypos(rawText);

    // Step 5: Smart multi-song & metadata extraction
    const parsedSongs = parseSmartSongSheet(cleanedRawText);
    const firstSong = parsedSongs[0] || null;

    logger.info(`Smart OCR completed: raw text length = ${cleanedRawText.length}, songs found = ${parsedSongs.length}, confidence = ${ret.data?.confidence || 0}`);

    if (parsedSongs.length === 0 && !cleanedRawText.trim()) {
      return res.json({
        success: true,
        count: 0,
        songs: [],
        extractedLyrics: "",
        rawText: "",
        guessedTitle: "",
        confidence: 0,
        message: "No legible text could be recognized automatically. You can type or paste the lyrics into the editor below."
      });
    }

    res.json({
      success: true,
      count: parsedSongs.length,
      songs: parsedSongs,
      firstSong: firstSong,
      extractedLyrics: firstSong?.lyrics_text || cleanedRawText.trim(),
      guessedTitle: firstSong?.title || "",
      rawText: cleanedRawText,
      confidence: ret.data?.confidence || 0,
    });
  } catch (error) {
    logger.error("OCR Extraction failed: " + error.message, { stack: error.stack });
    res.status(500).json({ 
      success: false, 
      error: "OCR text extraction could not complete (" + (error.message || "Unknown error") + "). You can type or paste the lyrics manually." 
    });
  } finally {
    if (worker) {
      await worker.terminate().catch(() => {});
    }
  }
};

/**
 * POST /choir-songs — Admin: Create a new song record
 */
export const createSong = async (req, res) => {
  try {
    const {
      module_id = "choir",
      title,
      category,
      composer,
      key_signature,
      time_signature,
      tempo,
      solfa_notation,
      lyrics_text,
      audio_url,
      language = "Swahili",
      tags,
    } = req.body;

    if (!title || !category) {
      return res.status(400).json({ success: false, error: "Title and Category are required" });
    }

    // Image: either uploaded file via Cloudinary or provided image_url
    let imageUrl = req.body.image_url || "";
    let cloudinaryPublicId = null;

    if (req.file) {
      imageUrl = formatPhotoUrl(req.file);
      cloudinaryPublicId = req.file.filename || null;
    }

    if (!imageUrl) {
      return res.status(400).json({ success: false, error: "Sheet music or song image is required" });
    }

    const tagsArray = Array.isArray(tags) 
      ? tags 
      : (typeof tags === "string" ? tags.split(",").map(t => t.trim()).filter(Boolean) : []);

    const createdBy = req.user?.name || req.user?.username || "Admin";

    const insertQuery = `
      INSERT INTO choir_songs (
        module_id, title, category, composer, key_signature, time_signature, 
        tempo, solfa_notation, lyrics_text, image_url, cloudinary_public_id, 
        audio_url, language, tags, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;

    const values = [
      module_id.toLowerCase(),
      title.trim(),
      category.toLowerCase().trim(),
      composer ? composer.trim() : null,
      key_signature ? key_signature.trim() : null,
      time_signature ? time_signature.trim() : null,
      tempo ? tempo.trim() : null,
      solfa_notation ? solfa_notation.trim() : null,
      lyrics_text ? lyrics_text.trim() : null,
      imageUrl,
      cloudinaryPublicId,
      audio_url ? audio_url.trim() : null,
      language ? language.trim() : "Swahili",
      tagsArray,
      createdBy
    ];

    const result = await db.query(insertQuery, values);

    logger.info(`Choir song created: "${title}" (ID: ${result.rows[0].id})`);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    logger.error("Error creating choir song: " + error.message, { stack: error.stack });
    res.status(500).json({ success: false, error: "Failed to create song" });
  }
};

/**
 * PUT /choir-songs/:id — Admin: Update an existing song
 */
export const updateSong = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      category,
      composer,
      key_signature,
      time_signature,
      tempo,
      solfa_notation,
      lyrics_text,
      audio_url,
      language,
      tags,
    } = req.body;

    // Check existing song
    const existing = await db.query(`SELECT * FROM choir_songs WHERE id = $1`, [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Song not found" });
    }

    const song = existing.rows[0];
    let imageUrl = song.image_url;
    let cloudinaryPublicId = song.cloudinary_public_id;

    // If new file uploaded, delete old Cloudinary image and update
    if (req.file) {
      if (imageUrl && imageUrl.includes("cloudinary.com")) {
        await deleteFromCloudinary(imageUrl);
      }
      imageUrl = formatPhotoUrl(req.file);
      cloudinaryPublicId = req.file.filename || null;
    } else if (req.body.image_url && req.body.image_url !== song.image_url) {
      imageUrl = req.body.image_url;
    }

    const tagsArray = tags !== undefined
      ? (Array.isArray(tags) ? tags : (typeof tags === "string" ? tags.split(",").map(t => t.trim()).filter(Boolean) : []))
      : song.tags;

    const updateQuery = `
      UPDATE choir_songs SET
        title = COALESCE($1, title),
        category = COALESCE($2, category),
        composer = $3,
        key_signature = $4,
        time_signature = $5,
        tempo = $6,
        solfa_notation = $7,
        lyrics_text = $8,
        image_url = $9,
        cloudinary_public_id = $10,
        audio_url = $11,
        language = COALESCE($12, language),
        tags = $13,
        updated_at = NOW()
      WHERE id = $14
      RETURNING *
    `;

    const values = [
      title ? title.trim() : null,
      category ? category.toLowerCase().trim() : null,
      composer !== undefined ? (composer ? composer.trim() : null) : song.composer,
      key_signature !== undefined ? (key_signature ? key_signature.trim() : null) : song.key_signature,
      time_signature !== undefined ? (time_signature ? time_signature.trim() : null) : song.time_signature,
      tempo !== undefined ? (tempo ? tempo.trim() : null) : song.tempo,
      solfa_notation !== undefined ? (solfa_notation ? solfa_notation.trim() : null) : song.solfa_notation,
      lyrics_text !== undefined ? (lyrics_text ? lyrics_text.trim() : null) : song.lyrics_text,
      imageUrl,
      cloudinaryPublicId,
      audio_url !== undefined ? (audio_url ? audio_url.trim() : null) : song.audio_url,
      language ? language.trim() : null,
      tagsArray,
      id
    ];

    const result = await db.query(updateQuery, values);

    logger.info(`Choir song updated: "${result.rows[0].title}" (ID: ${id})`);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    logger.error("Error updating choir song: " + error.message, { stack: error.stack });
    res.status(500).json({ success: false, error: "Failed to update song" });
  }
};

/**
 * DELETE /choir-songs/:id — Admin: Delete a song and its Cloudinary photo
 */
export const deleteSong = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await db.query(`SELECT * FROM choir_songs WHERE id = $1`, [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Song not found" });
    }

    const song = existing.rows[0];

    // Delete image from Cloudinary if hosted there
    if (song.image_url && song.image_url.includes("cloudinary.com")) {
      await deleteFromCloudinary(song.image_url);
    }

    await db.query(`DELETE FROM choir_songs WHERE id = $1`, [id]);

    logger.info(`Choir song deleted: "${song.title}" (ID: ${id})`);
    res.json({ success: true, message: "Song deleted successfully" });
  } catch (error) {
    logger.error("Error deleting choir song: " + error.message);
    res.status(500).json({ success: false, error: "Failed to delete song" });
  }
};
