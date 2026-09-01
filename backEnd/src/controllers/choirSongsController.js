import { db } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";
import { formatPhotoUrl, deleteFromCloudinary } from "../utils/helpers.js";
import { createWorker } from "tesseract.js";
import sharp from "sharp";
import axios from "axios";
import {
  detectHymnLanguage,
  repairMultilingualOcrText,
  applyDynamicCorrections,
  learnOcrCorrections,
} from "../utils/hymnDictionary.js";

/**
 * Enhanced Sharp preprocessing pipeline:
 * - Auto-rotates based on phone camera EXIF orientation
 * - Upscales low-res scans to optimal OCR resolution (>= 2200px)
 * - Contrast stretching, grayscale normalization & edge sharpening
 * - Suppresses musical staff line residues that interfere with lyric text
 */
async function preprocessForOcr(inputBuffer) {
  try {
    const meta = await sharp(inputBuffer).metadata();
    let pipeline = sharp(inputBuffer).rotate(); // auto-rotate based on EXIF

    // Upscale if under 2200px width for crystal clear character recognition
    const targetWidth = Math.max(meta.width || 1200, 2200);
    if ((meta.width || 0) < 2200) {
      pipeline = pipeline.resize({ width: targetWidth, withoutEnlargement: false });
    }

    // High-contrast grayscale normalization + edge sharpening
    pipeline = pipeline
      .grayscale()
      .normalize()
      .sharpen({ sigma: 1.6, m1: 0.7, m2: 2.8 })
      .linear(1.3, -25); // darken black ink, whiten paper background

    return await pipeline.png().toBuffer();
  } catch (err) {
    logger.warn("Sharp OCR preprocessing skipped: " + err.message);
    return inputBuffer;
  }
}

/**
 * Optional Google Cloud Vision REST client (invoked when GOOGLE_VISION_API_KEY is configured)
 */
async function runGoogleVisionOcr(imageBuffer) {
  const apiKey = process.env.GOOGLE_VISION_API_KEY;
  if (!apiKey) return null;

  try {
    const base64Image = imageBuffer.toString("base64");
    const response = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        requests: [
          {
            image: { content: base64Image },
            features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
          },
        ],
      },
      { timeout: 10000 }
    );

    const fullTextAnnotation = response.data?.responses?.[0]?.fullTextAnnotation;
    if (fullTextAnnotation?.text) {
      logger.info("Google Cloud Vision OCR extraction succeeded.");
      return {
        text: fullTextAnnotation.text,
        confidence: 95,
        engine: "google-vision",
      };
    }
    return null;
  } catch (err) {
    logger.warn("Google Vision OCR fallback failed: " + err.message);
    return null;
  }
}

