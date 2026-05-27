/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

const CACHE_NAME = "warungku-cache-v1";
const ASSETS_TO_CACHE = ["/", "/manifest.json", "/styles/globals.css"];
const sw = /** @type {ServiceWorkerGlobalScope} */ (
  /** @type {unknown} */ (self)
);

sw.addEventListener("install", (event) => {
  sw.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE)),
  );
});

sw.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        }),
      ),
    ),
  );
});

sw.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((cached) => cached || fetch(event.request)),
  );
});
