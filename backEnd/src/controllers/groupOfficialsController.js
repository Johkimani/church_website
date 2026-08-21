import { db as pool } from "../Configs/dbConfig.js";
import ExcelJS from 'exceljs';
import path from 'path';
import { 
  normalizePhone, 
  isValidPhone, 
  deleteFile, 
  deleteFromCloudinary,
  formatPhotoUrl, 
  syncCurrentTerm,
  formatPhoneForExcel 
} from '../utils/helpers.js';
import { isOfficial } from '../middlewares/requireRole.js';
import logger from "../logger/winston.js";
import { emitSocketEvent } from "../socket/index.js";

export const GROUP_OPTIONS = [
  'Choir',
  'Dancers',
  'Charismatic',
  'St. Francis'
];

export const POSITIONS_BY_GROUP = {
  'Choir': [
    'Secretary',
    'Vice Secretary',
    'Treasurer',
    'Project Manager',
    'Male Representative',
    'Female Representative',
    'Choir Master',
    'Choir Mistress'
  ],
  'Dancers': [
    'Chairperson',
    'Vice Chairperson'
  ],
  'Charismatic': [
    'Chairperson',
    'Vice Chairperson',
    'Secretary',
    'Treasurer'
  ],
  'St. Francis': [
    'Chairperson',
    'Vice Chairperson'
  ]
};

const GROUP_SORT_SQL = `
ORDER BY 
  CASE 
    WHEN o.category = 'Choir' THEN 1
    WHEN o.category = 'Dancers' THEN 2
    WHEN o.category = 'Charismatic' THEN 3
    WHEN o.category = 'St. Francis' THEN 4
    ELSE 5
  END,
  CASE
    WHEN o.position = 'Chairperson' THEN 1
    WHEN o.position = 'Vice Chairperson' THEN 2
    WHEN o.position = 'Secretary' THEN 3
    WHEN o.position = 'Vice Secretary' THEN 4
    WHEN o.position = 'Treasurer' THEN 5
    WHEN o.position = 'Project Manager' THEN 6
    WHEN o.position = 'Male Representative' THEN 7
    WHEN o.position = 'Female Representative' THEN 8
    WHEN o.position = 'Choir Master' THEN 9
    WHEN o.position = 'Choir Mistress' THEN 10
    WHEN o.position = 'Choreographer' THEN 11
    WHEN o.position = 'Assistant Choreographer' THEN 12
    WHEN o.position = 'Music Director' THEN 13
    WHEN o.position = 'Organist' THEN 14
    WHEN o.position = 'Choir Representative' THEN 15
    WHEN o.position = 'Prayer Coordinator' THEN 16
    WHEN o.position = 'Worship Coordinator' THEN 17
    WHEN o.position = 'Welfare Coordinator' THEN 18
    ELSE 99
  END`;

const resolveMemberForRegNumber = async (regNumber) => {
  const search = regNumber?.trim();
  if (!search) return null;

  const result = await pool.query(
    `SELECT member_id, first_name, last_name, phone
     FROM members
     WHERE member_id LIKE '%/' || $1 || '/%' OR member_id ILIKE $2
     ORDER BY member_id
     LIMIT 2`,
    [search, `%${search}%`]
  );

  if (result.rows.length === 0) {
    return { error: `No member found with registration number matching "${regNumber}"` };
  }

  if (result.rows.length > 1) {
    return { error: 'Registration number matches multiple members. Please select the exact member before saving.' };
  }

  return { member: result.rows[0] };
};

