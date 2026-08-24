import { db as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";
import { validateMemberRow } from "../utils/memberValidation.js";
import { syncNewImportRecords } from "../services/importSyncJob.js";

/**
 * Live duplicate checker for public /join form
 * GET /api/v1/jumuiya/join/check-duplicate?regNumber=...&email=...
 */
export const checkDuplicateJoin = async (req, res) => {
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
        `SELECT m.member_id, m.first_name, m.last_name, sg.name as jumuiya_name
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
        });
      }
    }

    if (cleanEmail) {
      const emailRes = await pool.query(
        `SELECT m.member_id, m.first_name, m.last_name, sg.name as jumuiya_name
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
        });
      }
    }

    // 2. Check in import_records (pending staging queue)
    if (cleanReg) {
      const impRegRes = await pool.query(
        `SELECT ir.cleaned_reg_number, ir.cleaned_jumuiya, ir.status
         FROM import_records ir
         JOIN member_imports mi ON mi.id = ir.import_id
         WHERE ir.cleaned_reg_number = $1 AND ir.status IN ('valid', 'warning', 'pending')
         LIMIT 1`,
        [cleanReg]
      );
      if (impRegRes.rows.length > 0) {
        const row = impRegRes.rows[0];
        return res.json({
          success: true,
          isDuplicate: true,
          field: "regNumber",
          message: `This Registration Number is already in the pending admission queue.`,
        });
      }
    }

    if (cleanEmail) {
      const impEmailRes = await pool.query(
        `SELECT ir.cleaned_email, ir.cleaned_name, ir.status
         FROM import_records ir
         JOIN member_imports mi ON mi.id = ir.import_id
         WHERE LOWER(ir.cleaned_email) = $1 AND ir.status IN ('valid', 'warning', 'pending')
         LIMIT 1`,
        [cleanEmail]
      );
      if (impEmailRes.rows.length > 0) {
        return res.json({
          success: true,
          isDuplicate: true,
          field: "email",
          message: `This Email is already in the pending admission queue.`,
        });
      }
    }

    return res.json({
      success: true,
      isDuplicate: false,
      message: "No duplicates found.",
    });
  } catch (error) {
    logger.error("checkDuplicateJoin error:", error.message);
    res.status(500).json({ success: false, message: "Error checking duplicates" });
  }
};

/**
 * Public Self-Registration via QR /join form
 * POST /api/v1/jumuiya/join/submit
 *
 * Creates an import_records row under a 'csa' batch so the member
 * lands in the coordinator's CSA pending queue for jumuiya assignment.
 */
