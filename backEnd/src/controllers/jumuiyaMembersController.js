import { testDb as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";
import { payAndWait } from "./stkPush/stkHelper.js";

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
 * Internal: fetch members from all three sources (legacy, CSA, direct imports).
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

  // ── Part 1: legacy members table ──
  let legacyQuery = `
    SELECT 
      m.member_id as id,
      m.first_name,
      m.last_name,
      m.email,
      m.phone,
      m.gender,
      m.year_of_study as year,
      m.jumuiya_id,
      sg.name as jumuiya_name,
      (r.member_id IS NOT NULL) as is_registered,
      m.sem_1_reg, m.sem_2_reg, m.sem_3_reg, m.sem_4_reg,
      m.sem_5_reg, m.sem_6_reg, m.sem_7_reg, m.sem_8_reg,
      m.join_date,
      'legacy' as source
    FROM members m
    LEFT JOIN registered r ON m.member_id = r.member_id AND r.jumuiya_id = m.jumuiya_id
    LEFT JOIN sub_groups sg ON m.jumuiya_id = sg.group_id
    WHERE (m.migrated_to_associates IS NULL OR m.migrated_to_associates = false)
  `;

  const legacyParams = [];
  if (resolvedUuid) {
    legacyQuery += ` AND m.jumuiya_id = $1`;
    legacyParams.push(resolvedUuid);
  }

  legacyQuery += ` ORDER BY m.first_name ASC`;

  const legacyResult = await pool.query(legacyQuery, legacyParams);

  const formattedLegacy = legacyResult.rows.map(row => {
    const firstName = row.first_name || "";
    const lastName = row.last_name || "";
    const fullName = [firstName, lastName].filter(Boolean).join(" ").trim() || row.id || "Unknown";
    return {
      ...row,
      name: fullName,
      member_id: row.id,
      year: row.year || deriveYearFromReg(row.id),
      is_current_jumuiya: !!(resolvedUuid && row.jumuiya_id === resolvedUuid),
      jumuiya_id: jumuiya_id || row.jumuiya_id,
      import_status: null,
    };
  });

  // ── Part 2: CSA-distributed import records ──
  let csaQuery = `
    SELECT 
      ir.id,
      ir.cleaned_name as name,
      ir.cleaned_reg_number as member_id,
      NULL as first_name,
      NULL as last_name,
      ir.cleaned_email as email,
      NULL as phone,
      ir.cleaned_gender as gender,
      NULL as year,
      csa_sg.group_id as jumuiya_uuid,
      csa_sg.name as jumuiya_name,
      false as is_registered,
      NULL as sem_1_reg, NULL as sem_2_reg, NULL as sem_3_reg, NULL as sem_4_reg,
      NULL as sem_5_reg, NULL as sem_6_reg, NULL as sem_7_reg, NULL as sem_8_reg,
      NULL as join_date,
      'csa' as source,
      ir.status as import_status
    FROM import_records ir
    JOIN member_imports mi ON mi.id = ir.import_id
    LEFT JOIN sub_groups csa_sg ON csa_sg.name = ir.cleaned_jumuiya
    WHERE mi.jumuiya_id = 'csa' AND ir.status IN ('valid', 'warning')
      AND csa_sg.group_id IS NOT NULL
      AND (ir.migrated_to_associates IS NULL OR ir.migrated_to_associates = false)
  `;
  const csaParams = [];
  if (resolvedUuid) {
    csaQuery += ` AND csa_sg.group_id = $1`;
    csaParams.push(resolvedUuid);
  }
  const csaResult = await pool.query(csaQuery, csaParams);

  const formattedCSA = csaResult.rows.map(row => ({
    ...row,
    year: row.year || deriveYearFromReg(row.member_id),
    jumuiya_id: jumuiya_id || row.jumuiya_uuid || row.jumuiya_name,
    is_current_jumuiya: !!(resolvedUuid && row.jumuiya_uuid === resolvedUuid),
  }));

  // ── Part 3: Direct per-jumuiya processed imports ──
  let directQuery = `
    SELECT 
      ir.id,
      ir.cleaned_reg_number as member_id,
      ir.cleaned_name as name,
      NULL as first_name,
      NULL as last_name,
      ir.cleaned_email as email,
      ir.cleaned_phone as phone,
      ir.cleaned_gender as gender,
      NULL as year,
      mi.jumuiya_id as import_slug,
      'import' as source,
      ir.status as import_status
    FROM import_records ir
    JOIN member_imports mi ON mi.id = ir.import_id
    WHERE mi.jumuiya_id != 'csa' AND mi.status = 'processed'
      AND ir.status IN ('valid', 'warning')
      AND (ir.migrated_to_associates IS NULL OR ir.migrated_to_associates = false)
  `;
  const directParams = [];
  if (resolvedUuid) {
    directQuery += ` AND mi.jumuiya_id = $1`;
    directParams.push(jumuiya_id);
  }
  directQuery += ` ORDER BY ir.cleaned_name ASC`;

  const directResult = await pool.query(directQuery, directParams);

  const getJumuiyaNameFromId = (slug) => {
    const map = {
      "st-anthony": "St. Anthony", "st-augustine": "St. Augustine",
      "st-catherine": "St. Catherine", "st-dominic": "St. Dominic",
      "st-elizabeth": "St. Elizabeth", "st-maria-goretti": "St. Maria Goretti",
      "st-monica": "St. Monica",
    };
    return map[slug] || slug;
  };

  const formattedDirect = directResult.rows.map(row => {
    const slug = jumuiya_id || row.import_slug;
    return {
      id: row.id,
      name: row.name,
      member_id: row.member_id,
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email,
      phone: row.phone,
      gender: row.gender,
      year: row.year || deriveYearFromReg(row.member_id),
      jumuiya_name: getJumuiyaNameFromId(slug || ""),
      jumuiya_id: slug || row.member_id,
      is_registered: false,
      sem_1_reg: null, sem_2_reg: null, sem_3_reg: null, sem_4_reg: null,
      sem_5_reg: null, sem_6_reg: null, sem_7_reg: null, sem_8_reg: null,
      source: row.source,
      import_status: row.import_status,
      join_date: null,
      is_current_jumuiya: true,
    };
  });

  // ── Merge (dedup by member_id when available, fallback to name|jumuiya_id for CSA) ──
  const seen = new Set();
  const merged = [...formattedLegacy, ...formattedCSA, ...formattedDirect].filter(row => {
    const dedupKey = row.member_id
      ? `id:${row.member_id.toString().toLowerCase()}`
      : `${row.name}|${row.jumuiya_id}`;
    if (seen.has(dedupKey)) return false;
    seen.add(dedupKey);
    return true;
  });

  return merged;
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
      phone, gender,
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
             jumuiya_id = COALESCE($7, jumuiya_id)
         WHERE member_id = $8`,
        [first_name, last_name, year_of_study, email, phone, gender, jumuiyaUuid, effectiveId]
      );

      // Sync import_records
      const shouldSync = first_name || last_name || email || phone || gender || jumuiya_id;
      if (shouldSync || memberIdChanged) {
        const syncSets = [];
        const syncVals = [];
        let sp = 1;
        if (first_name || last_name) {
          const syncName = `${first_name || oldFirstName} ${last_name || oldLastName}`.trim();
          syncSets.push(`cleaned_name = $${sp++}`); syncVals.push(syncName);
        }
        if (email !== undefined) { syncSets.push(`cleaned_email = $${sp++}`); syncVals.push(email); }
        if (phone !== undefined) { syncSets.push(`cleaned_phone = $${sp++}`); syncVals.push(phone); }
        if (gender !== undefined) { syncSets.push(`cleaned_gender = $${sp++}`); syncVals.push(gender); }
        syncSets.push(`cleaned_jumuiya = $${sp++}`); syncVals.push(jumuiyaName);
        syncVals.push(id);
        await pool.query(`UPDATE import_records SET ${syncSets.join(", ")} WHERE cleaned_reg_number = $${sp}`, syncVals);
        if (memberIdChanged) {
          await pool.query("UPDATE import_records SET cleaned_reg_number = $1 WHERE cleaned_reg_number = $2", [newMemberId, id]);
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

    // ─── Path B: update import_records only ───
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
        phone: phone || null,
        gender: gender || null,
        jumuiya_name: jumuiyaName,
        jumuiya_id: jumuiyaUuid,
        source: "import",
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
 * Cleans up members, registered, import_records, group_assignments, allocation_approvals.
 */
export const deleteJumuiyaMember = async (req, res) => {
  try {
    const { id } = req.params; // member_id
    
    // Start Transaction
    await pool.query('BEGIN');

    // 1. Remove from registered table
    await pool.query("DELETE FROM registered WHERE member_id = $1", [id]);

    // 2. Find matching import_records to also clean up child references
    const importRecs = await pool.query(
      "SELECT id FROM import_records WHERE cleaned_reg_number = $1",
      [id]
    );
    const importRecIds = importRecs.rows.map(r => r.id);

    if (importRecIds.length > 0) {
      // 3. Remove group_assignments linked to these import_records
      await pool.query("DELETE FROM group_assignments WHERE import_record_id = ANY($1::int[])", [importRecIds]);

      // 4. Remove allocation_approvals linked to these import_records
      await pool.query("DELETE FROM allocation_approvals WHERE import_record_id = ANY($1::int[])", [importRecIds]);

      // 5. Remove the import_records themselves
      await pool.query("DELETE FROM import_records WHERE id = ANY($1::int[])", [importRecIds]);
    }

    // 6. Totally remove member from members database
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
 * Fetch members from the 'registered' table.
 */
export const getRegisteredJumuiyaMembers = async (req, res) => {
  try {
    const { jumuiya_id } = req.query;

    // Resolve slug → UUID
    const resolvedUuid = await resolveJumuiyaUuid(jumuiya_id);

    let query = `
      SELECT 
        r.id as registration_id,
        r.registration_date,
        m.member_id as id,
        m.first_name,
        m.last_name,
        m.email,
        m.year_of_study as year,
        m.jumuiya_id,
        sg.name as jumuiya_name,
        true as is_registered,
        'legacy' as source,
        null as import_status
      FROM registered r
      JOIN members m ON r.member_id = m.member_id
      LEFT JOIN sub_groups sg ON m.jumuiya_id = sg.group_id
    `;

    const queryParams = [];
    if (resolvedUuid) {
      query += ` WHERE r.jumuiya_id = $1`;
      queryParams.push(resolvedUuid);
    }

    query += ` ORDER BY m.first_name ASC`;

    const legacyResult = await pool.query(query, queryParams);

    const formattedLegacy = legacyResult.rows.map(row => ({
      ...row,
      name: `${row.first_name} ${row.last_name || ""}`.trim(),
      is_current_jumuiya: true,
      jumuiya_id: jumuiya_id || row.jumuiya_id,
    }));

    // Also include import_records (not yet registered, but present)
    let importQuery = `
      SELECT 
        ir.id,
        ir.cleaned_name as name,
        NULL as first_name,
        NULL as last_name,
        ir.cleaned_email as email,
        NULL as year,
        sg.group_id as jumuiya_uuid,
        sg.name as jumuiya_name,
        false as is_registered,
        'import' as source,
        ir.status as import_status
      FROM import_records ir
      JOIN member_imports mi ON mi.id = ir.import_id
      LEFT JOIN sub_groups sg ON sg.name = ir.cleaned_jumuiya
      WHERE ir.status IN ('valid', 'warning')
    `;

    const importParams = [];
    if (resolvedUuid) {
      importQuery += ` AND sg.group_id = $1`;
      importParams.push(resolvedUuid);
    }

    importQuery += ` ORDER BY ir.cleaned_name ASC`;

    const importResult = await pool.query(importQuery, importParams);

    const formattedImport = importResult.rows.map(row => {
      const { jumuiya_uuid, ...rest } = row;
      return {
        ...rest,
        jumuiya_id: jumuiya_id || jumuiya_uuid,
        is_current_jumuiya: true,
      };
    });

    // Merge: deduplicate by name + jumuiya_id
    const seen = new Set();
    const merged = [...formattedLegacy, ...formattedImport].filter(row => {
      const key = `${row.name}|${row.jumuiya_id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    res.json({ success: true, data: merged });
  } catch (error) {
    logger.error("Error fetching registered members: " + error.message);
    res.status(500).json({ success: false, error: "Failed to fetch registered members" });
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
    res.status(200).json({ 
      success: true, 
      message: "Payment successful and registration complete!",
      data: {
        ...row,
        id: row.member_id,
        name: `${row.first_name} ${row.last_name || ""}`.trim()
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
