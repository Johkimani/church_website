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
    
    // We fetch ALL members to show a complete list to the user,
    // just like the registration tab does for unregistered ones.
    const query = `
      SELECT 
        member_id as id,
        first_name,
        last_name,
        email,
        year_of_study as year,
        jumuiya_id,
        (jumuiya_id IS NOT NULL) as is_registered
      FROM members
      ORDER BY first_name ASC
    `;
    
    const result = await pool.query(query);

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

    const result = await pool.query(
      `UPDATE members SET jumuiya_id = $1 WHERE member_id = $2 RETURNING *`,
      [jumuiya_id, member_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }

    res.status(200).json({ 
      success: true, 
      message: "Successfully joined the community",
      data: {
        ...result.rows[0],
        id: result.rows[0].member_id,
        name: `${result.rows[0].first_name} ${result.rows[0].last_name || ""}`.trim()
      }
    });
  } catch (error) {
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
    const { first_name, last_name, year_of_study, email } = req.body;

    const result = await pool.query(
      `UPDATE members
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           year_of_study = COALESCE($3, year_of_study),
           email = COALESCE($4, email)
       WHERE member_id = $5 RETURNING *`,
      [first_name, last_name, year_of_study, email, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }

    res.json({ 
      success: true, 
      data: {
        ...result.rows[0],
        id: result.rows[0].member_id,
        name: `${result.rows[0].first_name} ${result.rows[0].last_name || ""}`.trim()
      }
    });
  } catch (error) {
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
    
    // Reset jumuiya_id in members
    const result = await pool.query(
      "UPDATE members SET jumuiya_id = NULL WHERE member_id = $1 RETURNING *", 
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }

    res.json({ success: true, message: "Member removed from community successfully" });
  } catch (error) {
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

    // Update members table directly
    const result = await pool.query(
      `UPDATE members 
       SET jumuiya_id = $1 
       WHERE member_id = ANY($2) 
       RETURNING *`,
      [jumuiya_id, member_ids]
    );

    res.status(200).json({ 
      success: true, 
      message: `Successfully registered ${result.rows.length} members`,
      count: result.rows.length
    });
  } catch (error) {
    logger.error("Error in bulk join: " + error.message);
    res.status(500).json({ success: false, message: "Failed to register members in bulk" });
  }
};
