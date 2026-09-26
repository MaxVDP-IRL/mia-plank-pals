// sw.js — bump VERSION on EVERY release (must equal APP_VERSION in js/config.js).
const VERSION = '1.1.0';
const CACHE = `plank-pals-${VERSION}`;
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/app.css',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './js/main.js',
  './js/config.js',
  './js/catalog.js',
  './js/strings.js',
  './js/storage.js',
  './js/store.js',
  './js/router.js',
  './js/logic/dates.js',
  './js/logic/stopwatch.js',
  './js/logic/cues.js',
  './js/logic/goal.js',
  './js/logic/streak.js',
  './js/logic/rewards.js',
  './js/logic/session.js',
  './js/logic/stats.js',
  './js/logic/backup.js',
  './js/logic/gate.js',
  './js/platform/audio.js',
  './js/platform/speech.js',
  './js/platform/wakelock.js',
  './js/platform/device.js',
  './js/ui/dom.js',
  './js/ui/pup.js',
  './js/ui/fx.js',
  './js/ui/stickerArt.js',
  './js/ui/gateModal.js',
  './js/ui/flow.js',
  './js/ui/exercise.js',
  './js/screens/setup.js',
  './js/screens/meet.js',
  './js/screens/home.js',
  './js/screens/plank.js',
  './js/screens/squats.js',
  './js/screens/celebrate.js',
  './js/screens/stickers.js',
  './js/screens/progress.js',
  './js/screens/parent.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      // cache:'reload' bypasses GitHub Pages' 10-minute HTTP cache so a new version never caches old files
      .then((cache) => cache.addAll(ASSETS.map((url) => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('plank-pals-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;            // the app makes no cross-origin requests anyway
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit;                                       // cache-first
      return fetch(req).catch(() =>
        req.mode === 'navigate' ? caches.match('./index.html') : Response.error());  // offline navigation → app shell
    })
  );
});