export const getAllGroupOfficials = async (req, res) => {
  try {
    const termId = req.query.term_id;
    const includeArchived = req.query.include_archived === 'true';
    const termOfService = req.query.term_of_service;
    const category = req.query.category;
    
    let query;
    let params = [];

    const SELECT_COLS = `o.id, o.name, o.category, o.photo, o.position, o.contact, o.term_of_service, o.created_at, o.status,
               ${isOfficial(req) ? "o.reg_number," : ""}
               et.name as term_name, et.year as term_year`;

    if (termId) {
      query = `
        SELECT ${SELECT_COLS}
        FROM group_officials o
        LEFT JOIN election_terms et ON o.election_term_id = et.id
        WHERE (o.election_term_id = $1 OR o.status = 'active' OR o.status IS NULL)
        AND (o.status = 'active' OR o.status IS NULL)`;
      params.push(termId);
      
      if (category) {
        query += ` AND o.category = $${params.length + 1}`;
        params.push(category);
      }
      
      if (termOfService) {
        query += ` AND o.term_of_service = $${params.length + 1}`;
        params.push(termOfService);
      }
      query += ` ${GROUP_SORT_SQL}`;
    } else if (includeArchived) {
      query = `
        SELECT ${SELECT_COLS}
        FROM group_officials o
        LEFT JOIN election_terms et ON o.election_term_id = et.id
        WHERE 1=1`;
      
      if (category) {
        query += ` AND o.category = $${params.length + 1}`;
        params.push(category);
      }
      
      if (termOfService) {
        query += ` AND o.term_of_service = $${params.length + 1}`;
        params.push(termOfService);
      }
      query += ` ORDER BY o.status, et.year DESC ${GROUP_SORT_SQL.replace('ORDER BY', ',')}`;
    } else {
      query = `
        SELECT ${SELECT_COLS}
        FROM group_officials o
        LEFT JOIN election_terms et ON o.election_term_id = et.id
        WHERE (o.status = 'active' OR o.status IS NULL)`;
      
      if (category) {
        query += ` AND o.category = $${params.length + 1}`;
        params.push(category);
      }
        
      if (termOfService) {
        query += ` AND o.term_of_service = $${params.length + 1}`;
        params.push(termOfService);
      }
      query += ` ${GROUP_SORT_SQL}`;
    }

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    logger.error('Error fetching group officials: ' + error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch group officials' });
  }
};

export const getGroupOfficialById = async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(Number(id))) {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }
    const result = await pool.query('SELECT * FROM group_officials WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Official not found' });
    }

    const row = result.rows[0];
    if (!isOfficial(req)) delete row.reg_number;

    res.json({ success: true, data: row });
  } catch (error) {
    logger.error('Error fetching group official: ' + error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch official' });
  }
};

