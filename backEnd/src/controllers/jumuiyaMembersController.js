import { testDb as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";

/**
 * GET /api/jumuiya-members?jumuiya_id=st-anthony
 * Fetch all members who are registered to a jumuiya.
 * Queries members table directly where jumuiya_id matches.
 */
export const getAllJumuiyaMembers = async (req, res) => {
  try {
    const { jumuiya_id } = req.query;
    
    // If jumuiya_id is provided, filter the results to only show members of that community.
    // This provides data isolation between different Jumuiyas.
    let query = `
      SELECT 
        member_id as id,
        first_name,
        last_name,
        email,
        year_of_study as year,
        jumuiya_id,
        (jumuiya_id IS NOT NULL) as is_registered,
        sem_1_reg, sem_2_reg, sem_3_reg, sem_4_reg,
        sem_5_reg, sem_6_reg, sem_7_reg, sem_8_reg
      FROM members
    `;
    
    const queryParams = [];
    if (jumuiya_id) {
      query += ` WHERE jumuiya_id = $1`;
      queryParams.push(jumuiya_id);
    }
    
    query += ` ORDER BY first_name ASC`;
    
    const result = await pool.query(query, queryParams);

    // Map fields and add current membership status
    const formattedData = result.rows.map(row => ({
      ...row,
      name: `${row.first_name} ${row.last_name || ""}`.trim(),
      is_current_jumuiya: jumuiya_id ? (row.jumuiya_id === jumuiya_id) : false
    }));

    res.json({ success: true, data: formattedData });
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
    const updateResult = await pool.query(
      `UPDATE members SET jumuiya_id = $1 WHERE member_id = $2 RETURNING *`,
      [jumuiya_id, member_id]
    );

    if (updateResult.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ success: false, message: "Member not found" });
    }

    // 2. Insert into registered table
    // Check if already registered first to avoid duplicates if necessary, 
    // though the UI should prevent this.
    await pool.query(
      `INSERT INTO registered (member_id, jumuiya_id, registration_date, status) 
       VALUES ($1, $2, CURRENT_TIMESTAMP, 'active')
       ON CONFLICT DO NOTHING`, 
      [member_id, jumuiya_id]
    );

    await pool.query('COMMIT');

    res.status(200).json({ 
      success: true, 
      message: "Successfully joined the community",
      data: {
        ...updateResult.rows[0],
        id: updateResult.rows[0].member_id,
        name: `${updateResult.rows[0].first_name} ${updateResult.rows[0].last_name || ""}`.trim()
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
 * Update a membership record (actually updates member details in this case)
 */
export const updateJumuiyaMember = async (req, res) => {
  try {
    const { id } = req.params; // Expect member_id
    const { 
      first_name, last_name, year_of_study, email, jumuiya_id,
      sem_1_reg, sem_2_reg, sem_3_reg, sem_4_reg,
      sem_5_reg, sem_6_reg, sem_7_reg, sem_8_reg
    } = req.body;

    // Start Transaction
    await pool.query('BEGIN');

    // 1. Get current membership info for syncing
    const currentRes = await pool.query("SELECT jumuiya_id FROM members WHERE member_id = $1", [id]);
    if (currentRes.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ success: false, message: "Member not found" });
    }
    const oldJumuiyaId = currentRes.rows[0].jumuiya_id;

    // 2. Update member details
    const result = await pool.query(
      `UPDATE members
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           year_of_study = COALESCE($3, year_of_study),
           email = COALESCE($4, email),
           jumuiya_id = COALESCE($14, jumuiya_id),
           sem_1_reg = COALESCE($6, sem_1_reg),
           sem_2_reg = COALESCE($7, sem_2_reg),
           sem_3_reg = COALESCE($8, sem_3_reg),
           sem_4_reg = COALESCE($9, sem_4_reg),
           sem_5_reg = COALESCE($10, sem_5_reg),
           sem_6_reg = COALESCE($11, sem_6_reg),
           sem_7_reg = COALESCE($12, sem_7_reg),
           sem_8_reg = COALESCE($13, sem_8_reg)
       WHERE member_id = $5 RETURNING *`,
      [
        first_name, last_name, year_of_study, email, id,
        sem_1_reg, sem_2_reg, sem_3_reg, sem_4_reg,
        sem_5_reg, sem_6_reg, sem_7_reg, sem_8_reg,
        jumuiya_id
      ]
    );

    // 3. Sync Registration Table if jumuiya_id actually changed
    // We only sync if jumuiya_id was explicitly provided in the request
    if (jumuiya_id !== undefined && jumuiya_id !== oldJumuiyaId) {
      // Remove old registration link
      if (oldJumuiyaId) {
        await pool.query("DELETE FROM registered WHERE member_id = $1 AND jumuiya_id = $2", [id, oldJumuiyaId]);
      }
      
      // Add new registration link if they were moved TO a jumuiya (not unassigned)
      if (jumuiya_id) {
        await pool.query(
          "INSERT INTO registered (member_id, jumuiya_id, registration_date, status) VALUES ($1, $2, CURRENT_TIMESTAMP, 'active')",
          [id, jumuiya_id]
        );
      }
    }

    await pool.query('COMMIT');

    res.json({ 
      success: true, 
      data: {
        ...result.rows[0],
        id: result.rows[0].member_id,
        name: `${result.rows[0].first_name} ${result.rows[0].last_name || ""}`.trim()
      }
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    logger.error("Error updating jumuiya member: " + error.message);
    res.status(500).json({ success: false, message: "Failed to update member" });
  }
};


/**
 * DELETE /api/jumuiya-members/:id
 * Remove member from a Jumuiya (resets jumuiya_id in members)
 */
export const deleteJumuiyaMember = async (req, res) => {
  try {
    const { id } = req.params; // member_id
    
    // Start Transaction
    await pool.query('BEGIN');

    // 1. Remove from registered table first
    await pool.query("DELETE FROM registered WHERE member_id = $1", [id]);

    // 2. Totally remove member from members database
    const result = await pool.query(
      "DELETE FROM members WHERE member_id = $1 RETURNING *", 
      [id]
    );

    if (result.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ success: false, message: "Member not found" });
    }

    await pool.query('COMMIT');

    res.json({ success: true, message: "Member removed from community and database successfully" });
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
    const result = await pool.query(
      `SELECT member_id, first_name, last_name, email, year_of_study 
       FROM members 
       WHERE jumuiya_id IS NULL 
       ORDER BY first_name ASC`
    );
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

    // 2. Insert into registered table in bulk using UNNEST
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
 * GET /api/jumuiya-members/registered?jumuiya_id=st-anthony
 * Fetch members from the 'registered' table.
 */
export const getRegisteredJumuiyaMembers = async (req, res) => {
  try {
    const { jumuiya_id } = req.query;

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
        true as is_registered
      FROM registered r
      JOIN members m ON r.member_id = m.member_id
    `;

    const queryParams = [];
    if (jumuiya_id) {
      query += ` WHERE r.jumuiya_id = $1`;
      queryParams.push(jumuiya_id);
    }

    query += ` ORDER BY m.first_name ASC`;

    const result = await pool.query(query, queryParams);

    const formattedData = result.rows.map(row => ({
      ...row,
      name: `${row.first_name} ${row.last_name || ""}`.trim(),
      is_current_jumuiya: true // These are specifically from the registered table for this jumuiya
    }));

    res.json({ success: true, data: formattedData });
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


