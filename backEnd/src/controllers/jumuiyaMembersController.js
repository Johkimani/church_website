import { testDb as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";
import { payAndWait } from "./stkPush/stkHelper.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

const mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
});

/**
 * Resolve a Jumuiya slug (e.g. "st-anthony") to a UUID from sub_groups.
 * Returns null if no match is found.
 */
const resolveJumuiyaUuid = async (slug) => {
  if (!slug) return null;

  // 1. If the input already looks like a UUID, try direct match
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
  if (isUuid) {
    const uuidResult = await pool.query(
      `SELECT group_id FROM sub_groups WHERE group_id = $1`,
      [slug]
    );
    if (uuidResult.rows.length) return uuidResult.rows[0].group_id;
  }

  // 2. Convert slug to title-case name: "st-anthony" → "St. Anthony"
  const nameGuess = slug.split("-").map(w => {
    if (w.toLowerCase() === "st") return "St.";
    return w.charAt(0).toUpperCase() + w.slice(1);
  }).join(" ");

  const nameResult = await pool.query(
    `SELECT group_id FROM sub_groups WHERE LOWER(name) = LOWER($1) OR LOWER(full_name) = LOWER($1)`,
    [nameGuess]
  );
  if (nameResult.rows.length) return nameResult.rows[0].group_id;

  // 3. Fuzzy match: try substring
  const fuzzyResult = await pool.query(
    `SELECT group_id FROM sub_groups WHERE LOWER(name) LIKE $1 OR LOWER(full_name) LIKE $1`,
    [`%${slug.replace(/-/g, "%")}%`]
  );
  if (fuzzyResult.rows.length) return fuzzyResult.rows[0].group_id;

  return null;
};

/**
 * Internal: fetch members from both sources (jumuiya import, CSA distribution).
 * Used by getAllJumuiyaMembers and getAllMembersAcrossJumuiyas.
 */
function deriveYearFromReg(memberId) {
  if (!memberId) return null;
  const match = memberId.match(/(\d{2})$/);
  if (!match) return null;
  const lastTwo = parseInt(match[1], 10);
  const year = lastTwo <= 50 ? 2000 + lastTwo : 1900 + lastTwo;
  return `${year}-${year + 1}`;
}

async function fetchAllMembers(jumuiya_id) {
  const resolvedUuid = await resolveJumuiyaUuid(jumuiya_id);

  if (jumuiya_id && !resolvedUuid) {
    return [];
  }

  let query = `
    SELECT 
      m.member_id as id,
      m.first_name,
      m.last_name,
      m.course,
      m.email,
      m.phone,
      m.gender,
      m.year_of_study as year,
      m.jumuiya_id as jumuiya_uuid,
      sg.name as jumuiya_name,
      (r.member_id IS NOT NULL) as is_registered,
      m.sem_1_reg, m.sem_2_reg, m.sem_3_reg, m.sem_4_reg,
      m.sem_5_reg, m.sem_6_reg, m.sem_7_reg, m.sem_8_reg,
      m.join_date,
      m.source,
      m.status as import_status
    FROM members m
    LEFT JOIN registered r ON m.member_id = r.member_id AND r.jumuiya_id = m.jumuiya_id
    LEFT JOIN sub_groups sg ON m.jumuiya_id = sg.group_id
    WHERE (m.migrated_to_associates IS NULL OR m.migrated_to_associates = false)
  `;

  const params = [];
  if (resolvedUuid) {
    query += ` AND m.jumuiya_id = $1`;
    params.push(resolvedUuid);
  }

  query += ` ORDER BY m.first_name ASC`;

  const result = await pool.query(query, params);

  return result.rows.map(row => {
    const firstName = row.first_name || "";
    const lastName = row.last_name || "";
    const fullName = [firstName, lastName].filter(Boolean).join(" ").trim() || row.id || "Unknown";
    return {
      id: row.id,
      name: fullName,
      member_id: row.id,
      first_name: row.first_name,
      last_name: row.last_name,
      course: row.course,
      email: row.email,
      phone: row.phone,
      gender: row.gender,
      year: row.year || deriveYearFromReg(row.id),
      jumuiya_uuid: row.jumuiya_uuid,
      jumuiya_name: row.jumuiya_name,
      jumuiya_id: jumuiya_id || row.jumuiya_uuid || row.jumuiya_name,
      is_registered: row.is_registered,
      sem_1_reg: row.sem_1_reg, sem_2_reg: row.sem_2_reg,
      sem_3_reg: row.sem_3_reg, sem_4_reg: row.sem_4_reg,
      sem_5_reg: row.sem_5_reg, sem_6_reg: row.sem_6_reg,
      sem_7_reg: row.sem_7_reg, sem_8_reg: row.sem_8_reg,
      join_date: row.join_date,
      source: row.source,
      import_status: row.import_status,
      is_current_jumuiya: !!(resolvedUuid && row.jumuiya_uuid === resolvedUuid),
    };
  });
}

