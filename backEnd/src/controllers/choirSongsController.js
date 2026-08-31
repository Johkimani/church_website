import { db } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";
import { formatPhotoUrl, deleteFromCloudinary } from "../utils/helpers.js";
import { createWorker } from "tesseract.js";

/**
 * Normalizes and beautifies OCR extracted text from song sheets.
 */
function cleanOcrLyrics(rawText) {
  if (!rawText) return "";
  
  const lines = rawText
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => {
      // Filter out pure noise lines (e.g. random punctuation or solo numbers)
      if (/^[|/\\_=\-+~^`]{2,}$/.test(line)) return false;
      return line.length > 0;
    });

  // Re-join with proper verse and chorus spacing
  const cleaned = [];
  let prevEmpty = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if line looks like a chorus / verse marker
    const isChorusMarker = /^(chorus|kwaya|mwitikio|kiitikio|refrain|coda|bridge)/i.test(line);
    const isVerseMarker = /^(verse|ubeti|beti|stanza|\d+[\.:\)])/i.test(line);

    if (isChorusMarker || isVerseMarker) {
      if (cleaned.length > 0 && !prevEmpty) {
        cleaned.push(""); // add blank line before section
      }
    }

    cleaned.push(line);
    prevEmpty = false;
  }

  return cleaned.join("\n");
}

/**
 * Extract possible song title from the top lines of OCR text
 */
function guessTitleFromOcr(rawText) {
  if (!rawText) return "";
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 2);
  for (const line of lines.slice(0, 4)) {
    // Avoid headers that are obvious categories or music directions
    if (/^(moderato|andante|allegro|key|doh|solfa|wimbo|nyimbo|4\/4|3\/4|6\/8)/i.test(line)) continue;
    if (line.length >= 3 && line.length <= 60) {
      return line.replace(/^[0-9\.\-\s]+/, "").trim();
    }
  }
  return "";
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

    logger.info(`Starting in-memory OCR extraction for image size: ${req.file.buffer.length} bytes`);

    // Initialize Tesseract worker
    worker = await createWorker();
    
    // Recognize text from image buffer
    const ret = await worker.recognize(req.file.buffer);
    const rawText = ret.data.text || "";
    
    // Beautify and structure the extracted lyrics
    const cleanedLyrics = cleanOcrLyrics(rawText);
    const guessedTitle = guessTitleFromOcr(rawText);

    logger.info(`OCR extraction completed successfully: found ${cleanedLyrics.length} chars`);

    res.json({
      success: true,
      extractedLyrics: cleanedLyrics,
      rawText: rawText,
      guessedTitle: guessedTitle,
      confidence: ret.data.confidence || 0,
    });
  } catch (error) {
    logger.error("OCR Extraction failed: " + error.message, { stack: error.stack });
    res.status(500).json({ 
      success: false, 
      error: "OCR text extraction failed. Please try a clearer photo or type the lyrics manually." 
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
