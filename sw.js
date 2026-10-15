/* ============================================================
   Control Systems Course — service worker
   Makes the app installable and fully offline.

   Strategy:
   - Pre-cache the core app shell on install (the files needed
     for the app to boot with no network).
   - Runtime cache-first for every other same-origin GET, so the
     20 KaTeX font files (and anything else) are cached the first
     time they load online, then served offline thereafter.

   UPDATING THE APP: bump CACHE_VERSION below whenever content or
   code changes. The old cache is deleted on activate, so the phone
   pulls the new version on next open.
   ============================================================ */
const CACHE_VERSION = "ctrl-v3";
const CACHE_NAME = "ctrl-course-" + CACHE_VERSION;

/* Core shell — relative paths so it works under a /repo-name/ subpath. */
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./sims.js",
  "./curriculum.js",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-512-maskable.png",
  "./katex/katex.min.css",
  "./katex/katex.min.js",
  "./katex/contrib/auto-render.min.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // only handle our own files

  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(resp => {
        // cache successful same-origin responses (e.g. KaTeX fonts) for next time
        if (resp && resp.status === 200 && resp.type === "basic") {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        }
        return resp;
      }).catch(() => {
        // offline and not cached: for navigations, fall back to the app shell
        if (req.mode === "navigate") return caches.match("./index.html");
      });
    })
  );
});
