import { Router } from "express";
import {
  getTableData,
  createRecord,
  deleteRecord,
  updateRecord,
  getAllData,
} from "../../controllers/ApiController.js";
import logger from "../../logger/winston.js";
import verifyToken from "../../middlewares/Tokens.js";
import optionalVerifyToken from "../../middlewares/optionalVerifyToken.js";
import { requireRole, OFFICIAL_ROLES } from "../../middlewares/requireRole.js";

export const api = Router();

// Allowed tables for security
const allowedTables = [
  "members",
  "events",
  "contributions",
  "officials",
  "projects",
  "activities",
  "gallery",
  "jumuiya",
  "users",
  "products",
  "config",
  "mpesa_request",
  "hub_modules",
  "hub_activities",
  "hub_announcements",
  "hub_officials",
  "hub_gallery",
  "enrollments",
  "suggestions",
  "orders",
  "hire_requests",
  "product_categories",
  "categories",
  "testimonials",
];

// Middleware to validate table name
const validateTable = (req, res, next) => {
  const tableName = req.params.table;
  if (!allowedTables.includes(tableName)) {
    logger.warn(`Invalid table name: ${tableName}`);
    return res.status(400).json({ error: `Invalid table name: ${tableName}` });
  }
  logger.info(`valid table name: ${tableName}`);
  next();
};

// Tables whose full contents (incl. PII / password hashes / payment records)
// must NEVER be readable without authentication.
const PROTECTED_READ_TABLES = new Set([
  "members",
  "users",
  "mpesa_request",
  "contributions",
  "orders",
  "hire_requests",
  "suggestions",
]);

// Tables with a legitimate PUBLIC write (public registration / feedback / suggestions)
const PUBLIC_POST_TABLES = new Set([
  "enrollments",
  "testimonials",
  "suggestions",
]);

// Tables so sensitive (PII, password hashes, payment records) that only members
// holding an approved official role may read them. orders/hire_requests contain
// buyer PII (names, phones, addresses) and are therefore official-only too.
// suggestions carries reporter PII (name, phone, email) and is only ever shown
// inside the admin UI, so its reads are official-only as well.
const SENSITIVE_ROLE_READ_TABLES = new Set([
  "members",
  "users",
  "mpesa_request",
  "contributions",
  "orders",
  "hire_requests",
  "suggestions",
]);

// Authz: lock down reads of sensitive tables and ALL writes except public POSTs.
// Role-level enforcement: officials-only reads for the most sensitive tables.
// Writes (POST/PATCH/DELETE) outside the public set are official-only — the
// generic record API accepts arbitrary columns, so a plain member must never
// be allowed to write (e.g. PATCH /members/:id to change email/password).
const authorizeTableAccess = (req, res, next) => {
  const { table } = req.params;
  const method = req.method.toUpperCase();

  if (method === "GET" || method === "HEAD") {
    if (SENSITIVE_ROLE_READ_TABLES.has(table)) {
      return verifyToken(req, res, () => requireRole(...OFFICIAL_ROLES)(req, res, next));
    }
    if (PROTECTED_READ_TABLES.has(table)) return verifyToken(req, res, next);
    return next();
  }

  if (method === "POST" && PUBLIC_POST_TABLES.has(table)) {
    // Public writes: for suggestions, still attach the caller identity when a
    // (valid) token is present so user_id is trusted server-side.
    if (table === "suggestions") {
      return optionalVerifyToken(req, res, () => next());
    }
    return next();
  }
  return verifyToken(req, res, () => requireRole(...OFFICIAL_ROLES)(req, res, next));
};

// GET all data from all tables (must be before /:table route)
// Not used by the frontend; kept behind auth and stripped of sensitive tables.
api.get("/all/data", verifyToken, async (req, res) => {
  try {
    const data = await getAllData();
    for (const key of PROTECTED_READ_TABLES) delete data[key];
    return res.json(data);
  } catch (error) {
    logger.error(`Error in '/all/data': ${error.message}\n${error.stack}`);
    res.status(500).json({ error: error.message });
  }
});

