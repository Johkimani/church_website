// Per-phone-number STK push flood throttle.
//
// IP-based rate limiting alone does not stop an attacker rotating IPs to
// bombard one victim's phone with payment prompts. This adds a server-wide
// sliding-window cap keyed on the destination phone number:
//   - max 3 pushes per phone per 10 minutes
//   - max 8 pushes per phone per rolling day
//
// In-memory by design: cheap, zero-infrastructure, and worst case after a
// server restart the IP limiter still applies. Do not store PII beyond the
// normalized phone string and timestamps.

const SHORT_WINDOW_MS = 10 * 60 * 1000;
const SHORT_MAX = 3;
const DAY_MS = 24 * 60 * 60 * 1000;
const DAY_MAX = 8;

const hits = new Map();

const normalizePhone = (phone) => {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length < 9) return null;
  // Treat 07XXXXXXXX / +2547XXXXXXXX / 2547XXXXXXXX as the same subscriber.
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  if (digits.startsWith("254")) return digits;
  return digits;
};

let lastSweep = Date.now();
const sweep = (now) => {
  if (now - lastSweep < 60 * 1000) return;
  lastSweep = now;
  for (const [key, entry] of hits) {
    entry.recent = entry.recent.filter((t) => now - t < SHORT_WINDOW_MS);
    if (now - entry.dayStart >= DAY_MS) {
      entry.dayStart = now;
      entry.dayCount = 0;
    }
    if (entry.recent.length === 0 && entry.dayCount === 0) hits.delete(key);
  }
};

/**
 * Returns true when the push is allowed, false when this phone has been
 * flooded recently. Records the attempt ONLY on success (callers retry on
 * Safaricom errors without burning the victim's budget).
 */
export const allowPhonePush = (phone) => {
  const key = normalizePhone(phone);
  if (!key) return true; // invalid numbers are rejected by validation anyway

  const now = Date.now();
  sweep(now);

  let entry = hits.get(key);
  if (!entry) {
    entry = { recent: [], dayStart: now, dayCount: 0 };
    hits.set(key, entry);
  }

  entry.recent = entry.recent.filter((t) => now - t < SHORT_WINDOW_MS);
  if (now - entry.dayStart >= DAY_MS) {
    entry.dayStart = now;
    entry.dayCount = 0;
  }

  if (entry.recent.length >= SHORT_MAX || entry.dayCount >= DAY_MAX) {
    return false;
  }
  return true;
};

export const recordPhonePush = (phone) => {
  const key = normalizePhone(phone);
  if (!key) return;
  const now = Date.now();
  let entry = hits.get(key);
  if (!entry) {
    entry = { recent: [], dayStart: now, dayCount: 0 };
    hits.set(key, entry);
  }
  entry.recent.push(now);
  entry.dayCount += 1;
};
