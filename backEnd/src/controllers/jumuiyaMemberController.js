import { db as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";
import { validateMemberRow, parseExcelRow } from "../utils/memberValidation.js";
import { distributeMembers } from "../utils/distributionAlgorithm.js";

// ─── Seasons ────────────────────────────────────────────

export const createSeason = async (req, res) => {
  try {
    const { jumuiya_id, season_name, start_date, end_date, status } = req.body;
    if (!jumuiya_id || !season_name || !start_date || !end_date) {
      return res.status(400).json({ error: "jumuiya_id, season_name, start_date, end_date are required" });
    }
    const result = await pool.query(
      `INSERT INTO registration_seasons (jumuiya_id, season_name, start_date, end_date, status)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [jumuiya_id, season_name, start_date, end_date, status || "planning"]
    );
    res.status(201).json({ status: "success", data: result.rows[0] });
  } catch (error) {
    logger.error("createSeason error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getSeasons = async (req, res) => {
  try {
    const { jumuiya_id } = req.params;
    const result = await pool.query(
      `SELECT * FROM registration_seasons WHERE jumuiya_id = $1 ORDER BY start_date DESC`,
      [jumuiya_id]
    );
    res.json({ status: "success", data: result.rows });
  } catch (error) {
    logger.error("getSeasons error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateSeason = async (req, res) => {
  try {
    const { id } = req.params;
    const { season_name, start_date, end_date, status } = req.body;
    const result = await pool.query(
      `UPDATE registration_seasons SET
        season_name = COALESCE($1, season_name),
        start_date = COALESCE($2, start_date),
        end_date = COALESCE($3, end_date),
        status = COALESCE($4, status),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 RETURNING *`,
      [season_name, start_date, end_date, status, id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Season not found" });
    res.json({ status: "success", data: result.rows[0] });
  } catch (error) {
    logger.error("updateSeason error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const deleteSeason = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM registration_seasons WHERE id = $1", [id]);
    res.json({ status: "success", message: "Season deleted" });
  } catch (error) {
    logger.error("deleteSeason error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ─── Imports ────────────────────────────────────────────

export const importMembers = async (req, res) => {
  try {
    const { jumuiya_id } = req.params;
    const { members, season_id, file_name, coordinator_id } = req.body;

    if (!members || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ error: "members array is required" });
    }

    const importResult = await pool.query(
      `INSERT INTO member_imports (jumuiya_id, coordinator_id, season_id, file_name, total_records, status)
       VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING *`,
      [jumuiya_id, coordinator_id || null, season_id || null, file_name || null, members.length]
    );

    const importId = importResult.rows[0].id;
    let validCount = 0;
    let errorCount = 0;
    const results = [];

    for (const member of members) {
      const validated = validateMemberRow(member);
      const recordResult = await pool.query(
        `INSERT INTO import_records
         (import_id, raw_name, raw_reg_number, raw_gender, raw_jumuiya, raw_phone, raw_email,
          cleaned_name, cleaned_reg_number, cleaned_gender, cleaned_jumuiya, cleaned_phone, cleaned_email,
          status, validation_errors, validation_warnings)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`,
        [
          importId,
          validated.raw.name, validated.raw.regNumber, validated.raw.gender, validated.raw.jumuiya, validated.raw.phone, validated.raw.email,
          validated.cleaned.name, validated.cleaned.regNumber, validated.cleaned.gender, validated.cleaned.jumuiya, validated.cleaned.phone, validated.cleaned.email,
          validated.status, JSON.stringify(validated.errors), JSON.stringify(validated.warnings),
        ]
      );
      if (validated.status === "error") errorCount++;
      else validCount++;
      results.push(recordResult.rows[0]);
    }

    await pool.query(
      `UPDATE member_imports SET valid_records = $1, error_records = $2 WHERE id = $3`,
      [validCount, errorCount, importId]
    );

    res.status(201).json({
      status: "success",
      data: {
        import: importResult.rows[0],
        records: results,
        summary: { total: members.length, valid: validCount, errors: errorCount },
      },
    });
  } catch (error) {
    logger.error("importMembers error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getImportStatus = async (req, res) => {
  try {
    const { importId } = req.params;
    const result = await pool.query(
      `SELECT mi.*,
        (SELECT json_agg(json_build_object(
          'id', ir.id, 'raw_name', ir.raw_name, 'cleaned_name', ir.cleaned_name,
          'status', ir.status, 'validation_errors', ir.validation_errors, 'validation_warnings', ir.validation_warnings
        )) FROM import_records ir WHERE ir.import_id = mi.id) as records
       FROM member_imports mi WHERE mi.id = $1`,
      [importId]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Import not found" });
    res.json({ status: "success", data: result.rows[0] });
  } catch (error) {
    logger.error("getImportStatus error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getImports = async (req, res) => {
  try {
    const { jumuiya_id } = req.params;
    const result = await pool.query(
      `SELECT * FROM member_imports WHERE jumuiya_id = $1 ORDER BY import_date DESC`,
      [jumuiya_id]
    );
    res.json({ status: "success", data: result.rows });
  } catch (error) {
    logger.error("getImports error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateImportStatus = async (req, res) => {
  try {
    const { importId } = req.params;
    const { status, notes } = req.body;
    if (!["pending", "reviewed", "processed", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const result = await pool.query(
      `UPDATE member_imports SET status = $1, notes = COALESCE($2, notes) WHERE id = $3 RETURNING *`,
      [status, notes, importId]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Import not found" });
    res.json({ status: "success", data: result.rows[0] });
  } catch (error) {
    logger.error("updateImportStatus error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ─── Validation ─────────────────────────────────────────

export const validateImportData = async (req, res) => {
  try {
    const { members } = req.body;
    if (!members || !Array.isArray(members)) {
      return res.status(400).json({ error: "members array is required" });
    }

    const results = members.map((m, i) => {
      const parsed = parseExcelRow(m);
      const validated = validateMemberRow(parsed);
      return { row: i + 1, ...validated };
    });

    const summary = {
      total: results.length,
      valid: results.filter(r => r.status === "valid").length,
      warning: results.filter(r => r.status === "warning").length,
      error: results.filter(r => r.status === "error").length,
    };

    res.json({ status: "success", data: { results, summary } });
  } catch (error) {
    logger.error("validateImportData error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ─── Groups ──────────────────────────────────────────────

export const createGroups = async (req, res) => {
  try {
    const { jumuiya_id } = req.params;
    const { groups, season_id } = req.body;

    if (!groups || !Array.isArray(groups) || groups.length === 0) {
      return res.status(400).json({ error: "groups array is required" });
    }

    const created = [];
    for (const g of groups) {
      const result = await pool.query(
        `INSERT INTO member_groups (jumuiya_id, group_name, season_id, capacity, description, group_type)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [jumuiya_id, g.group_name, season_id || null, g.capacity || 0, g.description || null, g.group_type || "mixed"]
      );
      created.push(result.rows[0]);
    }

    res.status(201).json({ status: "success", data: created });
  } catch (error) {
    logger.error("createGroups error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getGroups = async (req, res) => {
  try {
    const { jumuiya_id } = req.params;
    const { season_id } = req.query;
    let query = `SELECT mg.*,
      (SELECT COUNT(*) FROM group_assignments ga WHERE ga.group_id = mg.id AND ga.status = 'active') as member_count
      FROM member_groups mg WHERE mg.jumuiya_id = $1`;
    const params = [jumuiya_id];

    if (season_id) {
      query += ` AND mg.season_id = $2`;
      params.push(season_id);
    }

    query += ` ORDER BY mg.group_name`;
    const result = await pool.query(query, params);
    res.json({ status: "success", data: result.rows });
  } catch (error) {
    logger.error("getGroups error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { group_name, capacity, description, group_type } = req.body;
    const result = await pool.query(
      `UPDATE member_groups SET
        group_name = COALESCE($1, group_name),
        capacity = COALESCE($2, capacity),
        description = COALESCE($3, description),
        group_type = COALESCE($4, group_type),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 RETURNING *`,
      [group_name, capacity, description, group_type, groupId]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Group not found" });
    res.json({ status: "success", data: result.rows[0] });
  } catch (error) {
    logger.error("updateGroup error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    await pool.query("DELETE FROM member_groups WHERE id = $1", [groupId]);
    res.json({ status: "success", message: "Group deleted" });
  } catch (error) {
    logger.error("deleteGroup error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ─── Distribution ───────────────────────────────────────

export const autoDistribute = async (req, res) => {
  try {
    const { jumuiya_id } = req.params;
    const { season_id, strategy, import_id } = req.body;

    const groupsResult = await pool.query(
      `SELECT * FROM member_groups WHERE jumuiya_id = $1 ${season_id ? "AND season_id = $2" : ""}`,
      season_id ? [jumuiya_id, season_id] : [jumuiya_id]
    );

    if (!groupsResult.rows.length) {
      return res.status(400).json({ error: "No groups found. Create groups first." });
    }

    let members;
    if (import_id) {
      const recordsResult = await pool.query(
        `SELECT id as member_id, cleaned_name as name, cleaned_gender as gender
         FROM import_records WHERE import_id = $1 AND status IN ('valid', 'warning')`,
        [import_id]
      );
      members = recordsResult.rows.map(r => ({ id: r.member_id, name: r.name, gender: r.gender }));
    } else {
      const importResult = await pool.query(
        `SELECT ir.id as member_id, ir.cleaned_name as name, ir.cleaned_gender as gender
         FROM import_records ir
         JOIN member_imports mi ON mi.id = ir.import_id
         WHERE mi.jumuiya_id = $1 AND mi.status = 'processed' AND ir.status IN ('valid', 'warning')`,
        [jumuiya_id]
      );
      members = importResult.rows.map(r => ({ id: r.member_id, name: r.name, gender: r.gender }));
    }

    if (!members.length) {
      return res.status(400).json({ error: "No valid members found to distribute" });
    }

    const result = distributeMembers({
      members,
      groups: groupsResult.rows,
      strategy: strategy || "balanced-mixed",
    });

    for (const assignment of result.assignments) {
      await pool.query(
        `INSERT INTO group_assignments (member_id, group_id, assigned_by, status)
         VALUES ($1, $2, $3, 'active')
         ON CONFLICT (member_id, group_id) DO NOTHING`,
        [assignment.member_id, assignment.group_id, req.user?.id || null]
      );
    }

    await pool.query(
      `INSERT INTO distribution_history (season_id, jumuiya_id, algorithm_used, stats, distributed_by)
       VALUES ($1, $2, $3, $4, $5)`,
      [season_id || null, jumuiya_id, strategy || "balanced-mixed", JSON.stringify(result.stats), req.user?.id || null]
    );

    res.status(201).json({
      status: "success",
      data: {
        assignments: result.assignments,
        stats: result.stats,
      },
    });
  } catch (error) {
    logger.error("autoDistribute error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const reassignMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { member_id } = req.body;

    await pool.query(
      `UPDATE group_assignments SET status = 'inactive' WHERE member_id = $1 AND status = 'active'`,
      [member_id]
    );

    const result = await pool.query(
      `INSERT INTO group_assignments (member_id, group_id, assigned_by, status)
       VALUES ($1, $2, $3, 'active') RETURNING *`,
      [member_id, groupId, req.user?.id || null]
    );

    res.json({ status: "success", data: result.rows[0] });
  } catch (error) {
    logger.error("reassignMember error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const result = await pool.query(
      `SELECT ga.*, ir.cleaned_name as member_name, ir.cleaned_gender as member_gender,
              ir.cleaned_reg_number as reg_number, ir.cleaned_phone as phone, ir.cleaned_email as email
       FROM group_assignments ga
       LEFT JOIN import_records ir ON ir.id = ga.member_id
       WHERE ga.group_id = $1 AND ga.status = 'active'
       ORDER BY ir.cleaned_name`,
      [groupId]
    );
    res.json({ status: "success", data: result.rows });
  } catch (error) {
    logger.error("getGroupMembers error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ─── Statistics ─────────────────────────────────────────

export const getStatistics = async (req, res) => {
  try {
    const { jumuiya_id } = req.params;

    const totalImports = await pool.query(
      `SELECT COUNT(*)::int as total, SUM(valid_records)::int as valid, SUM(error_records)::int as errors
       FROM member_imports WHERE jumuiya_id = $1`,
      [jumuiya_id]
    );

    const genderBreakdown = await pool.query(
      `SELECT ir.cleaned_gender as gender, COUNT(*)::int as count
       FROM import_records ir
       JOIN member_imports mi ON mi.id = ir.import_id
       WHERE mi.jumuiya_id = $1 AND ir.status IN ('valid', 'warning')
       GROUP BY ir.cleaned_gender`,
      [jumuiya_id]
    );

    const groupStats = await pool.query(
      `SELECT mg.id, mg.group_name, mg.group_type, mg.capacity,
              COUNT(ga.id)::int as assigned_count
       FROM member_groups mg
       LEFT JOIN group_assignments ga ON ga.group_id = mg.id AND ga.status = 'active'
       WHERE mg.jumuiya_id = $1
       GROUP BY mg.id, mg.group_name, mg.group_type, mg.capacity
       ORDER BY mg.group_name`,
      [jumuiya_id]
    );

    const activeSeason = await pool.query(
      `SELECT * FROM registration_seasons
       WHERE jumuiya_id = $1 AND status = 'active'
       LIMIT 1`,
      [jumuiya_id]
    );

    res.json({
      status: "success",
      data: {
        imports: totalImports.rows[0],
        genderBreakdown: genderBreakdown.rows,
        groups: groupStats.rows,
        activeSeason: activeSeason.rows[0] || null,
      },
    });
  } catch (error) {
    logger.error("getStatistics error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ─── Distribution History ───────────────────────────────

export const getDistributionHistory = async (req, res) => {
  try {
    const { jumuiya_id } = req.params;
    const result = await pool.query(
      `SELECT * FROM distribution_history WHERE jumuiya_id = $1 ORDER BY distribution_date DESC`,
      [jumuiya_id]
    );
    res.json({ status: "success", data: result.rows });
  } catch (error) {
    logger.error("getDistributionHistory error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ─── Export ──────────────────────────────────────────────

export const exportMembers = async (req, res) => {
  try {
    const { jumuiya_id } = req.params;
    const result = await pool.query(
      `SELECT ir.cleaned_name as name, ir.cleaned_reg_number as reg_number,
              ir.cleaned_gender as gender, ir.cleaned_phone as phone,
              ir.cleaned_email as email, ir.status, mi.season_id,
              rs.season_name
       FROM import_records ir
       JOIN member_imports mi ON mi.id = ir.import_id
       LEFT JOIN registration_seasons rs ON rs.id = mi.season_id
       WHERE mi.jumuiya_id = $1 AND ir.status IN ('valid', 'warning')
       ORDER BY ir.cleaned_name`,
      [jumuiya_id]
    );
    res.json({ status: "success", data: result.rows });
  } catch (error) {
    logger.error("exportMembers error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const exportAssignments = async (req, res) => {
  try {
    const { jumuiya_id } = req.params;
    const result = await pool.query(
      `SELECT mg.group_name, ir.cleaned_name as member_name,
              ir.cleaned_gender as gender, ir.cleaned_reg_number as reg_number
       FROM group_assignments ga
       JOIN member_groups mg ON mg.id = ga.group_id
       LEFT JOIN import_records ir ON ir.id = ga.member_id
       WHERE mg.jumuiya_id = $1 AND ga.status = 'active'
       ORDER BY mg.group_name, ir.cleaned_name`,
      [jumuiya_id]
    );
    res.json({ status: "success", data: result.rows });
  } catch (error) {
    logger.error("exportAssignments error:", error.message);
    res.status(500).json({ error: error.message });
  }
};