export const createGroupOfficial = async (req, res) => {
  try {
    const { name, category, position, contact, term_of_service, reg_number } = req.body;
    logger.info(`Creating group official: ${name}, ${category}, ${position}`);

    if (!name || !category || !position) {
        logger.warn('Missing required fields for group official');
        return res.status(400).json({ success: false, message: 'Name, Group, and Position are required' });
    }

    const normalizedContact = normalizePhone(contact);
    if (contact && !isValidPhone(contact)) {
      logger.warn(`Invalid phone number: ${contact}`);
      return res.status(400).json({ success: false, message: 'Please provide a valid phone number' });
    }

    if (!GROUP_OPTIONS.includes(category)) {
      logger.warn(`Invalid group category: ${category}`);
      return res.status(400).json({ success: false, message: `Invalid Group. Must be one of: ${GROUP_OPTIONS.join(', ')}` });
    }

    const validPositions = POSITIONS_BY_GROUP[category] || [];
    if (!validPositions.includes(position)) {
      logger.warn(`Invalid position: ${position} for ${category}`);
      return res.status(400).json({ success: false, message: `Invalid Position for ${category}. Must be one of: ${validPositions.join(', ')}` });
    }

    // Validate reg_number if provided (link to member, no jumuiya constraint for groups)
    let validatedRegNumber = null;
    if (reg_number && reg_number.trim()) {
      const lookup = await resolveMemberForRegNumber(reg_number);
      if (lookup?.error) {
        return res.status(400).json({ success: false, message: lookup.error });
      }
      validatedRegNumber = lookup.member.member_id;
    }

    const promises = [
      pool.query("SELECT id FROM election_terms WHERE is_current = TRUE"),
      pool.query("SELECT name FROM group_officials WHERE category = $1 AND position = $2 AND (status = 'active' OR status IS NULL)", [category, position])
    ];

    let contactQueryIndex = -1;
    if (normalizedContact) {
      promises.push(
        pool.query("SELECT id FROM group_officials WHERE contact = $1 AND (status = 'active' OR status IS NULL)", [normalizedContact])
      );
      contactQueryIndex = promises.length - 1;
    }

    const results = await Promise.all(promises);
    const currentTermResult = results[0];
    const posDup = results[1];

    if (contactQueryIndex !== -1) {
      const dup = results[contactQueryIndex];
      if (dup.rows.length > 0) {
        logger.warn(`Contact already in use: ${normalizedContact}`);
        return res.status(409).json({ success: false, message: 'Contact already in use by another official' });
      }
    }

    if (posDup.rows.length > 0) {
      logger.warn(`Position already occupied: ${position} in ${category}`);
      return res.status(409).json({
        success: false,
        message: `The position '${position}' for ${category} is already occupied by ${posDup.rows[0].name}`
      });
    }

    let photoUrl = req.file ? formatPhotoUrl(req.file) : null;
    const termId = currentTermResult.rows.length > 0 ? currentTermResult.rows[0].id : null;

    const result = await pool.query(
      `INSERT INTO group_officials (name, category, position, contact, photo, election_term_id, status, term_of_service, reg_number) 
       VALUES ($1, $2, $3, $4, $5, $6, 'active', $7, $8) RETURNING *`,
      [name, category, position, normalizedContact || null, photoUrl, termId, term_of_service || null, validatedRegNumber]
    );

    await syncCurrentTerm(term_of_service);

    emitSocketEvent("CSA_NOTIFICATIONS", "officialsUpdated", { action: "create_group", data: result.rows[0] });

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    logger.error('Error creating group official: ' + error.message);
    res.status(500).json({ success: false, message: 'Failed to create official' });
  }
};

export const updateGroupOfficial = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, position, contact, term_of_service, reg_number } = req.body;

    const existing = await pool.query('SELECT * FROM group_officials WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Official not found' });
    }

    const currentCategory = category || existing.rows[0].category;
    const currentPosition = position || existing.rows[0].position;

    if (category && !GROUP_OPTIONS.includes(category)) {
      return res.status(400).json({ success: false, message: `Invalid Group. Must be one of: ${GROUP_OPTIONS.join(', ')}` });
    }

    if (position) {
      const validPositions = POSITIONS_BY_GROUP[currentCategory] || [];
      if (!validPositions.includes(position)) {
        return res.status(400).json({ success: false, message: `Invalid Position for ${currentCategory}. Must be one of: ${validPositions.join(', ')}` });
      }
    }

    const normalizedContact = contact ? normalizePhone(contact) : null;
    if (contact && !isValidPhone(contact)) {
      return res.status(400).json({ success: false, message: 'Invalid phone number' });
    }

    if (normalizedContact) {
      const dup = await pool.query(
        "SELECT id FROM group_officials WHERE contact = $1 AND id != $2 AND (status = 'active' OR status IS NULL)",
        [normalizedContact, id]
      );
      if (dup.rows.length > 0) {
        return res.status(409).json({ success: false, message: 'Contact already in use' });
      }
    }

    // Validate reg_number if provided
    let validatedRegNumber = existing.rows[0].reg_number;
    if (reg_number && reg_number.trim()) {
      const lookup = await resolveMemberForRegNumber(reg_number);
      if (lookup?.error) {
        return res.status(400).json({ success: false, message: lookup.error });
      }
      validatedRegNumber = lookup.member.member_id;
    }

    // Limit check for category+position combo during an update
    if (category || position) {
      const posDup = await pool.query(
        "SELECT name FROM group_officials WHERE category = $1 AND position = $2 AND id != $3 AND (status = 'active' OR status IS NULL)",
        [currentCategory, currentPosition, id]
      );
      if (posDup.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: `The position '${currentPosition}' for ${currentCategory} is already occupied by ${posDup.rows[0].name}`
        });
      }
    }

    let photoUrl = existing.rows[0].photo;
    if (req.file) {
      if (existing.rows[0].photo) {
        if (existing.rows[0].photo.startsWith('http')) {
          await deleteFromCloudinary(existing.rows[0].photo);
        } else {
          const oldFilePath = path.join(process.cwd(), 'localFileUploads', path.basename(existing.rows[0].photo));
          deleteFile(oldFilePath);
        }
      }
      photoUrl = formatPhotoUrl(req.file);
    }

    const result = await pool.query(
      `UPDATE group_officials SET name = COALESCE($1, name), category = COALESCE($2, category),
       position = COALESCE($3, position), contact = COALESCE($4, contact),
       photo = COALESCE($5, photo), term_of_service = COALESCE($6, term_of_service),
       reg_number = COALESCE($7, reg_number),
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 RETURNING *`,
      [name, category, position, normalizedContact, photoUrl, term_of_service || null, validatedRegNumber, id]
    );

    if (term_of_service) {
      await syncCurrentTerm(term_of_service);
    }

    emitSocketEvent("CSA_NOTIFICATIONS", "officialsUpdated", { action: "update_group", id, data: result.rows[0] });

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    logger.error('Error updating group official: ' + error.message);
    res.status(500).json({ success: false, message: 'Failed to update official' });
  }
};