function cleanPersonName(name) {
  if (!name) return "";
  return name
    .replace(/[0-9\.:\-_=]+/g, "")
    .replace(/\b(arr|comp|mtunzi|jandiko|muhiki|key|solfa|doh)\b/gi, "")
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
  if (/maria|bikira|ave|mama\s*yetu|malkia|nyota\s*ya\s*bahari|mariam/i.test(t)) return "marian";
  if (/mwanzo|twende|nyumbani|ingia|tuingie|mlango|shangwe|donjo|entrance/i.test(t)) return "mwanzo";
  if (/utukufu|glory|gloria|huruma|kyrie|bwana\s*u(?:t)?u?hurumie|duong|ngwono/i.test(t)) return "utukufu";
  if (/sadaka|matoleo|mkate|divai|twakutolea|tolea|toeni|misango|offertory|igongona|nthembo/i.test(t)) return "sadaka";
  if (/komunyo|ekaristi|mwili\s*wangu|damu\s*yangu|karamu|panis|altare|remb|ringo|communion/i.test(t)) return "komunyo";
  if (/shukrani|asante|ahsante|tunamshukuru|mshukuruni|erokamino|thanksgiving|ngatho|muvea/i.test(t)) return "shukrani";
  if (/kutoka|toka|enendeni|mwisho|amani\s*ya\s*bwana|recessional/i.test(t)) return "kutoka";
  if (/kwaresma|kwaresima|mateso|msalaba|tubu|sand|lent/i.test(t)) return "kwaresma";
  if (/pasaka|ufufuko|aleluya|amefufuka|kaburi|chier|easter/i.test(t)) return "pasaka";
  if (/noeli|krismasi|bethlehemu|mtoto\s*yesu|kuzaliwa|christmas/i.test(t)) return "noeli";
  if (/roho\s*mtakatifu|pentekoste|pentecost|parakleto|veva/i.test(t)) return "pentecost";
  if (/thomas|akwino|aquinas|msimamizi|patron/i.test(t)) return "patron";
  return "general";
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
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Skip technical music direction lines
    if (/^(key|doh|tempo|moderato|andante|allegro|\d+\/\d+|mtunzi|composer|comp|arr|arranged)/i.test(line)) continue;
    if (isTonicSolfaLine(line)) continue;
    if (/^(chorus|mwitikio|kiitikio|verse|ubeti|stanza|wer|rwimbo)/i.test(line)) break;

    // Strip track numbers
    const clean = line
      .replace(/^(?:song\s*\d+|wimbo\s+wa\s+[a-z]+|no\.?\s*\d+|\d+[\.\)\-:]\s*)/i, "")
      .replace(/[_\-*~#=]+/g, "")
      .trim();

    if (clean.length >= 3 && clean.length <= 80) {
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

    if (songTitle && trimmed.toLowerCase().includes(songTitle.toLowerCase()) && trimmed.length <= songTitle.length + 5) continue;

    if (isTonicSolfaLine(trimmed)) {
      solfaLines.push(trimmed);
    } else {
      lyricsLines.push(trimmed);
    }
  }

  const formattedLyrics = [];
  for (let i = 0; i < lyricsLines.length; i++) {
    const l = lyricsLines[i];
    const isMarker = /^(chorus|kwaya|mwitikio|kiitikio|refrain|verse|ubeti|beti|wer|rwimbo|\d+[\.:\)])/i.test(l);
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
    const composerMatch = section.match(/(?:mtunzi|composer|comp|arr|arranged\s+by|words\s*(?:&|and)\s*music\s+by|by|jandiko)\s*[:=]?\s*([^\n\r,;:]{3,45})/i);
    if (composerMatch) {
      composer = cleanPersonName(composerMatch[1]);
    } else {
      const nameMatch = section.match(/\b(Fr\.\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?|Rev\.\s+[A-Z][a-z]+|Bernard\s+Mukasa|B\.\s*Mukasa|Jude\s+Njoroge|J\.\s*Njoroge|G\.\s*Ndung'u)\b/i);
      if (nameMatch) composer = nameMatch[0].trim();
    }

    // 5. Title
    let title = extractSongTitle(lines);
    if (!title) {
      title = parsedSongs.length > 0 ? `Song ${idx + 1}` : "";
    }

    // 6. Language & Category
    const language = detectHymnLanguage(section);
    const category = detectCategory(section + " " + title);

    // 7. Lyrics & Solfa separation
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
    const sortBy = req.query.sortBy || "newest";
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit || "50", 10)));
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
        tempo, solfa_notation, lyrics_text, raw_ocr_text, confidence_score,
        image_url, additional_images, audio_url, language, tags, views_count, 
        created_by, created_at, updated_at
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
 * GET /choir-songs/stats — Public: Get category & language breakdown & total stats
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
 * POST /choir-songs/ocr-extract — Admin: Hybrid Intelligent OCR extraction
 */
export const extractLyricsOcr = async (req, res) => {
  let worker = null;
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ success: false, error: "Image file is required for OCR extraction" });
    }

    logger.info(`Starting hybrid multilingual OCR extraction for image size: ${req.file.buffer.length} bytes`);

    // Step 1: High-clarity Sharp image preprocessing
    const preprocessedBuffer = await preprocessForOcr(req.file.buffer);

    let rawText = "";
    let confidence = 0;
    let engineUsed = "tesseract";

    // Step 2: Check for Google Cloud Vision API fallback if configured
    const visionResult = await runGoogleVisionOcr(req.file.buffer);
    if (visionResult && visionResult.text) {
      rawText = visionResult.text;
      confidence = visionResult.confidence;
      engineUsed = visionResult.engine;
    } else {
      // Step 3: Run Tesseract.js locally with English + Swahili models
      worker = await createWorker(['eng', 'swa']);
      await worker.setParameters({
        tessedit_pageseg_mode: '3',
      });

      const ret = await worker.recognize(preprocessedBuffer);
      rawText = ret.data?.text || "";
      confidence = ret.data?.confidence || 0;

      // Retry on raw buffer if preprocessed yielded too few characters
      if (rawText.trim().length < 20 && req.file.buffer.length > 0) {
        const fallbackRet = await worker.recognize(req.file.buffer);
        if ((fallbackRet.data?.text || "").trim().length > rawText.trim().length) {
          rawText = fallbackRet.data?.text || "";
          confidence = fallbackRet.data?.confidence || confidence;
        }
      }
    }

    // Step 4: Detect Language & apply language-specific liturgical dictionaries
    const detectedLang = detectHymnLanguage(rawText);
    let cleanedRawText = repairMultilingualOcrText(rawText, detectedLang);

    // Step 5: Apply dynamic learned corrections from database
    cleanedRawText = await applyDynamicCorrections(cleanedRawText, detectedLang, db);

    // Step 6: Parse multi-song layouts and extract musical metadata
    const parsedSongs = parseSmartSongSheet(cleanedRawText);
    const firstSong = parsedSongs[0] || null;

    logger.info(`Smart OCR completed via [${engineUsed}]: detected language = ${detectedLang}, songs found = ${parsedSongs.length}, confidence = ${confidence}%`);

    if (parsedSongs.length === 0 && !cleanedRawText.trim()) {
      return res.json({
        success: true,
        count: 0,
        songs: [],
        extractedLyrics: "",
        rawText: "",
        guessedTitle: "",
        confidence: 0,
        language: detectedLang,
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
      language: detectedLang,
      rawText: cleanedRawText,
      confidence: Math.round(confidence),
      engine: engineUsed
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
 * POST /choir-songs — Admin: Create a new song record & feed correction learner
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
      raw_ocr_text,
      confidence_score,
      audio_url,
      language = "Swahili",
      tags,
    } = req.body;

    if (!title || !category) {
      return res.status(400).json({ success: false, error: "Title and Category are required" });
    }

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
        tempo, solfa_notation, lyrics_text, raw_ocr_text, confidence_score,
        image_url, cloudinary_public_id, audio_url, language, tags, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
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
      raw_ocr_text ? raw_ocr_text.trim() : null,
      confidence_score ? Number(confidence_score) : null,
      imageUrl,
      cloudinaryPublicId,
      audio_url ? audio_url.trim() : null,
      language ? language.trim() : "Swahili",
      tagsArray,
      createdBy
    ];

    const result = await db.query(insertQuery, values);

    // Asynchronously learn OCR corrections to build the adaptive dictionary
    if (raw_ocr_text && lyrics_text) {
      learnOcrCorrections(raw_ocr_text, lyrics_text, language || "Swahili", db).catch(err =>
        logger.warn("Correction learning non-fatal error: " + err.message)
      );
    }

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
      raw_ocr_text,
      confidence_score,
      audio_url,
      language,
      tags,
    } = req.body;

    const existing = await db.query(`SELECT * FROM choir_songs WHERE id = $1`, [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Song not found" });
    }

    const song = existing.rows[0];
    let imageUrl = song.image_url;
    let cloudinaryPublicId = song.cloudinary_public_id;

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
        raw_ocr_text = COALESCE($9, raw_ocr_text),
        confidence_score = COALESCE($10, confidence_score),
        image_url = $11,
        cloudinary_public_id = $12,
        audio_url = $13,
        language = COALESCE($14, language),
        tags = $15,
        updated_at = NOW()
      WHERE id = $16
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
      raw_ocr_text ? raw_ocr_text.trim() : null,
      confidence_score ? Number(confidence_score) : null,
      imageUrl,
      cloudinaryPublicId,
      audio_url !== undefined ? (audio_url ? audio_url.trim() : null) : song.audio_url,
      language ? language.trim() : null,
      tagsArray,
      id
    ];

    const result = await db.query(updateQuery, values);

    // Feed correction learner
    if (lyrics_text && (raw_ocr_text || song.raw_ocr_text)) {
      learnOcrCorrections(raw_ocr_text || song.raw_ocr_text, lyrics_text, language || song.language || "Swahili", db).catch(() => {});
    }

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