/**
 * GET /api/jumuiya-members?jumuiya_id=st-anthony
 * Fetch all members from both the legacy members/registered tables and
 * the new import_records table (Jumuiya Member Collection System).
 */
export const getAllJumuiyaMembers = async (req, res) => {
  try {
    const { jumuiya_id } = req.query;
    const merged = await fetchAllMembers(jumuiya_id);
    res.json({ success: true, data: merged });
  } catch (error) {
    logger.error("Error fetching all members: " + error.message);
    res.status(500).json({ success: false, error: "Failed to fetch members" });
  }
};

/**
 * POST /api/jumuiya-members
 * Register a member to a specific Jumuiya.
 * Updates members table directly.
 */
export const createJumuiyaMember = async (req, res) => {
  try {
    const { member_id, jumuiya_id } = req.body;

    if (!member_id || !jumuiya_id) {
      return res.status(400).json({ success: false, message: "member_id and jumuiya_id are required" });
    }

    // Start Transaction
    await pool.query('BEGIN');

    // 1. Update members table
    await pool.query(
      `UPDATE members SET jumuiya_id = $1 WHERE member_id = $2`,
      [jumuiya_id, member_id]
    );

    // 2. Fetch updated member with jumuiya name via JOIN
    const updateResult = await pool.query(
      `SELECT m.*, sg.name as jumuiya_name
       FROM members m
       LEFT JOIN sub_groups sg ON m.jumuiya_id = sg.group_id
       WHERE m.member_id = $1`,
      [member_id]
    );

    if (updateResult.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ success: false, message: "Member not found" });
    }

    // 3. Insert into registered table
    await pool.query(
      `INSERT INTO registered (member_id, jumuiya_id, registration_date, status) 
       VALUES ($1, $2, CURRENT_TIMESTAMP, 'active')
       ON CONFLICT DO NOTHING`, 
      [member_id, jumuiya_id]
    );

    await pool.query('COMMIT');

    const row = updateResult.rows[0];
    res.status(200).json({ 
      success: true, 
      message: "Successfully joined the community",
      data: {
        ...row,
        id: row.member_id,
        name: `${row.first_name} ${row.last_name || ""}`.trim()
      }
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    logger.error("Error joining jumuiya: " + error.message);
    res.status(500).json({ success: false, message: "Failed to join community" });
  }
};


/**
 * PUT /api/jumuiya-members/:id
 * Update a member's details and jumuiya assignment across ALL related tables.
 * Propagates changes to members, import_records, and registered tables.
 */