export const deleteGroupOfficial = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM group_officials WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Official not found' });
    }

    const official = result.rows[0];

    if (official.photo) {
      if (official.photo.startsWith('http')) {
        await deleteFromCloudinary(official.photo);
      } else {
        const filePath = path.join(process.cwd(), 'localFileUploads', path.basename(official.photo));
        deleteFile(filePath);
      }
    }

    await pool.query('DELETE FROM group_officials WHERE id = $1', [id]);
    emitSocketEvent("CSA_NOTIFICATIONS", "officialsUpdated", { action: "delete_group", id });
    res.json({ success: true, message: 'Official deleted successfully' });
  } catch (error) {
    logger.error('Error deleting group official: ' + error.message);
    res.status(500).json({ success: false, message: 'Failed to delete official' });
  }
};

export const exportGroupOfficials = async (req, res) => {
  try {
    const { fields, term_of_service: termOfService } = req.query;
    const selectedFields = fields ? fields.split(',') : ['name', 'category', 'position', 'contact'];

    let query = `
        SELECT o.id, o.name, o.category, o.position, o.contact, o.created_at, et.name as term_name, et.year as term_year, o.term_of_service
        FROM group_officials o
        LEFT JOIN election_terms et ON o.election_term_id = et.id
        WHERE (o.status = 'active' OR o.status IS NULL)`;
    
    let params = [];
    if (termOfService) {
      query += ` AND o.term_of_service = $1`;
      params.push(termOfService);
    }
    query += ` ${GROUP_SORT_SQL}`;

    const result = await pool.query(query, params);

    const headers = selectedFields.map(f => f.charAt(0).toUpperCase() + f.slice(1));
    const data = result.rows.map(row => {
      const obj = {};
      selectedFields.forEach(field => {
        let value = row[field] || '';
        if (field === 'contact' && value) {
          value = formatPhoneForExcel(value);
        }
        obj[field] = value;
      });
      return obj;
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Group Officials');

    worksheet.columns = selectedFields.map((field, idx) => ({
      header: headers[idx],
      key: field
    }));

    data.forEach(row => {
      worksheet.addRow(row);
    });

    worksheet.columns.forEach((column, idx) => {
      const field = selectedFields[idx];
      const headerLength = headers[idx].length;
      const maxContentLength = Math.max(...data.map(row => String(row[field] || '').length), headerLength);
      column.width = Math.max(maxContentLength + 2, 15);
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="group_officials.xlsx"');
    
    const buffer = await workbook.xlsx.writeBuffer();
    res.send(buffer);
  } catch (error) {
    logger.error('Error exporting group officials: ' + error.message);
    res.status(500).json({ success: false, message: 'Failed to export group officials' });
  }
};

export const exportArchivedGroupOfficials = async (req, res) => {
  try {
    const { termId } = req.params;
    const { fields, term_of_service: termOfService } = req.query;
    const selectedFields = fields ? fields.split(',') : ['name', 'category', 'position', 'contact'];

    let query = `
        SELECT o.id, o.name, o.category, o.position, o.contact, o.created_at, o.status, et.name as term_name, et.year as term_year, o.term_of_service
        FROM group_officials o
        LEFT JOIN election_terms et ON o.election_term_id = et.id
        WHERE o.status = 'archived'`;
    let params = [];
    if (termId) {
      query += ` AND o.election_term_id = $1`;
      params.push(termId);
    }
    if (termOfService) {
      query += ` AND (o.term_of_service = $${params.length + 1} OR et.name = $${params.length + 1})`;
      params.push(termOfService);
    }
    query += ` ${GROUP_SORT_SQL}`;

    const result = await pool.query(query, params);

    const headers = selectedFields.map(f => f.charAt(0).toUpperCase() + f.slice(1));
    const data = result.rows.map(row => {
      const obj = {};
      selectedFields.forEach(field => {
        let value = row[field] || '';
        if (field === 'contact' && value) {
          value = formatPhoneForExcel(value);
        }
        obj[field] = value;
      });
      return obj;
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Archived Group Officials');

    worksheet.columns = selectedFields.map((field, idx) => ({
      header: headers[idx],
      key: field
    }));

    data.forEach(row => {
      worksheet.addRow(row);
    });

    worksheet.columns.forEach((column, idx) => {
      const field = selectedFields[idx];
      const headerLength = headers[idx].length;
      const maxContentLength = Math.max(...data.map(row => String(row[field] || '').length), headerLength);
      column.width = Math.max(maxContentLength + 2, 15);
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="archived_group_officials.xlsx"');
    
    const buffer = await workbook.xlsx.writeBuffer();
    res.send(buffer);
  } catch (error) {
    logger.error('Error exporting archived group officials: ' + error.message);
    res.status(500).json({ success: false, message: 'Failed to export archived officials' });
  }
};

export const archiveCurrentGroupOfficials = async (req, res) => {
  const client = await pool.connect();
  try {
    const { election_term_id, name, year, start_date, end_date, description, category } = req.body;

    await client.query('BEGIN');

    let termId = election_term_id;

    if (!termId) {
      if (!name || !year || !start_date) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Election term details required when no term_id provided'
        });
      }

      await client.query('UPDATE election_terms SET is_current = FALSE');

      const termResult = await client.query(
        `INSERT INTO election_terms (name, year, start_date, end_date, description, is_current)
         VALUES ($1, $2, $3, $4, $5, TRUE) RETURNING *`,
        [name, year, start_date, end_date || null, description || null]
      );
      termId = termResult.rows[0].id;
    } else {
      const termCheck = await client.query('SELECT * FROM election_terms WHERE id = $1', [termId]);
      if (termCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, message: 'Election term not found' });
      }

      await client.query('UPDATE election_terms SET is_current = FALSE');
      await client.query('UPDATE election_terms SET is_current = TRUE WHERE id = $1', [termId]);
    }

    let activeFilter = "(status = 'active' OR status IS NULL)";
    let params = [];
    if (category) {
       activeFilter = "(status = 'active' OR status IS NULL) AND category = $1";
       params.push(category);
    }

    const currentOfficials = await client.query(
      `SELECT * FROM group_officials WHERE ${activeFilter}`,
      params
    );

    if (currentOfficials.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'No active officials to archive'
      });
    }

    await client.query(
      `UPDATE group_officials 
       SET status = 'archived', 
           election_term_id = $1, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE (status = 'active' OR status IS NULL)`,
      [termId]
    );

    const termInfo = await client.query('SELECT * FROM election_terms WHERE id = $1', [termId]);

    await client.query('COMMIT');

    emitSocketEvent("CSA_NOTIFICATIONS", "officialsUpdated", { action: "archive_group" });

    res.json({
      success: true,
      message: `Successfully archived ${currentOfficials.rows.length} officials to "${termInfo.rows[0].name}"`,
      data: { archived_count: currentOfficials.rows.length, election_term: termInfo.rows[0] }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error archiving group officials: ' + error.message);
    res.status(500).json({ success: false, message: `Failed to archive officials: ${error.message}` });
  } finally {
    client.release();
  }
};

export const getGroupOfficialsByTerm = async (req, res) => {
  try {
    const { termId } = req.params;
    const includeArchived = req.query.include_archived === 'true';
    const categoryFilter = req.query.category || null;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    let queryBase;
    let params = [];
    let paramIdx = 1;

    const addCategoryWhere = (existingWhere) => {
      if (!categoryFilter) return '';
      const clause = ` AND LOWER(o.category) = LOWER($${paramIdx})`;
      paramIdx++;
      return clause;
    };

    if (termId) {
      queryBase = `
        FROM group_officials o
        LEFT JOIN election_terms et ON o.election_term_id = et.id
        WHERE o.election_term_id = $${paramIdx} AND o.status = 'archived'${addCategoryWhere()}`;
      params = [termId];
      if (categoryFilter) params.push(categoryFilter);
    } else if (req.query.only_archived === 'true') {
      queryBase = `
        FROM group_officials o
        LEFT JOIN election_terms et ON o.election_term_id = et.id
        WHERE o.status = 'archived'${addCategoryWhere()}`;
      params = categoryFilter ? [categoryFilter] : [];
    } else if (includeArchived) {
      queryBase = `
        FROM group_officials o
        LEFT JOIN election_terms et ON o.election_term_id = et.id${addCategoryWhere()}`;
      params = categoryFilter ? [categoryFilter] : [];
    } else {
      queryBase = `
        FROM group_officials o
        LEFT JOIN election_terms et ON o.election_term_id = et.id
        WHERE (o.status = 'active' OR o.status IS NULL)${addCategoryWhere()}`;
      params = categoryFilter ? [categoryFilter] : [];
    }

    const countQuery = `SELECT COUNT(*) ${queryBase}`;
    const totalResult = await pool.query(countQuery, params);
    const total = parseInt(totalResult.rows[0].count);

    const dataQuery = `
      SELECT o.*, et.name as term_name, et.year as term_year 
      ${queryBase} 
      ${termId || req.query.only_archived === 'true' ? `ORDER BY et.year DESC ${GROUP_SORT_SQL.replace('ORDER BY', ',')}` : GROUP_SORT_SQL}
      LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`;
    
    const result = await pool.query(dataQuery, [...params, limit, offset]);

    if (!isOfficial(req)) {
      result.rows.forEach(r => delete r.reg_number);
    }

    res.json({ 
      success: true, 
      data: result.rows,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching group officials by term: ' + error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch officials' });
  }
};

export const restoreArchivedGroupOfficials = async (req, res) => {
  try {
    const { officialIds } = req.body;

    if (!officialIds || !Array.isArray(officialIds) || officialIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Official IDs array is required'
      });
    }

    const officialsToRestore = await pool.query(
      `SELECT name, category, position FROM group_officials WHERE id = ANY($1) AND position IS NOT NULL AND position != ''`,
      [officialIds]
    );

    if (officialsToRestore.rows.length > 0) {
      const positionsByCategory = {};
      
      const seen = new Set();
      for (const o of officialsToRestore.rows) {
        const key = `${o.category}-${o.position}`;
        if (seen.has(key)) {
          return res.status(409).json({
            success: false,
            message: `Multiple officials in the selection have the same position (${o.position}) in ${o.category}`
          });
        }
        seen.add(key);
        
        if (!positionsByCategory[o.category]) {
           positionsByCategory[o.category] = [];
        }
        positionsByCategory[o.category].push(o.position);
      }

      for (const [category, positions] of Object.entries(positionsByCategory)) {
         const dupPos = await pool.query(
           `SELECT name, position FROM group_officials WHERE category = $1 AND position = ANY($2) AND status = 'active' AND id != ANY($3)`,
           [category, positions, officialIds]
         );

         if (dupPos.rows.length > 0) {
           const conflict = dupPos.rows[0];
           return res.status(409).json({
             success: false,
             message: `Cannot restore: Position '${conflict.position}' in ${category} is already occupied by ${conflict.name} in the active list.`
           });
         }
      }
    }

    const result = await pool.query(
      `UPDATE group_officials SET status = 'active', election_term_id = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE id = ANY($1) RETURNING *`,
      [officialIds]
    );

    emitSocketEvent("CSA_NOTIFICATIONS", "officialsUpdated", { action: "restore_group", ids: officialIds });

    res.json({
      success: true,
      message: `Successfully restored ${result.rows.length} officials`,
      data: result.rows
    });
  } catch (error) {
    logger.error('Error restoring group officials: ' + error.message);
    res.status(500).json({ success: false, message: 'Failed to restore officials' });
  }
};

export const deleteArchivedGroupOfficial = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM group_officials WHERE id = $1 AND status = 'archived' RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Archived official not found' });
    }

    if (result.rows[0].photo) {
        if (result.rows[0].photo.startsWith('http')) {
            await deleteFromCloudinary(result.rows[0].photo);
        } else {
            const oldFilePath = path.join(process.cwd(), 'localFileUploads', path.basename(result.rows[0].photo));
            deleteFile(oldFilePath);
        }
    }

    emitSocketEvent("CSA_NOTIFICATIONS", "officialsUpdated", { action: "delete_archived_group", id });

    res.json({ success: true, message: 'Archived official deleted successfully' });
  } catch (error) {
    logger.error('Error deleting archived official: ' + error.message);
    res.status(500).json({ success: false, message: 'Failed to delete archived official' });
  }
};

