const APP_VERSION = '2026.04.10.03';
const CACHE_NAME = 'stormopsflow-v' + APP_VERSION;
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './logo.webp',
    './app-icon.png',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/icon-1024.png',
    './icons/apple-touch-icon.png',
    './icons/favicon-32.png',
    './icons/favicon-16.png',
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

            // Bypass browser HTTP cache to assure we only cache fresh files
            return Promise.all(
                ASSETS_TO_CACHE.map(url => {
                    const cacheBustUrl = url + (url.includes('?') ? '&' : '?') + '_cb=' + Date.now();
                    return fetch(cacheBustUrl).then(response => {
                        if (!response.ok) throw new Error('Fetch failed for ' + url);
                        return cache.put(url, response);
                    }).catch(err => {
                        // Don't fail entire install if one asset is missing
                        console.warn('[Service Worker] Could not cache:', url, err.message);
                    });
                })
            );
        })
    );
    // Force this service worker to become active immediately
    self.skipWaiting();
});

// Fetch Event
// - Only handle GET requests — POST/PUT/DELETE are passed through untouched (Cache API doesn't support them)
// - version.json / config.json → NETWORK-FIRST, fallback to a 503 if not cached
// - api.* calls → NETWORK-ONLY, never cache
// - HTML / navigation → NETWORK-FIRST, cache the response for offline
// - Everything else (images, fonts, css) → CACHE-FIRST
// Transparent 1×1 GIF used as a fallback for missing favicon to avoid SW errors
const EMPTY_GIF = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

self.addEventListener('fetch', (e) => {
    const req = e.request;

    // CRITICAL: Only intercept GET requests. POST/PUT/DELETE must pass through as-is.
    // Attempting to cache non-GET requests throws "Request method 'POST' is unsupported".
    if (req.method !== 'GET') {
        return; // Let the browser handle it normally
    }

    const url = req.url;

    // favicon.ico — return an inline transparent 1×1 GIF to avoid network errors
    if (url.endsWith('favicon.ico') || url.includes('favicon.ico')) {
        e.respondWith(
            caches.match(req).then(cached => {
                if (cached) return cached;
                return new Response(
                    Uint8Array.from(atob(EMPTY_GIF), c => c.charCodeAt(0)),
                    { status: 200, headers: { 'Content-Type': 'image/gif' } }
                );
            })
        );
        return;
    }

    // version.json / config.json — always try network, fallback to cache or 503
    if (url.includes('version.json') || url.includes('config.json')) {
        e.respondWith(
            fetch(req).then((response) => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
                }
                return response;
            }).catch(() => {
                return caches.match(req).then(cached => {
                    if (cached) return cached;
                    // Return a valid 503 response instead of undefined
                    return new Response('{"error":"offline"}', {
                        status: 503,
                        headers: { 'Content-Type': 'application/json' }
                    });
                });
            })
        );
        return;
    }

    // API calls — NEVER cache, always pass straight to network
    if (
        url.includes('api.airtable.com') ||
        url.includes('airtableusercontent.com') ||
        url.includes('airtable.com') ||
        url.includes('api.gohighlevel.com') ||
        url.includes('services.leadconnectorhq.com') ||
        url.includes('tmpfiles.org') ||
        url.includes('script.google.com') ||
        url.includes('googleapis.com') ||
        url.includes('leadconnectorhq.com')
    ) {
        e.respondWith(fetch(req));
        return;
    }

    // HTML / navigation requests — NETWORK-FIRST
    if (req.mode === 'navigate' || url.endsWith('.html') || url.endsWith('/')) {
        e.respondWith(
            fetch(req).then((response) => {
                if (!response || !response.ok) {
                    return response;
                }
                // Cache the fresh response for offline use
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
                return response;
            }).catch(() => {
                // Offline — fall back to cache
                return caches.match(req).then((cached) => {
                    if (cached) return cached;
                    return caches.match('./index.html').then((appShell) => {
                        if (appShell) return appShell;
                        return new Response('Offline', { status: 503, statusText: 'Offline' });
                    });
                });
            })
        );
        return;
    }

    // All other GET assets — CACHE-FIRST
    e.respondWith(
        caches.match(req).then((r) => {
            if (r) return r;
            return fetch(req).then((response) => {
                // Only cache valid, same-origin responses
                if (response && response.status === 200 && response.type !== 'opaque') {
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(req, response.clone());
                        return response;
                    });
                }
                return response;
            }).catch(() => {
                // Prevent unhandled rejection — return a 404 instead of crashing the SW
                return new Response('Not found', { status: 404, statusText: 'Not Found' });
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
        const replyPort = event.ports && event.ports[0];
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => caches.delete(key)));
        }).then(() => {
            console.log('[Service Worker] All caches cleared');
            if (replyPort) replyPort.postMessage({ success: true });
        }).catch((error) => {
            console.warn('[Service Worker] Failed to clear caches', error);
            if (replyPort) replyPort.postMessage({ success: false, error: String(error?.message || error) });
        });
    }
});