/**
 * GET /choir-songs/programmes — Public: Get synced Sunday / Friday / Feasts Mass Programmes
 */
export const getProgrammes = async (req, res) => {
  try {
    const moduleId = (req.query.module_id || "choir").toLowerCase();
    const programType = req.query.program_type; // 'sunday', 'friday', or all

    let query = `
      SELECT 
        p.id as programme_item_id, p.program_type, p.position, p.service_role, p.notes,
        s.*
      FROM choir_song_programmes p
      JOIN choir_songs s ON p.song_id = s.id
      WHERE p.module_id = $1
    `;
    const params = [moduleId];

    if (programType && programType !== "all") {
      query += ` AND p.program_type = $2`;
      params.push(programType);
    }

    query += ` ORDER BY p.position ASC, p.created_at ASC`;

    const result = await db.query(query, params);

    // Group by program_type
    const programmes = {
      sunday: [],
      friday: [],
      special: []
    };

    result.rows.forEach(row => {
      const type = row.program_type || 'sunday';
      if (!programmes[type]) programmes[type] = [];
      programmes[type].push(row);
    });

    res.json({
      success: true,
      data: result.rows,
      programmes,
    });
  } catch (error) {
    logger.error("Error fetching choir programmes: " + error.message);
    res.status(500).json({ success: false, error: "Failed to fetch programmes" });
  }
};

