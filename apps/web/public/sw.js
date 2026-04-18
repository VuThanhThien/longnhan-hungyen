/**
 * Offline shell: network-first HTML, stale-while-revalidate for static/public.
 * Service-down: redirect to /service-unavailable (precached) on 502/503/504 or network error.
 * Bump VERSION when changing caching rules so old caches are purged.
 */
const VERSION = 'longnhan-web-sw-v3';
const PAGES_CACHE = `${VERSION}-pages`;
const STATIC_CACHE = `${VERSION}-static`;
const RUNTIME_CACHE = `${VERSION}-runtime`;
const SERVICE_UNAVAILABLE_PATH = '/service-unavailable';

const ALLOWED_CACHES = new Set([PAGES_CACHE, STATIC_CACHE, RUNTIME_CACHE]);
const LOG_PREFIX = '[LongNhan SW:worker]';

self.addEventListener('install', (event) => {
  console.log(`${LOG_PREFIX} install — version`, VERSION);
  self.skipWaiting();
  event.waitUntil(
    caches.open(PAGES_CACHE).then((cache) =>
      Promise.all([
        cache.add(new Request('/', { cache: 'reload' })).catch((e) => {
          console.warn(
            `${LOG_PREFIX} precache / failed (ok on first visit)`,
            e,
          );
        }),
        cache
          .add(
            new Request(SERVICE_UNAVAILABLE_PATH, {
              cache: 'reload',
            }),
          )
          .catch((e) => {
            console.warn(
              `${LOG_PREFIX} precache ${SERVICE_UNAVAILABLE_PATH} failed`,
              e,
            );
          }),
      ]),
    ),
  );
});

self.addEventListener('activate', (event) => {
  console.log(`${LOG_PREFIX} activate — claiming clients, pruning old caches`);
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      const removed = keys.filter((k) => !ALLOWED_CACHES.has(k));
      await Promise.all(removed.map((k) => caches.delete(k)));
      if (removed.length) {
        console.log(`${LOG_PREFIX} deleted stale caches:`, removed);
      }
      await self.clients.claim();
      console.log(`${LOG_PREFIX} activate — ready (${VERSION})`);
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/monitoring') ||
    url.pathname.startsWith('/_next/data')
  ) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstPage(event, request));
    return;
  }

  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(staleWhileRevalidate(event, request, STATIC_CACHE));
    return;
  }

  if (
    /\.(css|png|jpg|jpeg|gif|webp|avif|svg|ico|woff2?|ttf|eot)$/i.test(
      url.pathname,
    )
  ) {
    event.respondWith(staleWhileRevalidate(event, request, RUNTIME_CACHE));
    return;
  }
});

function isUpstreamFailureStatus(status) {
  return status === 502 || status === 503 || status === 504;
}

async function matchCachedPath(cache, path) {
  const absolute = new URL(path, self.location.origin).href;
  return (
    (await cache.match(absolute)) ||
    (await cache.match(new Request(path))) ||
    (await cache.match(path))
  );
}

/**
 * Prefer network; cache successful HTML. Upstream 502/503/504 → redirect to SU page.
 * Network error → same URL cache, else redirect to cached SU page.
 */
async function networkFirstPage(event, request) {
  const url = new URL(request.url);
  const isSuRoute = url.pathname === SERVICE_UNAVAILABLE_PATH;
  const cache = await caches.open(PAGES_CACHE);

  try {
    const networkResponse = await fetch(request, { redirect: 'follow' });

    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
      return networkResponse;
    }

    if (isUpstreamFailureStatus(networkResponse.status)) {
      if (isSuRoute) {
        const cachedSu = await matchCachedPath(cache, SERVICE_UNAVAILABLE_PATH);
        if (cachedSu) return cachedSu;
        return minimalServiceUnavailableResponse();
      }
      console.log(
        `${LOG_PREFIX} upstream ${networkResponse.status} — redirecting to ${SERVICE_UNAVAILABLE_PATH}`,
      );
      return Response.redirect(
        new URL(SERVICE_UNAVAILABLE_PATH, self.location.origin).href,
        302,
      );
    }

    return networkResponse;
  } catch (err) {
    console.warn(`${LOG_PREFIX} network error for navigation`, err);

    const cachedNav = await cache.match(request);
    if (cachedNav) return cachedNav;

    if (isSuRoute) {
      const cachedSu = await matchCachedPath(cache, SERVICE_UNAVAILABLE_PATH);
      if (cachedSu) return cachedSu;
      return minimalServiceUnavailableResponse();
    }

    const cachedSu = await matchCachedPath(cache, SERVICE_UNAVAILABLE_PATH);
    if (cachedSu) {
      return Response.redirect(
        new URL(SERVICE_UNAVAILABLE_PATH, self.location.origin).href,
        302,
      );
    }

    const root = new URL('/', self.location.origin).href;
    if (request.url === root || request.url.startsWith(`${root}?`)) {
      const cachedRoot = await matchCachedPath(cache, '/');
      if (cachedRoot) return cachedRoot;
    }

    return minimalServiceUnavailableResponse();
  }
}

/** Last-resort HTML when no precache and no network (UTF-8 Vietnamese). */
function minimalServiceUnavailableResponse() {
  const html = `<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Tạm ngưng phục vụ</title></head><body style="font-family:system-ui,-apple-system,sans-serif;max-width:28rem;margin:4rem auto;padding:0 1rem;text-align:center;color:#201d18"><p style="font-size:3rem;font-weight:800;margin:0">503</p><h1 style="font-size:1.25rem;font-weight:700">Hệ thống tạm không phản hồi</h1><p style="color:#555;line-height:1.5">Chưa có bản lưu đầy đủ. Kiểm tra kết nối mạng hoặc thử lại sau.</p><p style="margin-top:1.5rem"><a href="/" style="color:#166534;font-weight:600">Về trang chủ</a></p></body></html>`;
  return new Response(html, {
    status: 503,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

async function staleWhileRevalidate(event, request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => undefined);

  if (cached) {
    event.waitUntil(networkPromise);
    return cached;
  }

  try {
    const response = await networkPromise;
    if (response) return response;
  } catch {
    /* fall through */
  }
  return new Response('', { status: 504, statusText: 'Gateway Timeout' });
}