export const updateJumuiyaMember = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      member_id, first_name, last_name, year_of_study, email, jumuiya_id,
      phone, gender, course,
    } = req.body;

    const newMemberId = member_id && member_id.trim() ? member_id.trim() : null;
    const effectiveId = newMemberId || id;
    const memberIdChanged = newMemberId && newMemberId !== id;

    // Resolve jumuiya slug/UUID to UUID + display name (logic before BEGIN)
    let jumuiyaUuid = null;
    let jumuiyaName = null;
    if (jumuiya_id) {
      jumuiyaUuid = await resolveJumuiyaUuid(jumuiya_id);
      if (jumuiyaUuid) {
        const nameRes = await pool.query("SELECT name FROM sub_groups WHERE group_id = $1", [jumuiyaUuid]);
        jumuiyaName = nameRes.rows[0]?.name || null;
      }
    }

    await pool.query('BEGIN');

    // ── Try members table first ──
    const currentRes = await pool.query(
      "SELECT jumuiya_id, first_name, last_name FROM members WHERE member_id = $1",
      [id]
    );

    if (currentRes.rows.length > 0) {
      // ─── Path A: update members table ───
      const oldJumuiyaId = currentRes.rows[0].jumuiya_id;
      const oldFirstName = currentRes.rows[0].first_name;
      const oldLastName = currentRes.rows[0].last_name;

      if (memberIdChanged) {
        await pool.query("UPDATE members SET member_id = $1 WHERE member_id = $2", [newMemberId, id]);
      }

      await pool.query(
        `UPDATE members
         SET first_name = COALESCE($1, first_name),
             last_name = COALESCE($2, last_name),
             year_of_study = COALESCE($3, year_of_study),
             email = COALESCE($4, email),
             phone = COALESCE($5, phone),
             gender = COALESCE($6, gender),
             course = COALESCE($7, course),
             jumuiya_id = COALESCE($8, jumuiya_id)
         WHERE member_id = $9`,
        [first_name, last_name, year_of_study, email, phone, gender, course, jumuiyaUuid, effectiveId]
      );

      // Sync import_records
      const shouldSync = first_name || last_name || email || phone || gender || course || jumuiya_id;
      if (shouldSync || memberIdChanged) {
        const syncSets = [];
        const syncVals = [];
        let sp = 1;
        if (first_name || last_name) {
          const syncName = `${first_name || oldFirstName} ${last_name || oldLastName}`.trim();
          syncSets.push(`cleaned_name = $${sp++}`); syncVals.push(syncName);
        }
        if (email !== undefined) { syncSets.push(`cleaned_email = $${sp++}`); syncVals.push(email); }
        if (course !== undefined) { syncSets.push(`cleaned_course = $${sp++}`); syncVals.push(course); }
        if (phone !== undefined) { syncSets.push(`cleaned_phone = $${sp++}`); syncVals.push(phone); }
        if (gender !== undefined) { syncSets.push(`cleaned_gender = $${sp++}`); syncVals.push(gender); }
        syncSets.push(`cleaned_jumuiya = $${sp++}`); syncVals.push(jumuiyaName);
        syncVals.push(id);
        await pool.query(`UPDATE import_records SET ${syncSets.join(", ")} WHERE cleaned_reg_number = $${sp}`, syncVals);
        if (memberIdChanged) {
          await pool.query("UPDATE import_records SET cleaned_reg_number = $1 WHERE cleaned_reg_number = $2", [newMemberId, id]);
        }
      }

      // Sync associates table
      {
        const aSets = [];
        const aVals = [];
        let ap = 1;
        if (first_name || last_name) {
          aSets.push(`name = $${ap++}`);
          aVals.push(`${first_name || oldFirstName} ${last_name || oldLastName}`.trim());
        }
        if (email !== undefined) { aSets.push(`email = $${ap++}`); aVals.push(email); }
        if (phone !== undefined) { aSets.push(`phone = $${ap++}`); aVals.push(phone); }
        if (gender !== undefined) { aSets.push(`gender = $${ap++}`); aVals.push(gender); }
        if (jumuiyaName) { aSets.push(`jumuiya_name = $${ap++}`); aVals.push(jumuiyaName); }
        if (jumuiyaUuid) { aSets.push(`jumuiya_id = $${ap++}`); aVals.push(jumuiyaUuid); }
        if (aSets.length > 0) {
          aVals.push(id);
          await pool.query(`UPDATE associates SET ${aSets.join(", ")} WHERE member_id = $${ap}`, aVals);
        }
        if (memberIdChanged) {
          await pool.query("UPDATE associates SET member_id = $1 WHERE member_id = $2", [newMemberId, id]);
        }
      }

      // Registration table sync
      if (oldJumuiyaId || jumuiyaUuid) {
        if (jumuiyaUuid !== oldJumuiyaId) {
          if (oldJumuiyaId) {
            await pool.query("DELETE FROM registered WHERE member_id = $1 AND jumuiya_id = $2", [effectiveId, oldJumuiyaId]);
          }
          if (jumuiyaUuid) {
            await pool.query(
              "INSERT INTO registered (member_id, jumuiya_id, registration_date, status) VALUES ($1, $2, CURRENT_TIMESTAMP, 'active') ON CONFLICT DO NOTHING",
              [effectiveId, jumuiyaUuid]
            );
          }
        }
      }

      await pool.query('COMMIT');

      const result = await pool.query(
        `SELECT m.*, sg.name as jumuiya_name
         FROM members m
         LEFT JOIN sub_groups sg ON m.jumuiya_id = sg.group_id
         WHERE m.member_id = $1`,
        [effectiveId]
      );

      const row = result.rows[0];
      return res.json({
        success: true,
        data: {
          ...row,
          id: row.member_id,
          name: `${row.first_name} ${row.last_name || ""}`.trim()
        }
      });
    }

    // ─── Path B: update import_records and sync to members ───
    const syncSets = [];
    const syncVals = [];
    let sp = 1;
    const syncName = [first_name, last_name].filter(Boolean).join(" ").trim();
    if (syncName) { syncSets.push(`cleaned_name = $${sp++}`); syncVals.push(syncName); }
    if (email !== undefined) { syncSets.push(`cleaned_email = $${sp++}`); syncVals.push(email); }
    if (phone !== undefined) { syncSets.push(`cleaned_phone = $${sp++}`); syncVals.push(phone); }
    if (gender !== undefined) { syncSets.push(`cleaned_gender = $${sp++}`); syncVals.push(gender); }
    syncSets.push(`cleaned_jumuiya = $${sp++}`); syncVals.push(jumuiyaName);
    syncVals.push(id);
    await pool.query(`UPDATE import_records SET ${syncSets.join(", ")} WHERE cleaned_reg_number = $${sp}`, syncVals);
    if (memberIdChanged) {
      await pool.query("UPDATE import_records SET cleaned_reg_number = $1 WHERE cleaned_reg_number = $2", [newMemberId, id]);
    }

    // Also upsert into members table
    await pool.query(`
      INSERT INTO members (member_id, first_name, last_name, email, phone, gender, course, jumuiya_id, source, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'jum', 'valid')
      ON CONFLICT (member_id) DO UPDATE SET
        first_name = COALESCE($2, members.first_name),
        last_name = COALESCE($3, members.last_name),
        email = COALESCE($4, members.email),
        phone = COALESCE($5, members.phone),
        gender = COALESCE($6, members.gender),
        course = COALESCE($7, members.course),
        jumuiya_id = COALESCE($8, members.jumuiya_id)
    `, [effectiveId, first_name || null, last_name || null, email || null, phone || null, gender || null, course || null, jumuiyaUuid]);

    // Sync associates table
    {
      const aSets = [];
      const aVals = [];
      let ap = 1;
      if (first_name || last_name) {
        aSets.push(`name = $${ap++}`);
        aVals.push(`${first_name || ''} ${last_name || ''}`.trim());
      }
      if (email !== undefined) { aSets.push(`email = $${ap++}`); aVals.push(email); }
      if (phone !== undefined) { aSets.push(`phone = $${ap++}`); aVals.push(phone); }
      if (gender !== undefined) { aSets.push(`gender = $${ap++}`); aVals.push(gender); }
      if (jumuiyaName) { aSets.push(`jumuiya_name = $${ap++}`); aVals.push(jumuiyaName); }
      if (jumuiyaUuid) { aSets.push(`jumuiya_id = $${ap++}`); aVals.push(jumuiyaUuid); }
      if (aSets.length > 0) {
        aVals.push(id);
        await pool.query(`UPDATE associates SET ${aSets.join(", ")} WHERE member_id = $${ap}`, aVals);
      }
      if (memberIdChanged) {
        await pool.query("UPDATE associates SET member_id = $1 WHERE member_id = $2", [newMemberId, id]);
      }
    }

    await pool.query('COMMIT');

    return res.json({
      success: true,
      data: {
        member_id: effectiveId,
        id: effectiveId,
        name: syncName || effectiveId,
        first_name: first_name || null,
        last_name: last_name || null,
        email: email || null,
        course: course || null,
        phone: phone || null,
        gender: gender || null,
        jumuiya_name: jumuiyaName,
        jumuiya_id: jumuiyaUuid,
        source: "jum",
      }
    });

  } catch (error) {
    try { await pool.query('ROLLBACK'); } catch (_) { /* no active txn */ }
    logger.error(`Error updating jumuiya member: ${error.message} | stack: ${error.stack}`);
    res.status(500).json({ success: false, message: "Failed to update member" });
  }
};