export const clearAllGroupOfficials = async (req, res) => {
  try {
    const snapshot = await pool.query(
      `SELECT photo FROM group_officials WHERE photo IS NOT NULL`
    );

    const result = await pool.query(`DELETE FROM group_officials`);

    for (const row of snapshot.rows) {
      if (row.photo) {
        if (row.photo.startsWith('http')) {
          await deleteFromCloudinary(row.photo);
        } else {
          const filePath = path.join(process.cwd(), 'localFileUploads', path.basename(row.photo));
          deleteFile(filePath);
        }
      }
    }

    emitSocketEvent("CSA_NOTIFICATIONS", "officialsUpdated", { action: "clear_all_group" });
    res.json({ success: true, message: `All group officials cleared (${result.rowCount} deleted)` });
  } catch (error) {
    logger.error('Error clearing all group officials: ' + error.message);
    res.status(500).json({ success: false, message: 'Failed to clear group officials' });
  }
};

export const bulkDeleteArchivedGroupOfficials = async (req, res) => {
  try {
    const { officialIds } = req.body;
    
    if (!officialIds || !Array.isArray(officialIds) || officialIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Official IDs are required' });
    }

    const snapshot = await pool.query(
      `SELECT photo FROM group_officials WHERE id = ANY($1) AND status = 'archived' AND photo IS NOT NULL`,
      [officialIds]
    );

    const result = await pool.query(
      `DELETE FROM group_officials WHERE id = ANY($1) AND status = 'archived' RETURNING *`,
      [officialIds]
    );

    for (const row of snapshot.rows) {
      if (row.photo) {
        if (row.photo.startsWith('http')) {
          await deleteFromCloudinary(row.photo);
        } else {
          const filePath = path.join(process.cwd(), 'localFileUploads', path.basename(row.photo));
          deleteFile(filePath);
        }
      }
    }

    emitSocketEvent("CSA_NOTIFICATIONS", "officialsUpdated", { action: "bulk_delete_archived_group", ids: officialIds });

    res.json({ 
      success: true, 
      message: `Successfully deleted ${result.rows.length} archived officials`,
      data: { deletedCount: result.rows.length }
    });
  } catch (error) {
    logger.error('Error in bulk delete: ' + error.message);
    res.status(500).json({ success: false, message: 'Failed to delete archived officials' });
  }
};