// GET all records from a table
api.get("/:table", validateTable, authorizeTableAccess, async (req, res) => {
  try {
    const { table } = req.params;
    let data = await getTableData(table, req.query);
    
    if (table === 'enrollments') {
      data = data.map(item => {
        if (['charismatic', 'dancers', 'youth'].includes(item.module_id) || ['charismatic', 'dancers', 'youth'].includes(item.class_id)) {
          return {
            id: item.id,
            fullName: item.full_name,
            phoneNumber: item.phone,
            email: item.email || 'N/A',
            registrationDate: item.enrolled_at,
            status: item.status,
            module_id: item.module_id,
            class_id: item.class_id
          };
        }
        return item;
      });
    }

    logger.debug(`Success fetching from route '/:table'`);
    return res.json(data);
  } catch (error) {
    logger.error(`Error in '/:table': ${error.message}\n${error.stack}`);

    // If the error looks like a DB connection problem, return 503 Service Unavailable
    const msg = (error && error.message) ? error.message : '';
    if (msg.includes('connect ECONNREFUSED') || msg.includes('getaddrinfo ENOTFOUND') || msg.includes('database') || msg.includes('connection')) {
      return res.status(503).json({ error: 'Database unavailable. Please try again later.' });
    }

    return res.status(500).json({ error: error.message });
  }
});

// POST create a new record in a table
api.post("/:table", validateTable, authorizeTableAccess, async (req, res) => {
  try {
    const { table } = req.params;
    
    if (table === 'enrollments' && ['charismatic', 'dancers', 'youth'].includes(req.body.community || req.body.module_id)) {
      const targetModule = req.body.community || req.body.module_id;
      const payload = {
        full_name: req.body.fullName || req.body.full_name || req.body.name,
        phone: req.body.phoneNumber || req.body.phone,
        email: req.body.email || '',
        module_id: targetModule,
        class_id: targetModule,
        status: req.body.status || 'Pending'
      };
      req.body = payload;
      logger.info(`Mapping ${targetModule} registration payload: ${JSON.stringify(payload)}`);
    }

    if (table === 'suggestions') {
      // Column allowlist: public submitters can never set status, approval
      // flags, tokens, replies or forge user_id / read-scoped fields.
      const text = String(req.body?.suggestion || '').trim();
      if (!text) return res.status(400).json({ error: "suggestion text is required" });
      const allowedCategories = ['general', 'worship', 'progress', 'feedback', 'other', 'officials', 'jumuiya', 'members', 'ideas', 'requests', 'events'];
      const scope = req.body?.scope === 'jumuiya' ? 'jumuiya' : 'csa';
      req.body = {
        suggestion: text.slice(0, 2000),
        category: allowedCategories.includes(req.body?.category) ? req.body.category : 'general',
        scope,
        jumuiya_id: scope === 'jumuiya' ? String(req.body?.jumuiya_id || '').slice(0, 100) : 'csa',
        name: String(req.body?.name || '').trim().slice(0, 255) || null,
        email: String(req.body?.email || '').trim().slice(0, 255) || null,
        user_id: req.user?.member_id || null,
        status: 'pending',
      };
      logger.info(`Sanitized suggestions payload`);
    }

    const newRecord = await createRecord(table, req.body);
    logger.debug(`newRecord created from route '/:table'`);

    return res.status(201).json(newRecord);
  } catch (error) {
    logger.error(`Error in POST '/:table': ${error.message}`);

    const msg = (error && error.message) ? error.message : '';
    if (msg.includes('connect ECONNREFUSED') || msg.includes('getaddrinfo ENOTFOUND') || msg.includes('database') || msg.includes('connection')) {
      return res.status(503).json({ error: 'Database unavailable. Please try again later.' });
    }

    if (error && error.status) return res.status(error.status).json({ error: error.message });

    return res.status(500).json({ error: error.message });
  }
});

// PATCH update a record in a table
api.patch("/:table/:id", validateTable, authorizeTableAccess, async (req, res) => {
  try {
    const { table, id } = req.params;
    const updated = await updateRecord(table, id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Record not found" });
    }
    return res.json(updated);
  } catch (error) {
    logger.error(`Error in PATCH '/:table/:id': ${error.message}`);
    if (error && error.status) return res.status(error.status).json({ error: error.message });
    return res.status(500).json({ error: error.message });
  }
});

// DELETE a record from a table
api.delete("/:table/:id", validateTable, authorizeTableAccess, async (req, res) => {
  try {
    const { table, id } = req.params;
    const deleted = await deleteRecord(table, id);
    if (!deleted) {
      logger.warn(
        `${(table, id)}  from route '/:table' method delete failed to resolve`,
      );
      return res.status(404).json({ error: "Record not found" });
    }
    res.json(deleted);
  } catch (error) {
    logger.error(`${error.message}  from route '/:table' delete table route`);

    res.status(500).json({ error: error.message });
  }
});