/**
 * DELETE /api/jumuiya-members/:id
 * Permanently delete a member from ALL tables in the system.
 * Cleans up members, registered, import_records, group_assignments, allocation_approvals, associates.
 */
export const deleteJumuiyaMember = async (req, res) => {
  try {
    const { id } = req.params; // member_id

    await pool.query('BEGIN');

    await pool.query("DELETE FROM registered WHERE member_id = $1", [id]);
    await pool.query("DELETE FROM group_assignments WHERE member_id = $1", [id]);
    await pool.query("DELETE FROM allocation_approvals WHERE member_id = $1", [id]);
    await pool.query("DELETE FROM import_records WHERE cleaned_reg_number = $1", [id]);
    await pool.query("DELETE FROM associates WHERE member_id = $1", [id]);

    const result = await pool.query(
      "DELETE FROM members WHERE member_id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ success: false, message: "Member not found" });
    }

    await pool.query('COMMIT');

    res.json({ success: true, message: "Member permanently removed from the system" });
  } catch (error) {
    await pool.query('ROLLBACK');
    logger.error("Error deleting jumuiya member: " + error.message);
    res.status(500).json({ success: false, message: "Failed to delete member" });
  }
};


/**
 * GET /api/jumuiya-members/unregistered
 */
export const getUnregisteredMembers = async (req, res) => {
  try {
    const { jumuiya_id } = req.query;

    let query = `
      SELECT 
        m.member_id, m.first_name, m.last_name, m.email, m.year_of_study, m.jumuiya_id,
        sg.name as jumuiya_name
      FROM members m
      LEFT JOIN registered r ON m.member_id = r.member_id
      LEFT JOIN sub_groups sg ON m.jumuiya_id = sg.group_id
      WHERE r.member_id IS NULL
    `;

    const queryParams = [];
    if (jumuiya_id) {
       // Optional: Filter logic if we specifically want to prioritize some, 
       // but for now, we show everyone requested by the user.
       // However, we'll keep the param for frontend compatibility.
    }

    query += ` ORDER BY m.first_name ASC`;

    const result = await pool.query(query, queryParams);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    logger.error("Error fetching unregistered members: " + error.message);
    res.status(500).json({ success: false, error: "Failed to fetch unregistered members" });
  }
};

