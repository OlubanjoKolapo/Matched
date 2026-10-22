/*
 * Matched service worker: makes the app open and work offline.
 *
 * Every page is static and all data lives in IndexedDB, so offline support is
 * just caching the right files:
 * - Pages: network first, falling back to the cached copy (then to Today).
 * - Hashed build assets, fonts, icons and sample art: cache first. They never change.
 * - The background-removal model (versioned CDN path): cache first, so the
 *   second photo is fast and cutouts work offline once it has loaded.
 * - The tagging API and anything else: straight to the network.
 *
 * Bump VERSION to drop old caches after a change to this file.
 */
const VERSION = 'v1';
const PAGES = `matched-pages-${VERSION}`;
const ASSETS = `matched-assets-${VERSION}`;
const MODEL = `matched-model-${VERSION}`;

const ROUTES = ['/', '/wardrobe', '/wardrobe/stats', '/match', '/learn', '/add', '/settings', '/onboarding'];
const MODEL_HOST = 'staticimgly.com';
const NETWORK_TIMEOUT_MS = 3500;

/** Build assets a page refers to, so one visit caches everything it needs. */
function assetsIn(html) {
  return [...new Set(html.match(/\/_next\/static\/[^"'\s)\\]+/g) ?? [])];
}

async function precache() {
  const pages = await caches.open(PAGES);
  const assets = await caches.open(ASSETS);
  await Promise.all(
    ROUTES.map(async (route) => {
      try {
        const response = await fetch(route, { cache: 'no-cache' });
        if (!response.ok) return;
        await pages.put(route, response.clone());
        const urls = assetsIn(await response.text());
        await Promise.all(urls.map((url) => assets.add(url).catch(() => undefined)));
      } catch {
        // Offline during install: the page is cached on its next visit instead.
      }
    }),
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  const keep = new Set([PAGES, ASSETS, MODEL]);
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith('matched-') && !keep.has(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

function timeout(ms) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms));
}

async function page(request) {
  const url = new URL(request.url);
  const cache = await caches.open(PAGES);
  try {
    const response = await Promise.race([fetch(request), timeout(NETWORK_TIMEOUT_MS)]);
    if (response.ok && response.type === 'basic') await cache.put(url.pathname, response.clone());
    return response;
  } catch {
    return (
      (await cache.match(url.pathname)) ??
      (await cache.match('/')) ??
      new Response('Matched is offline and this page has not been saved yet.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      })
    );
  }
}

async function cacheFirst(request, name) {
  const cache = await caches.open(name);
  const hit = await cache.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  if (response.ok) await cache.put(request, response.clone());
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (url.hostname === MODEL_HOST) {
    event.respondWith(cacheFirst(request, MODEL));
    return;
  }
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(page(request));
    return;
  }
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/') || url.pathname.startsWith('/sample/')) {
    event.respondWith(cacheFirst(request, ASSETS));
  }
});
