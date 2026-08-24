import { db } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

const VALID_URL_PREFIX = "https://chat.whatsapp.com/";

const JUMUIYA_SLUGS = [
  "st-anthony",
  "st-augustine",
  "st-catherine",
  "st-dominic",
  "st-elizabeth",
  "st-maria-goretti",
  "st-monica",
];

const JUMUIYA_NAMES = {
  "st-anthony": "St. Anthony of Padua",
  "st-augustine": "St. Augustine of Hippo",
  "st-catherine": "St. Catherine of Alexandria",
  "st-dominic": "St. Dominic Guzman",
  "st-elizabeth": "St. Elizabeth of Hungary",
  "st-maria-goretti": "St. Maria Goretti",
  "st-monica": "St. Monica of Hippo",
};

const GLOBAL_ROLES = ["csa_secretary", "csa_chair", "jumuiya_coordinator"];

const getUserRoles = (req) => {
  if (!req.user) return [];
  return Array.isArray(req.user.role)
    ? req.user.role
    : req.user.role ? [req.user.role] : [];
};

const isGlobalAdmin = (req) => {
  const roles = getUserRoles(req).map(r => String(r).toLowerCase().trim());
  return roles.some(r => GLOBAL_ROLES.includes(r));
};

const resolveJumuiyaSlug = async (jumuiyaId) => {
  if (!jumuiyaId) return null;
  const slugRes = await db.query(
    `SELECT slug FROM sub_groups WHERE group_id = $1`,
    [jumuiyaId]
  );
  return slugRes.rows.length > 0 ? slugRes.rows[0].slug : null;
};

// GET /whatsapp-links — returns groups relevant to the authenticated user.
// First Years get 4 groups: CSA General + CSA Year 1 + Jumuiya Main + Jumuiya Year 1
// Year 2/3/4 get 2 groups: CSA General + Jumuiya Main (already in their year groups)
export const getWhatsAppLinks = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.member_id;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const userRes = await db.query(
      `SELECT year_of_study, jumuiya_id FROM members WHERE member_id = $1`,
      [userId]
    );
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: "Member not found" });
    }

    const { year_of_study, jumuiya_id } = userRes.rows[0];

    // Normalize year_of_study: "1"-"4" pass through, "2024-2025" → year level, "26"/"2026" → derive from current year
    const normalizeYear = (val) => {
      if (!val) return null;
      const trimmed = String(val).trim();
      if (/^[1-4]$/.test(trimmed)) return Number(trimmed);
      // Handle "YYYY-YYYY" format
      const rangeMatch = trimmed.match(/^(\d{4})-\d{4}$/);
      if (rangeMatch) {
        const level = new Date().getFullYear() - parseInt(rangeMatch[1], 10) + 1;
        if (level >= 1 && level <= 4) return level;
      }
      // Handle raw 4-digit year (e.g. "2026") → treat as registration year, assume year 1
      const num = parseInt(trimmed, 10);
      if (num >= 2020 && num <= 2099) return 1; // new registrant = first year
      // Handle 2-digit year (e.g. "26") → assume year 1
      if (num >= 20 && num <= 40) return 1;
      return null;
    };

    const yearNum = normalizeYear(year_of_study);
    const isFirstYear = yearNum === 1;

    // Resolve jumuiya UUID → slug
    let jumuiyaSlug = null;
    if (jumuiya_id) {
      const slugRes = await db.query(
        `SELECT slug FROM sub_groups WHERE group_id = $1`,
        [jumuiya_id]
      );
      if (slugRes.rows.length > 0) jumuiyaSlug = slugRes.rows[0].slug;
    }

    // Build keys to fetch based on year
    const keysToFetch = ["whatsapp_general_link"];

    if (isFirstYear) {
      // First Years: also see CSA Year 1 group
      keysToFetch.push("whatsapp_year_1_link");
    }

    if (jumuiyaSlug && JUMUIYA_SLUGS.includes(jumuiyaSlug)) {
      // All years: see their Jumuiya Main group
      keysToFetch.push(`whatsapp_jumuiya_${jumuiyaSlug}_link`);

      if (isFirstYear) {
        // First Years: also see their Jumuiya Year 1 group
        keysToFetch.push(`whatsapp_jumuiya_${jumuiyaSlug}_year_1_link`);
      }
    }

    // Fetch from system_settings
    const placeholders = keysToFetch.map((_, i) => `$${i + 1}`).join(", ");
    const settingsRes = await db.query(
      `SELECT key, value FROM system_settings WHERE key IN (${placeholders})`,
      keysToFetch
    );

    const links = {};
    settingsRes.rows.forEach((row) => {
      if (row.value && row.value.trim()) {
        links[row.key] = row.value.trim();
      }
    });

    const jumuiyaName = jumuiyaSlug ? JUMUIYA_NAMES[jumuiyaSlug] || null : null;

    res.json({
      // Group 1: CSA General (all years)
      general: links["whatsapp_general_link"] || null,

      // Group 2: CSA Year (first years only)
      csaYear: isFirstYear ? (links["whatsapp_year_1_link"] || null) : null,

      // Group 3: Jumuiya Main (all years)
      jumuiyaMain: jumuiyaSlug ? (links[`whatsapp_jumuiya_${jumuiyaSlug}_link`] || null) : null,

      // Group 4: Jumuiya Year (first years only)
      jumuiyaYear: isFirstYear && jumuiyaSlug
        ? (links[`whatsapp_jumuiya_${jumuiyaSlug}_year_1_link`] || null)
        : null,

      // Metadata
      yearLevel: yearNum,
      isFirstYear,
      jumuiyaSlug,
      jumuiyaName,
    });
  } catch (error) {
    logger.error("Error fetching WhatsApp links:", error.message);
    res.status(500).json({ error: "Failed to load WhatsApp links" });
  }
};