/**
 * POST /api/jumuiya-members/bulk-join
 */
export const bulkJoinJumuiya = async (req, res) => {
  try {
    const { member_ids, jumuiya_id } = req.body;

    if (!Array.isArray(member_ids) || member_ids.length === 0 || !jumuiya_id) {
      return res.status(400).json({ success: false, message: "member_ids (array) and jumuiya_id are required" });
    }

    // Start Transaction
    await pool.query('BEGIN');

    // 1. Update members table directly
    const updateResult = await pool.query(
      `UPDATE members 
       SET jumuiya_id = $1 
       WHERE member_id = ANY($2) 
       RETURNING *`,
      [jumuiya_id, member_ids]
    );

    // 2. Insert into registered table
    // This officially registers the members in the community
    await pool.query(
      `INSERT INTO registered (member_id, jumuiya_id, registration_date, status) 
       SELECT unnest($1::text[]), $2, CURRENT_TIMESTAMP, 'active'
       ON CONFLICT DO NOTHING`,
      [member_ids, jumuiya_id]
    );

    await pool.query('COMMIT');

    res.status(200).json({ 
      success: true, 
      message: `Successfully registered ${updateResult.rows.length} members`,
      count: updateResult.rows.length
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    logger.error("Error in bulk join: " + error.message);
    res.status(500).json({ success: false, message: "Failed to register members in bulk" });
  }
};


/**
 * POST /api/jumuiya-members/bulk-register-with-payment
 * Register multiple members after a single STK Push payment for the total amount.
 */
export const bulkRegisterWithPayment = async (req, res) => {
  const { member_ids, jumuiya_id, phoneNumber, amount } = req.body;

  if (!Array.isArray(member_ids) || member_ids.length === 0 || !jumuiya_id || !phoneNumber || !amount) {
    return res.status(400).json({ 
      success: false, 
      message: "member_ids (array), jumuiya_id, phoneNumber, and amount are required" 
    });
  }

  try {
    logger.info(`Initiating bulk registration payment for ${member_ids.length} members to jumuiya ${jumuiya_id}`);

    // 1. Trigger STK Push and wait for result
    // We use the first member_id as the user_id for the mpesa_request record
    const paymentResult = await payAndWait(member_ids[0], phoneNumber, amount);

    if (paymentResult.status !== "success") {
      return res.status(402).json({ 
        success: false, 
        message: paymentResult.message || "Payment failed or timed out. Please try again." 
      });
    }

    // 2. If payment success, proceed with bulk registration logic
    // Start Transaction
    await pool.query('BEGIN');

    // Update members table directly
    const updateResult = await pool.query(
      `UPDATE members 
       SET jumuiya_id = $1 
       WHERE member_id = ANY($2) 
       RETURNING *`,
      [jumuiya_id, member_ids]
    );

    // Insert into registered table
    await pool.query(
      `INSERT INTO registered (member_id, jumuiya_id, registration_date, status) 
       SELECT unnest($1::text[]), $2, CURRENT_TIMESTAMP, 'active'
       ON CONFLICT DO NOTHING`,
      [member_ids, jumuiya_id]
    );

    await pool.query('COMMIT');

    res.status(200).json({ 
      success: true, 
      message: `Payment successful and ${updateResult.rows.length} members registered!`,
      count: updateResult.rows.length
    });

  } catch (error) {
    if (pool) await pool.query('ROLLBACK');
    logger.error("Error in bulkRegisterWithPayment: " + error.message);
    res.status(500).json({ success: false, message: "Internal server error during bulk registration" });
  }
};


/**
 * GET /api/jumuiya-members/registered?jumuiya_id=st-anthony
 * Fetch ONLY registered members for a specific jumuiya.
 */
export const getRegisteredJumuiyaMembers = async (req, res) => {
  try {
    const { jumuiya_id } = req.query;

    const resolvedUuid = await resolveJumuiyaUuid(jumuiya_id);

    let query = `
      SELECT 
        r.id as registration_id,
        r.registration_date,
        m.member_id as id,
        m.first_name,
        m.last_name,
        m.course,
        m.year_of_study as year,
        m.jumuiya_id,
        sg.name as jumuiya_name,
        true as is_registered,
        m.source,
        m.status as import_status
      FROM registered r
      JOIN members m ON r.member_id = m.member_id
      LEFT JOIN sub_groups sg ON m.jumuiya_id = sg.group_id
      WHERE r.status = 'active'
        AND (m.migrated_to_associates IS NULL OR m.migrated_to_associates = false)
    `;

    const queryParams = [];
    if (resolvedUuid) {
      query += ` AND r.jumuiya_id = $1`;
      queryParams.push(resolvedUuid);
    }

    query += ` ORDER BY m.first_name ASC`;

    const result = await pool.query(query, queryParams);

    const formatted = result.rows.map(row => ({
      ...row,
      name: `${row.first_name} ${row.last_name || ""}`.trim(),
      is_current_jumuiya: true,
      jumuiya_id: jumuiya_id || row.jumuiya_id,
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    logger.error("Error fetching registered members: " + error.message);
    res.status(500).json({ success: false, error: "Failed to fetch registered members" });
  }
};

/**
 * GET /api/jumuiya-members/registered/all
 * Fetch all registered members across all Jumuiyas (for CSA Secretary).
 * Only returns members with an active row in the registered table.
 */
export const getAllRegisteredMembers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        r.id as registration_id,
        r.serial_no,
        r.registration_date,
        m.member_id as id,
        m.member_id as reg_number,
        m.first_name,
        m.last_name,
        m.email,
        m.course,
        m.year_of_study as year,
        m.jumuiya_id,
        sg.name as jumuiya_name,
        LOWER(REPLACE(REPLACE(sg.name, '.', ''), ' ', '-')) as jumuiya_slug,
        m.sem_1_reg, m.sem_2_reg, m.sem_3_reg, m.sem_4_reg,
        m.sem_5_reg, m.sem_6_reg, m.sem_7_reg, m.sem_8_reg
      FROM registered r
      JOIN members m ON r.member_id = m.member_id
      LEFT JOIN sub_groups sg ON m.jumuiya_id = sg.group_id
      WHERE (m.migrated_to_associates IS NULL OR m.migrated_to_associates = false)
        AND r.status = 'active'
      ORDER BY sg.name, m.first_name ASC
    `);

    const formatted = result.rows.map(row => ({
      ...row,
      name: `${row.first_name} ${row.last_name || ""}`.trim(),
      semester_count: [row.sem_1_reg, row.sem_2_reg, row.sem_3_reg, row.sem_4_reg,
                       row.sem_5_reg, row.sem_6_reg, row.sem_7_reg, row.sem_8_reg]
                       .filter(Boolean).length,
    }));

    res.json({ success: true, data: formatted, total: formatted.length });
  } catch (error) {
    logger.error("Error fetching all registered members: " + error.message);
    res.status(500).json({ success: false, error: "Failed to fetch all registered members" });
  }
};

/**
 * POST /api/jumuiya-members/registered/manual
 * CSA Secretary manually registers a member (cash/direct registration).
 * Sets jumuiya, semester flags, and creates the registered row.
 */
export const manualRegisterMember = async (req, res) => {
  try {
    const { member_id, jumuiya_id, semesters, serial_no } = req.body;

    if (!member_id || !jumuiya_id) {
      return res.status(400).json({ success: false, message: "member_id and jumuiya_id are required" });
    }

    await pool.query("BEGIN");

    // 1. Verify member exists
    const member = await pool.query("SELECT * FROM members WHERE member_id = $1", [member_id]);
    if (member.rows.length === 0) {
      await pool.query("ROLLBACK");
      return res.status(404).json({ success: false, message: "Member not found" });
    }

    // 2. Update members table — set jumuiya and semester flags
    const semUpdates = [];
    const semVals = [];
    let idx = 2;
    const SEM_COLS = ["sem_1_reg", "sem_2_reg", "sem_3_reg", "sem_4_reg",
                      "sem_5_reg", "sem_6_reg", "sem_7_reg", "sem_8_reg"];
    for (const col of SEM_COLS) {
      const val = Array.isArray(semesters) ? semesters.includes(col) : false;
      semUpdates.push(`${col} = $${idx++}`);
      semVals.push(val);
    }
    semVals.push(member_id);
    await pool.query(
      `UPDATE members SET jumuiya_id = $1, ${semUpdates.join(", ")} WHERE member_id = $${idx}`,
      [jumuiya_id, ...semVals]
    );

    // 3. Insert into registered (idempotent)
    await pool.query(
      `INSERT INTO registered (member_id, jumuiya_id, registration_date, status, serial_no)
       VALUES ($1, $2, CURRENT_TIMESTAMP, 'active', $3)
       ON CONFLICT DO NOTHING`,
      [member_id, jumuiya_id, serial_no || null]
    );

    await pool.query("COMMIT");

    const row = member.rows[0];
    res.status(200).json({
      success: true,
      message: `Member ${member_id} registered successfully`,
      data: { id: row.member_id, name: `${row.first_name} ${row.last_name || ""}`.trim() },
    });
  } catch (error) {
    await pool.query("ROLLBACK");
    logger.error("Error in manualRegisterMember: " + error.message);
    res.status(500).json({ success: false, error: "Failed to register member" });
  }
};

/**
 * DELETE /api/jumuiya-members/unregister/:id
 * Remove member from a Jumuiya registration but keep them in the database.
 */
export const unregisterJumuiyaMember = async (req, res) => {
  try {
    const { id } = req.params; // member_id

    // Start Transaction
    await pool.query('BEGIN');

    // 1. Remove from registered table
    await pool.query("DELETE FROM registered WHERE member_id = $1", [id]);

    // 2. Clear jumuiya_id in members table
    const result = await pool.query(
      "UPDATE members SET jumuiya_id = NULL WHERE member_id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ success: false, message: "Member not found" });
    }

    await pool.query('COMMIT');

    res.json({ 
      success: true, 
      message: "Member unregistered from Jumuiya successfully",
      data: result.rows[0]
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    logger.error("Error unregistering member: " + error.message);
    res.status(500).json({ success: false, message: "Failed to unregister member" });
  }
};


/**
 * POST /api/jumuiya-members/register-with-payment
 * Register a member after a successful STK Push payment.
 */
export const registerWithPayment = async (req, res) => {
  const { member_id, jumuiya_id, phoneNumber, amount } = req.body;

  if (!member_id || !jumuiya_id || !phoneNumber || !amount) {
    return res.status(400).json({ 
      success: false, 
      message: "member_id, jumuiya_id, phoneNumber, and amount are required" 
    });
  }

  try {
    logger.info(`Initiating registration payment for member ${member_id} to jumuiya ${jumuiya_id}`);

    // 1. Trigger STK Push and wait for result
    const paymentResult = await payAndWait(member_id, phoneNumber, amount);

    if (paymentResult.status !== "success") {
      return res.status(402).json({ 
        success: false, 
        message: paymentResult.message || "Payment failed or timed out. Please try again." 
      });
    }

    // 2. If payment success, proceed with registration logic
    // Start Transaction
    await pool.query('BEGIN');

    // Update members table
    await pool.query(
      `UPDATE members SET jumuiya_id = $1 WHERE member_id = $2`,
      [jumuiya_id, member_id]
    );

    // Fetch updated member with jumuiya name via JOIN
    const updateResult = await pool.query(
      `SELECT m.*, sg.name as jumuiya_name
       FROM members m
       LEFT JOIN sub_groups sg ON m.jumuiya_id = sg.group_id
       WHERE m.member_id = $1`,
      [member_id]
    );

    if (updateResult.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ success: false, message: "Member not found" });
    }

    // Insert into registered table
    await pool.query(
      `INSERT INTO registered (member_id, jumuiya_id, registration_date, status) 
       VALUES ($1, $2, CURRENT_TIMESTAMP, 'active')
       ON CONFLICT DO NOTHING`, 
      [member_id, jumuiya_id]
    );

    await pool.query('COMMIT');

    const row = updateResult.rows[0];
    const memberName = `${row.first_name} ${row.last_name || ""}`.trim();
    const jumuiyaName = row.jumuiya_name || 'your community';

    // Send confirmation email (non-blocking)
    if (row.email && process.env.MAIL_USER && process.env.MAIL_PASS) {
      mailTransporter.sendMail({
        from: process.env.MAIL_USER,
        to: row.email,
        subject: `Registration Confirmed — ${jumuiyaName}`,
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="color: #16a34a; margin: 0;">Registration Confirmed</h2>
              <p style="color: #64748b; font-size: 0.9rem;">${jumuiyaName}</p>
            </div>
            <p style="color: #475569; font-size: 0.95rem; line-height: 1.6;">
              Hi ${memberName},
            </p>
            <p style="color: #475569; font-size: 0.95rem; line-height: 1.6;">
              Your registration to <strong>${jumuiyaName}</strong> has been confirmed and your payment of <strong>KES ${REGISTRATION_FEE}</strong> has been received.
            </p>
            <p style="color: #475569; font-size: 0.95rem; line-height: 1.6;">
              You can now view and download your Semester Stamp Card from the community page.
            </p>
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 24px 0;">
              <p style="margin: 0 0 8px; color: #166534; font-size: 0.85rem;"><strong>Member:</strong> ${memberName}</p>
              <p style="margin: 0 0 8px; color: #166534; font-size: 0.85rem;"><strong>Community:</strong> ${jumuiyaName}</p>
              <p style="margin: 0 0 8px; color: #166534; font-size: 0.85rem;"><strong>Registration ID:</strong> ${row.member_id}</p>
              <p style="margin: 0; color: #166534; font-size: 0.85rem;"><strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <p style="color: #94a3b8; font-size: 0.8rem; text-align: center; margin-top: 32px;">
              This is an automated message from the Campus Catholic Community registration system.
            </p>
          </div>
        `,
      }).catch(err => logger.error("Failed to send registration confirmation email: " + err.message));
    }

    res.status(200).json({ 
      success: true, 
      message: "Payment successful and registration complete!",
      data: {
        ...row,
        id: row.member_id,
        name: memberName
      }
    });

  } catch (error) {
    if (pool) await pool.query('ROLLBACK');
    logger.error("Error in registerWithPayment: " + error.message);
    res.status(500).json({ success: false, message: "Internal server error during registration" });
  }
};

