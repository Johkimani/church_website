import pg from "pg";
const { Pool, types } = pg;
import dotenv from "dotenv";
import logger from "../logger/winston.js";

// Parse timestamp without timezone (OID 1114) as UTC
types.setTypeParser(1114, (str) => new Date(str + "Z"));


// Ensure we load the backend env file (church_website/backEnd/.env)
// rather than whatever the process CWD happens to be.
dotenv.config({
  path: new URL("../../.env", import.meta.url),
});




const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "csa_db",
  ssl:
    // Explicit control: set DB_SSL=true when your Postgres requires SSL.
    // Certificate validation is ON by default (rejectUnauthorized: true) —
    // managed providers like Render use publicly-trusted certificates, so
    // the TLS session is verified against the Node CA store and MitM is
    // rejected. Only set DB_SSL_ALLOW_SELF_SIGNED=true for a database whose
    // certificate cannot be validated (e.g. a self-signed local dev server),
    // and never in production.
    process.env.DB_SSL === "true"
      ? { rejectUnauthorized: process.env.DB_SSL_ALLOW_SELF_SIGNED !== "true" }
      : false,
});


export const db = pool;

export let client = undefined;
export const connectDb = async () => {
  try {
    client = await pool.connect();
    logger.info("Connected to postgree database successfully!");
  } catch (error) {
    logger.error(`Failed to connect postgree database: ${error.message}`, {
      stack: error.stack,
    });
    // Removed process.exit(1) to allow server to stay alive and retry connections via pool
  }
};

// use the pool for queries to handle connections automatically
export const testDb = {
  query: (text, params) => pool.query(text, params)
};

/**
 * Run fn(client) inside a single-connection transaction.
 * BEGIN/COMMIT/ROLLBACK run on the SAME pooled connection, so the
 * transaction is genuinely atomic and the connection is always released.
 * Throw from fn to roll back and re-throw the original error.
 */
export const withTransaction = async (fn) => {
  const client = await pool.connect();
  let destroyOnRelease = false;
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (_) {
      // Connection may be broken; drop it instead of returning it to the pool.
      destroyOnRelease = true;
    }
    throw error;
  } finally {
    client.release(destroyOnRelease);
  }
};


