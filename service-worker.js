const APP_VERSION = '2026.02.19.02';
const CACHE_NAME = 'dent-experts-v' + APP_VERSION;
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './logo.webp',
    './app-icon.png',
    './version.json',
    './Option_B_Custom_WebApp/Training_Guide.html',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

// Install Event - Cache Files
self.addEventListener('install', (e) => {
    console.log('[Service Worker] Install - Version:', APP_VERSION);
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching all: app shell and content');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    // Force this service worker to become active immediately
    self.skipWaiting();
});

// Fetch Event
// - HTML / navigation requests → NETWORK-FIRST (always get fresh code when online)
// - version.json → NETWORK-ONLY (for update checks)
// - Everything else (images, fonts, css) → CACHE-FIRST (fast offline loads)
self.addEventListener('fetch', (e) => {
    const url = e.request.url;

    // version.json — always from network
    if (url.includes('version.json') || url.includes('config.json')) {
        e.respondWith(
            fetch(e.request).catch(() => caches.match(e.request))
        );
        return;
    }

    // API calls — NEVER cache, always fetch from network
    if (url.includes('api.airtable.com') || url.includes('airtableusercontent.com') || url.includes('api.gohighlevel.com') || url.includes('tmpfiles.org')) {
        e.respondWith(fetch(e.request));
        return;
    }

    // HTML / navigation requests — NETWORK-FIRST
    // This ensures code changes are picked up immediately when online.
    if (e.request.mode === 'navigate' || url.endsWith('.html') || url.endsWith('/')) {
        e.respondWith(
            fetch(e.request).then((response) => {
                // Cache the fresh response for offline use
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
                return response;
            }).catch(() => {
                // Offline — fall back to cache
                return caches.match(e.request);
            })
        );
        return;
    }

    // All other assets — CACHE-FIRST
    e.respondWith(
        caches.match(e.request).then((r) => {
            return r || fetch(e.request).then((response) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(e.request, response.clone());
                    return response;
                });
            });
        })
    );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (e) => {
    console.log('[Service Worker] Activate - Version:', APP_VERSION);
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    console.log('[Service Worker] Removing old cache:', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    // Take control of all pages immediately
    self.clients.claim();
});

// Message listener for cache clearing
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        console.log('[Service Worker] Clearing all caches...');
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => caches.delete(key)));
        }).then(() => {
            console.log('[Service Worker] All caches cleared');
            event.ports[0].postMessage({ success: true });
        });
    }
});
