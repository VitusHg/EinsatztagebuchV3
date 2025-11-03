const CACHE_NAME = 'etb-cache-v2';
const ASSETS = [
  './index.html',
  './manifest.webmanifest',
  './sw.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((c)=>c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))))
  );
  self.clients.claim();
});
self.addEventListener('fetch', (event) => {
  const req = event.request;
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        if (req.method==='GET' && res && (res.status===200 || res.type==='opaque')) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c=>c.put(req, clone));
        }
        return res;
      }).catch(()=>{
        if (req.mode==='navigate') return caches.match('./index.html');
      });
    })
  );
});
