import { db as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";
import { validateMemberRow } from "../utils/memberValidation.js";
import { syncNewImportRecords } from "../services/importSyncJob.js";

// Canonical 7 Jumuiyas mapping
const JUMUIYA_SLUG_MAP = {
  "st-anthony": "St. Anthony",
  "st-augustine": "St. Augustine",
  "st-catherine": "St. Catherine",
  "st-dominic": "St. Dominic",
  "st-elizabeth": "St. Elizabeth",
  "st-maria-goretti": "St. Maria Goretti",
  "st-monica": "St. Monica",
};

const JUMUIYA_META = {
  "st-anthony": {
    name: "St. Anthony",
    fullName: "St. Anthony of Padua",
    color: "#8b5cf6",
    saintImage: "/images/Anthony.png",
    quote: "The breath of Charity widens the narrow heart of sinners.",
    meetingSchedule: { day: "Sunday", time: "2:00 PM - 4:00 PM", venue: "LH 24" },
  },
  "st-augustine": {
    name: "St. Augustine",
    fullName: "St. Augustine of Hippo",
    color: "#3b82f6",
    saintImage: "/images/Augustine.png",
    quote: "Our hearts are restless until they rest in Thee.",
    meetingSchedule: { day: "Sunday", time: "2:00 PM - 4:00 PM", venue: "LH 21" },
  },
  "st-catherine": {
    name: "St. Catherine",
    fullName: "St. Catherine of Alexandria",
    color: "#800000",
    saintImage: "/images/Catherine.png",
    quote: "Be who God meant you to be and you will set the world on fire.",
    meetingSchedule: { day: "Sunday", time: "2:00 PM - 4:00 PM", venue: "LH 18" },
  },
  "st-dominic": {
    name: "St. Dominic",
    fullName: "St. Dominic Guzman",
    color: "#475569",
    saintImage: "/images/Dominic.png",
    quote: "A man who governs his passions is master of the world.",
    meetingSchedule: { day: "Sunday", time: "2:00 PM - 4:00 PM", venue: "LH 15" },
  },
  "st-elizabeth": {
    name: "St. Elizabeth",
    fullName: "St. Elizabeth of Hungary",
    color: "#059669",
    saintImage: "/images/Elizabeth.png",
    quote: "We must give whatever we have gladly and with a cheerful heart.",
    meetingSchedule: { day: "Sunday", time: "2:00 PM - 4:00 PM", venue: "LH 12" },
  },
  "st-maria-goretti": {
    name: "St. Maria Goretti",
    fullName: "St. Maria Goretti",
    color: "#0284c7",
    saintImage: "/images/Goretti.png",
    quote: "Forgive, and you will be forgiven.",
    meetingSchedule: { day: "Sunday", time: "2:00 PM - 4:00 PM", venue: "LH 09" },
  },
  "st-monica": {
    name: "St. Monica",
    fullName: "St. Monica of Hippo",
    color: "#dc2626",
    saintImage: "/images/Monica.png",
    quote: "Nothing is far from God.",
    meetingSchedule: { day: "Sunday", time: "2:00 PM - 4:00 PM", venue: "LH 06" },
  },
};

/**
 * Resolve slug or name to clean Jumuiya details
 */
export const resolveJumuiyaSlug = async (slugInput) => {
  if (!slugInput) return null;
  const rawSlug = String(slugInput).trim().toLowerCase();
  
  if (JUMUIYA_SLUG_MAP[rawSlug]) {
    const name = JUMUIYA_SLUG_MAP[rawSlug];
    const meta = JUMUIYA_META[rawSlug] || { name, fullName: name };
    // Fetch group_id from sub_groups table if available
    let groupId = null;
    try {
      const sgRes = await pool.query(
        `SELECT group_id, name FROM sub_groups WHERE LOWER(slug) = LOWER($1) OR LOWER(name) = LOWER($2) LIMIT 1`,
        [rawSlug, name]
      );
      if (sgRes.rows.length) {
        groupId = sgRes.rows[0].group_id;
      }
    } catch (err) {
      logger.warn(`Could not lookup sub_groups for slug ${rawSlug}: ${err.message}`);
    }
    return { slug: rawSlug, name, meta, groupId };
  }

  // Fallback database lookup
  try {
    const sgRes = await pool.query(
      `SELECT group_id, name, slug FROM sub_groups WHERE LOWER(slug) = LOWER($1) OR LOWER(name) = LOWER($1) LIMIT 1`,
      [rawSlug]
    );
    if (sgRes.rows.length) {
      const row = sgRes.rows[0];
      const matchedSlug = row.slug || rawSlug;
      const meta = JUMUIYA_META[matchedSlug] || { name: row.name, fullName: row.name };
      return { slug: matchedSlug, name: row.name, meta, groupId: row.group_id };
    }
  } catch (err) {
    logger.warn(`Database fallback failed for slug ${rawSlug}: ${err.message}`);
  }

  return null;
};

/**
 * Live duplicate checker
 * GET /api/jumuiya/check-duplicate?regNumber=...&email=...
 */
export const checkDuplicateMember = async (req, res) => {
  try {
    const { regNumber, email } = req.query;
    const cleanReg = (regNumber || "").trim().toUpperCase();
    const cleanEmail = (email || "").trim().toLowerCase();

    if (!cleanReg && !cleanEmail) {
      return res.status(400).json({ success: false, message: "Registration number or email is required" });
    }

    // 1. Check in members table (active members)
    if (cleanReg) {
      const memRes = await pool.query(
        `SELECT m.member_id, m.first_name, m.last_name, m.email, m.source, sg.name as jumuiya_name, sg.slug as jumuiya_slug
         FROM members m
         LEFT JOIN sub_groups sg ON sg.group_id = m.jumuiya_id
         WHERE m.member_id = $1 LIMIT 1`,
        [cleanReg]
      );
      if (memRes.rows.length > 0) {
        const row = memRes.rows[0];
        const jName = row.jumuiya_name || "a Jumuiya";
        return res.json({
          success: true,
          isDuplicate: true,
          field: "regNumber",
          message: `This Registration Number is already registered under ${jName}.`,
          jumuiyaName: jName,
          source: "members",
        });
      }
    }

    if (cleanEmail) {
      const emailRes = await pool.query(
        `SELECT m.member_id, m.first_name, m.last_name, m.email, m.source, sg.name as jumuiya_name, sg.slug as jumuiya_slug
         FROM members m
         LEFT JOIN sub_groups sg ON sg.group_id = m.jumuiya_id
         WHERE LOWER(m.email) = $1 LIMIT 1`,
        [cleanEmail]
      );
      if (emailRes.rows.length > 0) {
        const row = emailRes.rows[0];
        const jName = row.jumuiya_name || "a Jumuiya";
        return res.json({
          success: true,
          isDuplicate: true,
          field: "email",
          message: `This Email is already registered under ${jName}.`,
          jumuiyaName: jName,
          source: "members",
        });
      }
    }

    // 2. Check in import_records (pending staging queue)
    if (cleanReg) {
      const impRecRes = await pool.query(
        `SELECT ir.cleaned_reg_number, ir.cleaned_name, ir.cleaned_jumuiya, ir.status, mi.jumuiya_id as import_jumuiya_id
         FROM import_records ir
         JOIN member_imports mi ON mi.id = ir.import_id
         WHERE ir.cleaned_reg_number = $1 AND ir.status IN ('valid', 'warning', 'pending')
         LIMIT 1`,
        [cleanReg]
      );
      if (impRecRes.rows.length > 0) {
        const row = impRecRes.rows[0];
        const jName = row.cleaned_jumuiya || JUMUIYA_SLUG_MAP[row.import_jumuiya_id] || "the pending queue";
        return res.json({
          success: true,
          isDuplicate: true,
          field: "regNumber",
          message: `This Registration Number is already in the pending admission queue for ${jName}.`,
          jumuiyaName: jName,
          source: "pending",
        });
      }
    }

    if (cleanEmail) {
      const impEmailRes = await pool.query(
        `SELECT ir.cleaned_email, ir.cleaned_name, ir.cleaned_jumuiya, ir.status, mi.jumuiya_id as import_jumuiya_id
         FROM import_records ir
         JOIN member_imports mi ON mi.id = ir.import_id
         WHERE LOWER(ir.cleaned_email) = $1 AND ir.status IN ('valid', 'warning', 'pending')
         LIMIT 1`,
        [cleanEmail]
      );
      if (impEmailRes.rows.length > 0) {
        const row = impEmailRes.rows[0];
        const jName = row.cleaned_jumuiya || JUMUIYA_SLUG_MAP[row.import_jumuiya_id] || "the pending queue";
        return res.json({
          success: true,
          isDuplicate: true,
          field: "email",
          message: `This Email is already in the pending admission queue for ${jName}.`,
          jumuiyaName: jName,
          source: "pending",
        });
      }
    }

    return res.json({
      success: true,
      isDuplicate: false,
      message: "No duplicates found.",
    });
  } catch (error) {
    logger.error("checkDuplicateMember error:", error.message);
    res.status(500).json({ success: false, message: "Error checking duplicates" });
  }
};

/**
 * Public info endpoint for a Jumuiya by slug
 * GET /api/jumuiya/info/:slug
 */
export const getPublicJumuiyaInfo = async (req, res) => {
  try {
    const { slug } = req.params;
    const resolved = await resolveJumuiyaSlug(slug);
    if (!resolved) {
      return res.status(404).json({
        success: false,
        message: `Jumuiya '${slug}' not found. Available Jumuiyas: ${Object.keys(JUMUIYA_SLUG_MAP).join(", ")}`,
      });
    }

    res.json({
      success: true,
      data: {
        slug: resolved.slug,
        name: resolved.name,
        fullName: resolved.meta?.fullName || resolved.name,
        color: resolved.meta?.color || "#6366f1",
        saintImage: resolved.meta?.saintImage || "/images/cross.png",
        quote: resolved.meta?.quote || "",
        meetingSchedule: resolved.meta?.meetingSchedule || { day: "Sunday", time: "2:00 PM - 4:00 PM", venue: "LH" },
      },
    });
  } catch (error) {
    logger.error("getPublicJumuiyaInfo error:", error.message);
    res.status(500).json({ success: false, message: "Error fetching Jumuiya info" });
  }
};

/**
 * Public Dynamic WhatsApp Self-Registration
 * POST /api/jumuiya/self-register
 */
export const selfRegisterMember = async (req, res) => {
  try {
    const {
      name,
      fullName,
      regNumber,
      registrationNumber,
      gender,
      email,
      phone,
      phoneNumber,
      course,
      jumuiya_slug,
      jumuiyaSlug,
      jumuiyaId,
    } = req.body;

    const rawName = (name || fullName || "").trim();
    const rawRegNumber = (regNumber || registrationNumber || "").trim();
    const rawGender = (gender || "").trim();
    const rawEmail = (email || "").trim();
    const rawPhone = (phone || phoneNumber || "").trim();
    const rawCourse = (course || "").trim();
    const targetSlug = (jumuiya_slug || jumuiyaSlug || jumuiyaId || "").trim();

    // 1. Validate required fields
    if (!rawName) {
      return res.status(400).json({ success: false, error: "Full Name is required." });
    }
    if (!rawRegNumber) {
      return res.status(400).json({ success: false, error: "Registration Number is required." });
    }
    if (!rawGender) {
      return res.status(400).json({ success: false, error: "Gender is required." });
    }
    if (!rawEmail) {
      return res.status(400).json({ success: false, error: "Email is required." });
    }
    if (!rawPhone) {
      return res.status(400).json({ success: false, error: "Phone Number is required." });
    }
    if (!rawCourse) {
      return res.status(400).json({ success: false, error: "Course / Programme is required." });
    }
    if (!targetSlug) {
      return res.status(400).json({ success: false, error: "Target Jumuiya slug is required." });
    }

    // 2. Resolve Jumuiya slug
    const resolvedJumuiya = await resolveJumuiyaSlug(targetSlug);
    if (!resolvedJumuiya) {
      return res.status(400).json({
        success: false,
        error: `Invalid Jumuiya "${targetSlug}". Please use a valid registration link.`,
      });
    }

    const targetJumuiyaName = resolvedJumuiya.name;
    const targetJumuiyaSlug = resolvedJumuiya.slug;
    const targetJumuiyaUuid = resolvedJumuiya.groupId;

    // 3. Clean & validate member row format
    const validated = validateMemberRow(
      {
        name: rawName,
        regNumber: rawRegNumber,
        gender: rawGender,
        course: rawCourse,
        email: rawEmail,
        phone: rawPhone,
        jumuiya: targetJumuiyaName,
      },
      targetJumuiyaName
    );

    if (validated.errors && validated.errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: validated.errors.join("; "),
        details: validated.errors,
      });
    }

    const cleanReg = validated.cleaned.regNumber;
    const cleanEmail = validated.cleaned.email;
    const cleanPhone = validated.cleaned.phone;
    const cleanName = validated.cleaned.name || rawName;
    const cleanGender = validated.cleaned.gender || rawGender;
    const cleanCourse = rawCourse;

    // 4. Duplicate checks across database (Active members & Pending staging)
    // Check Reg Number in members
    const dupRegMem = await pool.query(
      `SELECT m.member_id, sg.name as jumuiya_name FROM members m
       LEFT JOIN sub_groups sg ON sg.group_id = m.jumuiya_id
       WHERE m.member_id = $1 LIMIT 1`,
      [cleanReg]
    );
    if (dupRegMem.rows.length > 0) {
      const existingJum = dupRegMem.rows[0].jumuiya_name || "a Jumuiya";
      return res.status(409).json({
        success: false,
        error: `This Registration Number (${cleanReg}) is already registered under ${existingJum}.`,
        field: "regNumber",
        jumuiyaName: existingJum,
      });
    }

    // Check Email in members
    if (cleanEmail) {
      const dupEmailMem = await pool.query(
        `SELECT m.member_id, sg.name as jumuiya_name FROM members m
         LEFT JOIN sub_groups sg ON sg.group_id = m.jumuiya_id
         WHERE LOWER(m.email) = $1 LIMIT 1`,
        [cleanEmail]
      );
      if (dupEmailMem.rows.length > 0) {
        const existingJum = dupEmailMem.rows[0].jumuiya_name || "a Jumuiya";
        return res.status(409).json({
          success: false,
          error: `This Email (${cleanEmail}) is already registered under ${existingJum}.`,
          field: "email",
          jumuiyaName: existingJum,
        });
      }
    }

    // Check Reg Number in active import_records
    const dupRegImp = await pool.query(
      `SELECT ir.cleaned_reg_number, ir.cleaned_jumuiya, mi.jumuiya_id as import_jumuiya_id
       FROM import_records ir
       JOIN member_imports mi ON mi.id = ir.import_id
       WHERE ir.cleaned_reg_number = $1 AND ir.status IN ('valid', 'warning', 'pending')
       LIMIT 1`,
      [cleanReg]
    );
    if (dupRegImp.rows.length > 0) {
      const existingJum = dupRegImp.rows[0].cleaned_jumuiya || JUMUIYA_SLUG_MAP[dupRegImp.rows[0].import_jumuiya_id] || targetJumuiyaName;
      return res.status(409).json({
        success: false,
        error: `This Registration Number is already submitted and pending admission under ${existingJum}.`,
        field: "regNumber",
        jumuiyaName: existingJum,
      });
    }

    // 5. Staging Flow: Find or create an open "WhatsApp Self-Registration" import batch for this Jumuiya
    // This directly targets the specific Jumuiya's staging queue and BYPASSES central CSA auto-allocation.
    const currentYear = new Date().getFullYear();
    const academicYear = `${currentYear}-${currentYear + 1}`;

    let importBatchId = null;
    const existingBatchRes = await pool.query(
      `SELECT id, total_records, valid_records, error_records FROM member_imports
       WHERE jumuiya_id = $1 AND file_name = 'whatsapp-self-registration' AND status = 'pending'
       ORDER BY created_at DESC LIMIT 1`,
      [targetJumuiyaSlug]
    );

    if (existingBatchRes.rows.length > 0) {
      importBatchId = existingBatchRes.rows[0].id;
    } else {
      const newBatchRes = await pool.query(
        `INSERT INTO member_imports
           (jumuiya_id, coordinator_id, season_id, file_name, total_records, valid_records, error_records, status, academic_year, notes)
         VALUES ($1, NULL, NULL, 'whatsapp-self-registration', 0, 0, 0, 'pending', $2, 'Dynamic WhatsApp Self-Registrations')
         RETURNING id`,
        [targetJumuiyaSlug, academicYear]
      );
      importBatchId = newBatchRes.rows[0].id;
    }

    // 6. Insert into import_records (pending — coordinator validates via Manual Admission)
    const recordStatus = validated.status === "error" ? "error" : "pending";
    const insertRecRes = await pool.query(
      `INSERT INTO import_records
         (import_id, raw_name, raw_reg_number, raw_gender, raw_course, raw_jumuiya, raw_phone, raw_email,
          cleaned_name, cleaned_reg_number, cleaned_gender, cleaned_course, cleaned_jumuiya, cleaned_phone, cleaned_email,
          status, validation_errors, validation_warnings)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
       RETURNING *`,
      [
        importBatchId,
        rawName,
        rawRegNumber,
        rawGender,
        rawCourse,
        targetJumuiyaName,
        rawPhone,
        rawEmail,
        cleanName,
        cleanReg,
        cleanGender,
        cleanCourse,
        targetJumuiyaName,
        cleanPhone,
        cleanEmail,
        recordStatus,
        JSON.stringify(validated.errors || []),
        JSON.stringify(validated.warnings || []),
      ]
    );

    // 7. Update member_imports summary count
    await pool.query(
      `UPDATE member_imports SET
         total_records = (SELECT COUNT(*) FROM import_records WHERE import_id = $1),
         valid_records = (SELECT COUNT(*) FROM import_records WHERE import_id = $1 AND status IN ('valid', 'warning', 'pending')),
         error_records = (SELECT COUNT(*) FROM import_records WHERE import_id = $1 AND status = 'error')
       WHERE id = $1`,
      [importBatchId]
    );

    logger.info(`WhatsApp self-registration successfully submitted for ${cleanReg} -> ${targetJumuiyaName} (batch ${importBatchId})`);

    res.status(201).json({
      success: true,
      message: `Successfully registered for ${targetJumuiyaName} Jumuiya! Your registration is in the pending approval queue.`,
      data: {
        record: insertRecRes.rows[0],
        jumuiya: {
          name: targetJumuiyaName,
          slug: targetJumuiyaSlug,
          fullName: resolvedJumuiya.meta?.fullName || targetJumuiyaName,
          meetingSchedule: resolvedJumuiya.meta?.meetingSchedule,
        },
        member: {
          name: cleanName,
          regNumber: cleanReg,
          gender: cleanGender,
          course: cleanCourse,
          email: cleanEmail,
          phone: cleanPhone,
        },
      },
    });
  } catch (error) {
    logger.error("selfRegisterMember error:", error.message);
    res.status(500).json({ success: false, error: error.message || "Failed to complete self-registration" });
  }
};