/**
 * GET /api/jumuiya-members/all
 * Returns ALL members across ALL jumuiyas (unfiltered).
 * Combines legacy members, CSA-distributed, and direct processed imports.
 * Used by the "All CSA Members" admin view.
 */
export const getAllMembersAcrossJumuiyas = async (req, res) => {
  try {
    const merged = await fetchAllMembers(null);
    res.json({ success: true, data: merged });
  } catch (error) {
    logger.error("Error fetching all members across jumuiyas: " + error.message);
    res.status(500).json({ success: false, error: "Failed to fetch members" });
  }
};

/**
 * GET /api/jumuiya-members/lookup
 * Returns a full slug → name mapping for all Jumuiyas.
 * Useful for the frontend to translate IDs to display names.
 */
export const getJumuiyaLookup = async (req, res) => {
  try {
    const result = await pool.query("SELECT group_id, name, full_name FROM sub_groups ORDER BY name ASC");
    const lookup = {};
    result.rows.forEach(row => {
      lookup[row.group_id] = { name: row.name, fullName: row.full_name || row.name };
    });
    res.json({ success: true, data: lookup });
  } catch (error) {
    logger.error("Error fetching jumuiya lookup: " + error.message);
    res.status(500).json({ success: false, error: "Failed to fetch jumuiya lookup" });
  }
};

