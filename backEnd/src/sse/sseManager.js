import logger from "../logger/winston.js";

/**
 * In-memory registry of all active SSE clients.
 *
 * key   → memberId (string)
 * value → { res, jumuiyaId, memberId }
 *
 * Three logical channels are implemented via this single registry:
 *   • CSA      – all clients  (broadcastToAll)
 *   • Jumuiya  – clients with matching jumuiyaId  (broadcastToJumuiya)
 *   • Individual – single member  (sendToUser)
 */
const clients = new Map();

// ─── Internal helpers ──────────────────────────────────────────────────────────

const writeEvent = (res, eventName, data) => {
  try {
    res.write(`event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`);
  } catch (err) {
    logger.warn(`[SSE] Write failed: ${err.message}`);
  }
};

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Register a new SSE client.
 * If the same member already has an open connection (e.g., opened a second tab),
 * the old connection is closed gracefully before registering the new one.
 */
export const addSSEClient = (memberId, jumuiyaId, res) => {
  const id = String(memberId);

  if (clients.has(id)) {
    try { clients.get(id).res.end(); } catch {}
  }

  clients.set(id, { res, jumuiyaId: String(jumuiyaId ?? ""), memberId: id });
  logger.info(`[SSE] +client member:${id} jumuiya:${jumuiyaId} | total:${clients.size}`);
};

/**
 * Remove a client from the registry on disconnect.
 *
 * Identity-guarded: only deletes if the current entry still belongs to the
 * closing response. Without this, superseding a stale connection (see
 * addSSEClient) would cause the old connection's "close" handler to delete
 * the NEW connection from the registry, silently killing the active stream.
 */
export const removeSSEClient = (memberId, res) => {
  const id   = String(memberId);
  const current = clients.get(id);
  if (current && current.res === res) {
    clients.delete(id);
    logger.info(`[SSE] -client member:${memberId} | total:${clients.size}`);
  }
};

/**
 * Broadcast an SSE event to ALL connected clients.
 * Used for CSA-level notifications (every authenticated member receives it).
 */
export const broadcastToAll = (eventName, data) => {
  let n = 0;
  for (const [, client] of clients) {
    writeEvent(client.res, eventName, data);
    n++;
  }
  if (n > 0) logger.info(`[SSE] broadcast "${eventName}" → ${n} clients`);
};

/**
 * Broadcast an SSE event only to clients belonging to a specific jumuiya.
 * Used for jumuiya-level notifications.
 */
export const broadcastToJumuiya = (jumuiyaId, eventName, data) => {
  const target = String(jumuiyaId);
  let n = 0;
  for (const [, client] of clients) {
    if (client.jumuiyaId === target) {
      writeEvent(client.res, eventName, data);
      n++;
    }
  }
  logger.info(`[SSE] jumuiya "${eventName}" → jumuiya:${target} | ${n} clients`);
};

/**
 * Send an SSE event to a single specific user (individual / badge channel).
 */
export const sendToUser = (memberId, eventName, data) => {
  const client = clients.get(String(memberId));
  if (client) writeEvent(client.res, eventName, data);
};

/** Returns the number of currently connected SSE clients. */
export const getClientCount = () => clients.size;
