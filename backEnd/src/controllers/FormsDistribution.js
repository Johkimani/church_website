import { db as pool } from "../Configs/dbConfig.js";

// WhatsApp Groups
export const getWhatsAppGroups = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM whatsapp_groups ORDER BY created_at DESC');
    res.status(200).json({ status: "success", data: result.rows });
  } catch (error) {
    console.error("Error fetching WhatsApp groups:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

export const createWhatsAppGroup = async (req, res) => {
  const { name, invite_link } = req.body;
  if (!name || !invite_link) {
    return res.status(400).json({ status: "error", message: "Name and invite_link are required" });
  }

  try {
    const result = await pool.query(
      'INSERT INTO whatsapp_groups (name, invite_link) VALUES ($1, $2) RETURNING *',
      [name, invite_link]
    );
    res.status(201).json({ status: "success", data: result.rows[0] });
  } catch (error) {
    console.error("Error creating WhatsApp group:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

export const deleteWhatsAppGroup = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM whatsapp_groups WHERE id = $1', [id]);
    res.status(200).json({ status: "success", message: "Group deleted successfully" });
  } catch (error) {
    console.error("Error deleting WhatsApp group:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

// Google Forms Distribution
export const getForms = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT f.*, g.name as group_name 
      FROM google_forms_distribution f
      LEFT JOIN whatsapp_groups g ON f.group_id = g.id
      ORDER BY f.created_at DESC
    `);
    res.status(200).json({ status: "success", data: result.rows });
  } catch (error) {
    console.error("Error fetching forms:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

export const createForm = async (req, res) => {
  const { title, form_link, group_id } = req.body;
  if (!title || !form_link) {
    return res.status(400).json({ status: "error", message: "Title and form_link are required" });
  }

  try {
    const result = await pool.query(
      'INSERT INTO google_forms_distribution (title, form_link, group_id) VALUES ($1, $2, $3) RETURNING *',
      [title, form_link, group_id || null]
    );
    res.status(201).json({ status: "success", data: result.rows[0] });
  } catch (error) {
    console.error("Error creating form:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

export const deleteForm = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM google_forms_distribution WHERE id = $1', [id]);
    res.status(200).json({ status: "success", message: "Form deleted successfully" });
  } catch (error) {
    console.error("Error deleting form:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};