/**
 * POST /choir-songs/programmes/toggle — Toggle song into a Mass programme (Sunday/Friday)
 */
export const toggleSongInProgramme = async (req, res) => {
  try {
    const { module_id = "choir", program_type = "sunday", song_id, service_role, notes } = req.body;

    if (!song_id) {
      return res.status(400).json({ success: false, error: "song_id is required" });
    }

    const addedBy = req.user?.name || req.user?.username || "Chorister";

    // Check if song is already in programme
    const existing = await db.query(
      `SELECT * FROM choir_song_programmes WHERE module_id = $1 AND program_type = $2 AND song_id = $3`,
      [module_id.toLowerCase(), program_type.toLowerCase(), song_id]
    );

    if (existing.rows.length > 0) {
      // Remove
      await db.query(
        `DELETE FROM choir_song_programmes WHERE id = $1`,
        [existing.rows[0].id]
      );
      return res.json({ success: true, action: "removed", message: "Removed from programme" });
    } else {
      // Add to programme
      const maxPos = await db.query(
        `SELECT COALESCE(MAX(position), 0) + 1 as next_pos FROM choir_song_programmes WHERE module_id = $1 AND program_type = $2`,
        [module_id.toLowerCase(), program_type.toLowerCase()]
      );
      const nextPos = maxPos.rows[0]?.next_pos || 1;

      const inserted = await db.query(
        `INSERT INTO choir_song_programmes (module_id, program_type, song_id, position, service_role, notes, added_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [module_id.toLowerCase(), program_type.toLowerCase(), song_id, nextPos, service_role || null, notes || null, addedBy]
      );
      return res.json({ success: true, action: "added", message: "Added to programme", data: inserted.rows[0] });
    }
  } catch (error) {
    logger.error("Error toggling programme song: " + error.message);
    res.status(500).json({ success: false, error: "Failed to update programme" });
  }
};
