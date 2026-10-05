/* CSA Attendance — offline-first service worker with auto-update. */
const CACHE = "csa-attendance-v9";
const SHELL = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/version.json",
  "/icons/app-icon-192.png",
  "/icons/app-icon-512.png",
  "/icons/app-icon-maskable-192.png",
  "/icons/app-icon-maskable-512.png",
  "/icons/apple-touch-icon.png",
];

/* ── Install: cache the app shell and activate immediately ── */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

/* ── Activate: purge ALL old caches and claim all clients ── */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

/* ── Message handler: respond to version check requests ── */
self.addEventListener("message", (event) => {
  const { type } = event.data || {};
  if (type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

/* ════════════════════════════════════════════════════════════════════
   Background Sync — flush pending tallies when connectivity returns,
   even if the coordinator has not opened the app yet.
   ════════════════════════════════════════════════════════════════════ */

const SYNC_TAG = "csa-attendance-sync";
const FALLBACK_BASE = "https://church-website-q8z9.onrender.com/api/v1";

/* Opens the app's IndexedDB. The database must already exist — opening a
   missing one would create an empty version-1 store set and break the
   page's Dexie schema — so existence is verified first. */
function openDb() {
  return new Promise((resolve, reject) => {
    const onOpen = () => {
      const req = indexedDB.open("csa-attendance");
      req.onsuccess = () => {
        const d = req.result;
        if (!d.objectStoreNames.contains("sessions")) {
          d.close();
          reject(new Error("schema not ready"));
          return;
        }
        resolve(d);
      };
      req.onerror = () => reject(req.error);
      req.onblocked = () => reject(new Error("db blocked"));
    };

    if (typeof indexedDB.databases === "function") {
      indexedDB
        .databases()
        .then((dbs) => {
          const found = dbs.some((d) => d.name === "csa-attendance");
          if (!found) {
            reject(new Error("db missing"));
            return;
          }
          onOpen();
        })
        .catch(() => onOpen());
    } else {
      onOpen();
    }
  });
}

function readOne(db, storeName, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const req = tx.objectStore(storeName).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function readAllPending(db) {
  return new Promise((resolve, reject) => {
    const store = db.transaction("sessions", "readonly").objectStore("sessions");
    const out = [];
    const cursorReq = store.openCursor();
    cursorReq.onsuccess = () => {
      const cursor = cursorReq.result;
      if (cursor) {
        if (!cursor.value.syncedAt) out.push(cursor.value);
        cursor.continue();
      } else {
        resolve(out);
      }
    };
    cursorReq.onerror = () => reject(cursorReq.error);
  });
}

function markSynced(db, session) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("sessions", "readwrite");
    session.syncedAt = Date.now();
    tx.objectStore("sessions").put(session);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

function writeOne(db, storeName, value) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.objectStore(storeName).put(value);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

/**
 * Mints a fresh 15-minute access token from the 20-hour refresh cookie.
 * The service worker cannot read that httpOnly cookie, but `fetch` sends it
 * automatically with credentials: "include". Without this the worker could
 * only ever push inside the access token's short life.
 */
async function renewAccessToken(base, staleToken) {
  try {
    const res = await fetch(`${base}/authentication/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      // Echoed so the server can bind the refresh to the same member.
      body: JSON.stringify({ accessToken: staleToken || "" }),
    });
    if (!res.ok) return null;
    const body = await res.json();
    const token = body && body.accessToken;
    return typeof token === "string" && token ? token : null;
  } catch {
    return null;
  }
}

function pushSessionToServer(base, token, s) {
  const isYear = s.dimension === "year";
  return fetch(`${base}/attendance/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      date: s.date,
      dimension: isYear ? "year" : "jumuiya",
      counts: s.counts.map((c) =>
        isYear
          ? { year: String(c.year || 1), count: c.count }
          : { jumuiya_id: c.jumuiyaId, count: c.count }
      ),
      recordedBy: s.recordedBy || "coordinator",
    }),
  });
}

/**
 * Pushes every unsynced session to the server. Safe to run repeatedly:
 * the backend replaces each date's tallies atomically, so re-pushing a
 * date that already arrived is idempotent (no duplicate rows).
 */
async function flushPending() {
  const db = await openDb();
  try {
    // The service worker cannot read the page's localStorage, so the API
    // base URL is mirrored into IndexedDB by the app.
    const metaBase = await readOne(db, "meta", "base_url");
    const base = (metaBase && metaBase.data) || FALLBACK_BASE;

    const tokenRow = await readOne(db, "session", "token");
    if (!tokenRow || !tokenRow.value) return 0; // signed out — nothing to do
    let token = tokenRow.value;

    const pending = await readAllPending(db);
    let pushed = 0;

    for (const s of pending) {
      let res;
      try {
        res = await pushSessionToServer(base, token, s);
      } catch {
        // Went offline again mid-flush — leave the rest queued.
        break;
      }

      if (res.status === 401) {
        // Access token expired. Renew it from the refresh cookie and retry
        // this same date once; the new token is reused for the rest.
        const fresh = await renewAccessToken(base, token);
        if (!fresh) return pushed; // session genuinely over — needs a sign-in
        token = fresh;
        try {
          await writeOne(db, "session", { key: "token", value: token });
        } catch {
          /* best effort — the page will refresh its own copy on next open */
        }
        try {
          res = await pushSessionToServer(base, token, s);
        } catch {
          break;
        }
        if (res.status === 401) return pushed; // refresh cookie rejected too
      }

      // Role no longer permits this endpoint — retrying will never help.
      if (res.status === 404) return pushed;

      // Transient server error: retrying may help, so keep going.
      if (!res.ok) continue;

      const body = await res.json().catch(() => null);
      const saved = body && body.data && body.data.saved;
      // Never hide a record the server did not actually store.
      if (s.counts.length > 0 && saved === 0) continue;

      await markSynced(db, s);
      pushed += 1;
    }

    return pushed;
  } finally {
    db.close();
  }
}

function notifyClients(pushed) {
  self.clients
    .matchAll({ includeUncontrolled: true })
    .then((clients) => {
      clients.forEach((c) => c.postMessage({ type: "csa:background-sync", pushed }));
    })
    .catch(() => {});
}

self.addEventListener("sync", (event) => {
  if (event.tag !== SYNC_TAG) return;
  event.waitUntil(
    flushPending()
      .then((pushed) => {
        if (pushed > 0) notifyClients(pushed);
      })
      // Throwing rejects the event, so the browser retries the sync later
      // — this is what makes offline records eventually reach the server.
      .catch((err) => {
        throw err;
      })
  );
});

/* Message-triggered flush for browsers without the Background Sync API
   (e.g. iOS Safari), and as an immediate path when connectivity returns. */
self.addEventListener("message", (event) => {
  const { type } = event.data || {};
  if (type === "FLUSH_PENDING") {
    event.waitUntil(
      flushPending()
        .then((pushed) => {
          if (pushed > 0) notifyClients(pushed);
        })
        .catch(() => {})
    );
  }
});

/* ── Fetch strategy ── */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Only handle same-origin requests.
  if (url.origin !== self.location.origin) return;

  // API calls: never cache.
  if (url.pathname.startsWith("/api")) return;

  // version.json: network-only (never cache, always fresh).
  if (url.pathname === "/version.json") {
    event.respondWith(fetch(request));
    return;
  }

  // Navigations: always network-first. Never serve stale index.html.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches
              .open(CACHE)
              .then((c) => c.put("/index.html", copy))
              .catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match("/index.html"))
    );
    return;
  }

  // Static assets (JS, CSS, images): network-first.
  // This ensures new builds are always fetched fresh.
  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches
            .open(CACHE)
            .then((c) => c.put(request, copy))
            .catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(request))
  );
});
