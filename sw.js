// Сервис-воркер PWA: игра с ботом работает без сети.
// Страница (index.html) — сначала из сети, чтобы после выкладки сразу открывалась новая
// версия; без сети — из кэша. Файлы сборки с хэшем в имени не меняются — из кэша.
const CACHE = 'kd-v2';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) =>
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  ),
);

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const hit = await cache.match(req);
      const fromNet = () =>
        fetch(req).then((res) => {
          if (res.ok) cache.put(req, res.clone());
          return res;
        });
      if (req.mode === 'navigate') return fromNet().catch(() => hit ?? cache.match('./'));
      return hit ?? fromNet();
    }),
  );
});
