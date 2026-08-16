/* Hand-written service worker for the offline CSA Attendance app. */
const CACHE = "csa-attendance-v1";
const SHELL = ["/", "/index.html", "/manifest.webmanifest", "/icons/app-icon-192.png", "/icons/app-icon-512.png", "/icons/app-icon-maskable-192.png", "/icons/app-icon-maskable-512.png", "/icons/apple-touch-icon.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle same-origin requests.
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // API calls: never cache — let the sync layer handle offline queues.
  if (url.pathname.startsWith("/api")) return;

  // Navigations: network-first, fall back to cached shell.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put("/index.html", copy)).catch(() => {});
        return res;
      }).catch(() => caches.match("/index.html"))
    );
    return;
  }

  // Static assets: stale-while-revalidate.
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});