// GET /whatsapp-links/qr-welcome — PUBLIC. The two welcome groups offered to
// new members right after they submit the QR registration form.
export const getQrWelcomeLinks = async (req, res) => {
  try {
    const settingsRes = await db.query(
      `SELECT key, value FROM system_settings WHERE key IN ($1, $2, $3, $4)`,
      [
        "whatsapp_qr_welcome_1_link",
        "whatsapp_qr_welcome_1_label",
        "whatsapp_qr_welcome_2_link",
        "whatsapp_qr_welcome_2_label",
      ]
    );
    const map = Object.fromEntries(settingsRes.rows.map((r) => [r.key, (r.value || "").trim()]));

    const groups = [];
    for (const i of [1, 2]) {
      const url = map[`whatsapp_qr_welcome_${i}_link`];
      if (!url) continue;
      if (!url.startsWith(VALID_URL_PREFIX)) continue; // never emit malformed links
      groups.push({
        label: map[`whatsapp_qr_welcome_${i}_label`] || `WhatsApp Group ${i}`,
        url,
      });
    }

    res.json({ groups });
  } catch (error) {
    logger.error("Error fetching QR welcome links:", error.message);
    res.status(500).json({ error: "Failed to load welcome links" });
  }
};

// PUT /whatsapp-links — admin-only bulk update
// Scoped: jumuiya officials can only update their own jumuiya's links
export const updateWhatsAppLinks = async (req, res) => {
  try {
    const { general, years, jumuiyas, jumuiyaYears, qrWelcome } = req.body;

    const updates = [];

    // QR Registration Welcome Groups — global admins only. Each entry:
    // { label: string, url: string }. Stored as separate label/link keys.
    if (isGlobalAdmin(req) && Array.isArray(qrWelcome)) {
      for (let i = 0; i < Math.min(qrWelcome.length, 2); i++) {
        const entry = qrWelcome[i] || {};
        const url = String(entry.url || "").trim();
        const label = String(entry.label || "").trim().slice(0, 80);
        updates.push({ key: `whatsapp_qr_welcome_${i + 1}_link`, value: url });
        updates.push({ key: `whatsapp_qr_welcome_${i + 1}_label`, value: label });
      }
    }

    // Determine scope
    const scoped = !isGlobalAdmin(req);
    let scopedSlug = null;
    if (scoped) {
      const jumuiyaId = req.user?.jumuiya_id;
      if (jumuiyaId) {
        scopedSlug = await resolveJumuiyaSlug(jumuiyaId);
      }
      if (!scopedSlug) {
        return res.status(400).json({ error: "No jumuiya associated with your account" });
      }
    }

    // CSA General — only global admins
    if (!scoped && general !== undefined) {
      updates.push({ key: "whatsapp_general_link", value: general || "" });
    }

    // CSA Year Groups (1-4) — only global admins
    if (!scoped && years && typeof years === "object") {
      for (const [year, link] of Object.entries(years)) {
        const y = parseInt(String(year).trim(), 10);
        if (y >= 1 && y <= 4) {
          updates.push({ key: `whatsapp_year_${y}_link`, value: link || "" });
        }
      }
    }

    // Jumuiya Main Groups
    if (jumuiyas && typeof jumuiyas === "object") {
      for (const [slug, link] of Object.entries(jumuiyas)) {
        if (!JUMUIYA_SLUGS.includes(slug)) continue;
        // Scoped: only allow own jumuiya
        if (scoped && slug !== scopedSlug) continue;
        updates.push({ key: `whatsapp_jumuiya_${slug}_link`, value: link || "" });
      }
    }

    // Jumuiya Year Groups (7 jumuiyas × 4 years)
    if (jumuiyaYears && typeof jumuiyaYears === "object") {
      for (const [slug, yearLinks] of Object.entries(jumuiyaYears)) {
        if (!JUMUIYA_SLUGS.includes(slug)) continue;
        // Scoped: only allow own jumuiya
        if (scoped && slug !== scopedSlug) continue;
        if (typeof yearLinks !== "object") continue;
        for (const [year, link] of Object.entries(yearLinks || {})) {
          const y = parseInt(String(year).trim(), 10);
          if (y >= 1 && y <= 4) {
            updates.push({
              key: `whatsapp_jumuiya_${slug}_year_${y}_link`,
              value: link || "",
            });
          }
        }
      }
    }

    // Validate URLs (label settings are plain text — skip them)
    for (const { key, value } of updates) {
      if (!key.endsWith("_link")) continue;
      if (value && !value.startsWith(VALID_URL_PREFIX)) {
        return res.status(400).json({
          error: `Invalid link for "${key}". Must start with ${VALID_URL_PREFIX}`,
        });
      }
    }

    // Upsert all
    for (const { key, value } of updates) {
      await db.query(
        `INSERT INTO system_settings (key, value, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
        [key, value]
      );
    }

    logger.info("WhatsApp links updated by admin:", req.user?.id);
    res.json({ success: true, message: "WhatsApp links saved" });
  } catch (error) {
    logger.error("Error updating WhatsApp links:", error.message);
    res.status(500).json({ error: "Failed to save WhatsApp links" });
  }
};

// GET /whatsapp-links/all — admin-only: returns link settings
// Scoped: jumuiya officials see only their jumuiya's data; global admins see everything
export const getAllWhatsAppLinks = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT key, value FROM system_settings WHERE key LIKE 'whatsapp_%_link' ORDER BY key`
    );

    const data = { general: "", years: {}, jumuiyas: {}, jumuiyaYears: {}, qrWelcome: [{ label: "", url: "" }, { label: "", url: "" }], scope: "global" };

    // QR welcome groups (global admins only)
    if (isGlobalAdmin(req)) {
      const qrRes = await db.query(
        `SELECT key, value FROM system_settings WHERE key LIKE 'whatsapp_qr_welcome_%' ORDER BY key`
      );
      const qrMap = Object.fromEntries(qrRes.rows.map((r) => [r.key, r.value || ""]));
      for (const i of [1, 2]) {
        data.qrWelcome[i - 1] = {
          label: qrMap[`whatsapp_qr_welcome_${i}_label`] || "",
          url: qrMap[`whatsapp_qr_welcome_${i}_link`] || "",
        };
      }
    }

    // If user is a jumuiya official (not global), resolve their jumuiya slug
    let scopedSlug = null;
    if (!isGlobalAdmin(req)) {
      const jumuiyaId = req.user?.jumuiya_id;
      if (jumuiyaId) {
        scopedSlug = await resolveJumuiyaSlug(jumuiyaId);
      }
      if (!scopedSlug) {
        // No jumuiya resolved — return empty scoped data
        data.scope = "none";
        return res.json(data);
      }
      data.scope = scopedSlug;
    }

    result.rows.forEach((row) => {
      const val = row.value || "";

      if (row.key === "whatsapp_general_link") {
        data.general = val;
        return;
      }

      // CSA Year: whatsapp_year_N_link
      const yearMatch = row.key.match(/^whatsapp_year_(\d+)_link$/);
      if (yearMatch) {
        data.years[yearMatch[1]] = val;
        return;
      }

      // Jumuiya Year: whatsapp_jumuiya_SLUG_year_N_link
      const jumYearMatch = row.key.match(/^whatsapp_jumuiya_(.+)_year_(\d+)_link$/);
      if (jumYearMatch) {
        const [, slug, year] = jumYearMatch;
        // Scoped: skip other jumuiyas
        if (scopedSlug && slug !== scopedSlug) return;
        if (!data.jumuiyaYears[slug]) data.jumuiyaYears[slug] = {};
        data.jumuiyaYears[slug][year] = val;
        return;
      }

      // Jumuiya Main: whatsapp_jumuiya_SLUG_link
      const jumMainMatch = row.key.match(/^whatsapp_jumuiya_(.+)_link$/);
      if (jumMainMatch) {
        const slug = jumMainMatch[1];
        // Scoped: skip other jumuiyas
        if (scopedSlug && slug !== scopedSlug) return;
        data.jumuiyas[slug] = val;
      }
    });

    res.json(data);
  } catch (error) {
    logger.error("Error fetching all WhatsApp links:", error.message);
    res.status(500).json({ error: "Failed to load WhatsApp links" });
  }
};
