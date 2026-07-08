// Minimal offline app-shell cache for Sara's Birdhouse.
// Network-first for navigations (so live data stays fresh), falling back to
// the cached shell when offline; cache-first for static artwork/icons.
const SHELL_CACHE = "birdhouse-shell-v1";
const SHELL_ASSETS = ["/", "/manifest.webmanifest", "/icons/app-icon.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== SHELL_CACHE).map((key) => caches.delete(key)))
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const isArtwork = url.pathname.startsWith("/artwork/") || url.pathname.startsWith("/icons/");

  if (isArtwork) {
    event.respondWith(
      caches.open(SHELL_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        cache.put(request, response.clone());
        return response;
      })
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/").then((res) => res ?? Response.error()))
    );
  }
});
