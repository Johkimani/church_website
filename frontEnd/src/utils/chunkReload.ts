// After a redeploy the browser may still hold an old index.html that points at
// hashed chunk files that no longer exist. A React.lazy dynamic import then
// fails with "Failed to fetch dynamically imported module". A full page reload
// re-fetches the fresh index.html + current chunk names, so we auto-reload
// instead of surfacing a confusing error screen.
const CHUNK_ERROR_RE =
  /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Loading chunk \d+ failed|failed to fetch dynamic import/i;

const CHUNK_RELOAD_KEY = "chunk_reload_at";
const RELOAD_COOLDOWN_MS = 10000;

export const isChunkLoadError = (err: unknown): boolean => {
  const msg = String((err as { message?: string })?.message || err || "");
  return CHUNK_ERROR_RE.test(msg);
};

export const reloadForStaleChunk = (): void => {
  // Guard against a reload loop: if we already reloaded very recently, bail and
  // let the error boundary show its fallback instead.
  try {
    const last = Number(sessionStorage.getItem(CHUNK_RELOAD_KEY) || 0);
    if (Date.now() - last < RELOAD_COOLDOWN_MS) return;
    sessionStorage.setItem(CHUNK_RELOAD_KEY, String(Date.now()));
  } catch {
    /* ignore storage errors */
  }
  window.location.reload();
};