export const publicJoinSubmit = async (req, res) => {
  try {
    const { name, regNumber, gender, email, phone, course } = req.body;

    // Optional community interest chosen on step 2 of the QR form. Strictly
    // whitelisted — anything else is ignored rather than trusted.
    const ALLOWED_COMMUNITIES = ["choir", "dancers", "st-francis", "charismatic"];
    const rawCommunity = String(req.body?.community || "").trim().toLowerCase();
    const community = ALLOWED_COMMUNITIES.includes(rawCommunity) ? rawCommunity : null;

    const rawName = (name || "").trim();
    const rawRegNumber = (regNumber || "").trim();
    const rawGender = (gender || "").trim();
    const rawEmail = (email || "").trim();
    const rawPhone = (phone || "").trim();
    const rawCourse = (course || "").trim();

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
    if (!rawPhone) {
      return res.status(400).json({ success: false, error: "Phone Number is required." });
    }
    if (!rawCourse) {
      return res.status(400).json({ success: false, error: "Course / Programme is required." });
    }

    // 2. Validate member row format via existing validation utils
    const validated = validateMemberRow(
      {
        name: rawName,
        regNumber: rawRegNumber,
        gender: rawGender,
        course: rawCourse,
        email: rawEmail || "N/A",
        phone: rawPhone,
      },
      null
    );

    if (validated.errors && validated.errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: validated.errors.join("; "),
        details: validated.errors,
      });
    }

    const cleanReg = validated.cleaned.regNumber;
    const cleanName = validated.cleaned.name || rawName;
    const cleanGender = validated.cleaned.gender || rawGender;
    const cleanPhone = validated.cleaned.phone || rawPhone;
    const cleanEmail = validated.cleaned.email || rawEmail || null;

    // 3. Duplicate checks
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
      });
    }

    // Check Email in members (only if provided)
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
        });
      }
    }

    // Check Reg Number in active import_records
    const dupRegImp = await pool.query(
      `SELECT ir.cleaned_reg_number FROM import_records ir
       JOIN member_imports mi ON mi.id = ir.import_id
       WHERE ir.cleaned_reg_number = $1 AND ir.status IN ('valid', 'warning', 'pending')
       LIMIT 1`,
      [cleanReg]
    );
    if (dupRegImp.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: `This Registration Number is already submitted and pending admission.`,
        field: "regNumber",
      });
    }

    // Check Email in import_records (only if provided)
    if (cleanEmail) {
      const dupEmailImp = await pool.query(
        `SELECT ir.cleaned_email FROM import_records ir
         JOIN member_imports mi ON mi.id = ir.import_id
         WHERE LOWER(ir.cleaned_email) = $1 AND ir.status IN ('valid', 'warning', 'pending')
         LIMIT 1`,
        [cleanEmail]
      );
      if (dupEmailImp.rows.length > 0) {
        return res.status(409).json({
          success: false,
          error: `This Email is already submitted and pending admission.`,
          field: "email",
        });
      }
    }

    // 4. Find or create a CSA import batch for public self-registrations
    const currentYear = new Date().getFullYear();
    const academicYear = `${currentYear}-${currentYear + 1}`;

    let importBatchId = null;
    const existingBatchRes = await pool.query(
      `SELECT id, total_records FROM member_imports
       WHERE jumuiya_id = 'csa' AND file_name = 'public-self-registration' AND status = 'pending'
       ORDER BY created_at DESC LIMIT 1`
    );

    if (existingBatchRes.rows.length > 0) {
      importBatchId = existingBatchRes.rows[0].id;
    } else {
      const newBatchRes = await pool.query(
        `INSERT INTO member_imports
           (jumuiya_id, coordinator_id, season_id, file_name, total_records, valid_records, error_records, status, academic_year, notes)
         VALUES ('csa', NULL, NULL, 'public-self-registration', 0, 0, 0, 'pending', $1, 'Public Self-Registrations via /join QR code')
         RETURNING id`,
        [academicYear]
      );
      importBatchId = newBatchRes.rows[0].id;
    }

    // 5. Insert into import_records (cleaned_jumuiya intentionally NULL — coordinator assigns)
    const recordStatus = validated.status === "error" ? "error" : "pending";
    const insertRes = await pool.query(
      `INSERT INTO import_records
         (import_id, raw_name, raw_reg_number, raw_gender, raw_course, raw_jumuiya, raw_phone, raw_email,
          cleaned_name, cleaned_reg_number, cleaned_gender, cleaned_course, cleaned_jumuiya, cleaned_phone, cleaned_email,
          status, validation_errors, validation_warnings)
       VALUES ($1, $2, $3, $4, $5, 'N/A', $6, $7, $8, $9, $10, $11, NULL, $12, $13, $14, $15, $16)
       RETURNING *`,
      [
        importBatchId,
        rawName,
        rawRegNumber,
        rawGender,
        rawCourse,
        rawPhone,
        rawEmail || null,
        cleanName,
        cleanReg,
        cleanGender,
        rawCourse,
        cleanPhone,
        cleanEmail,
        recordStatus,
        JSON.stringify(validated.errors || []),
        JSON.stringify(validated.warnings || []),
      ]
    );

    // 6. Update member_imports summary counts
    await pool.query(
      `UPDATE member_imports SET
         total_records = (SELECT COUNT(*) FROM import_records WHERE import_id = $1),
         valid_records = (SELECT COUNT(*) FROM import_records WHERE import_id = $1 AND status IN ('valid', 'warning')),
         error_records = (SELECT COUNT(*) FROM import_records WHERE import_id = $1 AND status = 'error')
       WHERE id = $1`,
      [importBatchId]
    );

    // 7. Trigger sync so member appears in CSA pending queue immediately
    try {
      await syncNewImportRecords();
    } catch (syncErr) {
      logger.warn(`publicJoinSubmit: syncNewImportRecords failed (non-fatal): ${syncErr.message}`);
    }

    // 8. Record the community interest as a pending enrollment. Non-fatal:
    // membership registration must never fail because of the optional tab.
    if (community) {
      try {
        await pool.query(
          `INSERT INTO enrollments (module_id, full_name, phone, email, gender, course, status)
           VALUES ($1, $2, $3, $4, $5, $6, 'Pending')`,
          [community, cleanName, cleanPhone, cleanEmail || "", cleanGender, rawCourse]
        );
        logger.info(`Public join: ${cleanReg} also requested to join '${community}'`);
      } catch (enrollErr) {
        logger.warn(`publicJoinSubmit: enrollment insert failed for ${cleanReg} (${community}): ${enrollErr.message}`);
      }
    }

    logger.info(`Public join registration submitted: ${cleanReg} (batch ${importBatchId})`);

    res.status(201).json({
      success: true,
      message: "Registration received! Your coordinator will assign your Jumuiya shortly.",
      data: {
        name: cleanName,
        regNumber: cleanReg,
        date: new Date().toLocaleDateString(),
        community,
      },
    });
  } catch (error) {
    logger.error("publicJoinSubmit error:", error.message);
    res.status(500).json({ success: false, error: error.message || "Failed to submit registration" });
  }
};
