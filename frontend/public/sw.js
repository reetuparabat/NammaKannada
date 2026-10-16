/**
 * NammaKannada Service Worker (v2)
 * Secure, offline-first caching strategy.
 * 
 * Rules:
 * 1. Only static assets and explicit public shells are cached.
 * 2. Administrative and authenticated endpoints are strictly excluded.
 * 3. Never cache unpublished, draft, or sensitive responses.
 * 4. Gracefully fall back to /offline shell for navigation failures.
 */

const CACHE_NAME = 'nammakannada-v2';

const OFFLINE_SHELL_URLS = [
  '/',
  '/offline',
  '/saved',
  '/progress',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

// Install: Pre-cache core public app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_SHELL_URLS).catch((err) => {
        console.warn('Pre-caching some offline shell URLs failed:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: Purge old caches (including nammaconnect-v1 to remove any inadvertently cached data)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('Purging legacy service worker cache:', name);
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Helper: Determine if URL is static asset
function isStaticAsset(url) {
  return (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|woff2?|webp|json)$/i)
  );
}

// Helper: Determine if request is an administrative or sensitive endpoint
function isSensitiveOrAdmin(url, request) {
  const path = url.pathname.toLowerCase();
  if (
    path.startsWith('/admin') ||
    path.startsWith('/api/v1/admin') ||
    path.includes('/docs') ||
    path.includes('/redoc') ||
    path.includes('/openapi.json')
  ) {
    return true;
  }
  // If authorization header is present, never store in shared cache
  if (request.headers.has('Authorization')) {
    return true;
  }
  return false;
}

// Fetch: Secure network-first with targeted fallback
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip non-http schemes
  if (!url.protocol.startsWith('http')) return;

  // STRICT RULE: Never cache or intercept administrative / sensitive endpoints
  if (isSensitiveOrAdmin(url, event.request)) {
    return; // Let browser perform direct network fetch without SW caching
  }

  // Handle Static Assets & Shell Cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Only cache successful basic responses
        if (response && response.status === 200 && response.type === 'basic') {
          // Explicitly check what is eligible for caching:
          // 1. Static frontend assets (_next/static, fonts, icons)
          // 2. Public offline manifest API
          // 3. Predefined shell pages
          const isEligible =
            isStaticAsset(url) ||
            url.pathname === '/api/v1/offline/manifest' ||
            OFFLINE_SHELL_URLS.includes(url.pathname);

          if (isEligible) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache).catch((err) => {
                console.warn('Failed to cache response:', err);
              });
            });
          }
        }
        return response;
      })
      .catch(async () => {
        // Network failed — try to serve from cache
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // If navigation request fails, return cached /offline shell
        if (event.request.mode === 'navigate') {
          const offlinePage = await caches.match('/offline');
          if (offlinePage) {
            return offlinePage;
          }
        }

        return new Response(
          JSON.stringify({
            error: 'offline',
            message: 'You are currently offline. Please reconnect to access this content.',
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      })
  );
});
