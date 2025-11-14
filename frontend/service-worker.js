// frontend/service-worker.js
const CACHE_NAME = "metegram-static-v1";
const ASSETS = [ "/", "/frontend/index.html", "/frontend/style.css", "/frontend/App.js", "/frontend/extra.js" ];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("fetch", (e) => {
  if(e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).catch(()=> caches.match("/frontend/index.html"))));
});
