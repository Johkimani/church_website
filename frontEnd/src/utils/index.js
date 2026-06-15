// src/utils/index.js
// Mirrors repo's frontEnd/src/utils/index.ts exactly (JS version)

export const isBrowser = typeof window !== "undefined";

export const timeAgo = (date) => {
  const now = new Date();
  const past = new Date(date);
  const elapsed = now.getTime() - past.getTime();
  const s = 1000, m = s * 60, h = m * 60, d = h * 24, mo = d * 30, yr = d * 365;
  if (elapsed < m)  return Math.round(elapsed / s)  + " seconds ago";
  if (elapsed < h)  return Math.round(elapsed / m)  + " minutes ago";
  if (elapsed < d)  return Math.round(elapsed / h)  + " hours ago";
  if (elapsed < mo) return "approximately " + Math.round(elapsed / d)  + " days ago";
  if (elapsed < yr) return "approximately " + Math.round(elapsed / mo) + " months ago";
  return "approximately " + Math.round(elapsed / yr) + " years ago";
};

// Mirrors repo's LocalStorage class
export class LocalStorage {
  static get(key) {
    if (!isBrowser) return null;
    const value = localStorage.getItem(key);
    if (value) { try { return JSON.parse(value); } catch { return null; } }
    return null;
  }
  static set(key, value) {
    if (!isBrowser) return;
    localStorage.setItem(key, JSON.stringify(value));
  }
  static remove(key) {
    if (!isBrowser) return;
    localStorage.removeItem(key);
  }
}