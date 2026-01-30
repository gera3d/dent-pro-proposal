const APP_VERSION = '2026.01.28.01';
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

// Fetch Event - Serve from Cache, fall back to Network
self.addEventListener('fetch', (e) => {
    // Always fetch version.json from network to check for updates
    if (e.request.url.includes('version.json')) {
        e.respondWith(
            fetch(e.request).catch(() => caches.match(e.request))
        );
        return;
    }

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