/**
 * POST /api/jumuiya-members/send-stamp-card
 * Emails a PDF stamp card to the member's email as an attachment.
 */
export const sendStampCard = async (req, res) => {
  try {
    const { email, pdfBase64, memberName, jumuiyaName } = req.body;
    if (!email || !pdfBase64) {
      return res.status(400).json({ success: false, error: "Email and PDF data are required" });
    }

    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
      logger.warn("Email not configured: MAIL_USER / MAIL_PASS missing in .env");
      return res.status(500).json({ success: false, error: "Email service is not configured. Please contact the admin." });
    }

    const pdfBuffer = Buffer.from(pdfBase64, 'base64');

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: `Your Semester Stamp Card - ${jumuiyaName || 'Community'}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #1e293b; margin: 0;">Your Semester Stamp Card</h2>
            <p style="color: #64748b; font-size: 0.9rem;">${jumuiyaName || 'Community'} &middot; ${memberName || ''}</p>
          </div>
          <p style="color: #475569; font-size: 0.95rem; line-height: 1.6;">
            Thank you for registering! Your semester stamp card is attached to this email.
            Please keep it for your records. You will receive a new stamp after each semester registration.
          </p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0 0 8px; color: #64748b; font-size: 0.85rem;"><strong>Member:</strong> ${memberName || '—'}</p>
            <p style="margin: 0 0 8px; color: #64748b; font-size: 0.85rem;"><strong>Community:</strong> ${jumuiyaName || '—'}</p>
            <p style="margin: 0; color: #64748b; font-size: 0.85rem;"><strong>Sent:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <p style="color: #94a3b8; font-size: 0.8rem; text-align: center; margin-top: 32px;">
            This is an automated message from the Campus Catholic Community registration system.
          </p>
        </div>
      `,
      attachments: [{
        filename: `Stamp_Card_${memberName ? memberName.replace(/\s+/g, '_') : 'member'}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      }],
    };

    await mailTransporter.sendMail(mailOptions);
    logger.info(`Stamp card emailed to ${email}`);
    res.json({ success: true, message: "Stamp card sent to your email" });
  } catch (error) {
    logger.error("Error sending stamp card email: " + error.message);
    res.status(500).json({ success: false, error: error.message || "Failed to send stamp card email" });
  }
};
