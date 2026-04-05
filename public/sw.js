const CACHE\_NAME = 'critique-v1';
self.addEventListener('install', (event) => { event.waitUntil(
caches.open [1](CACHE\_NAME).then((cache) => cache.addAll(['/']))
);
self.skipWaiting();
});
self.addEventListener('activate', (event) => { event.waitUntil(
caches.keys().then((keys) =>
Promise.all(keys.filter((k) => k !== CACHE\_NAME).map((k) => caches.delete(k)))
)
);
self.clients.claim();
});
self.addEventListener('fetch', (event) => { if (event.request.url.includes('/api/')) return; event.respondWith(
caches.match(event.request).then((cached) => {
const fetched = fetch(event.request).then((response) => { const clone = response.clone();
caches.open [2](CACHE\_NAME).then((cache) => cache.put(event.request, clone)); return response;
}).catch(() => cached);
return cached || fetched;
})
);
});

--
[1] http://caches.open/
[2] http://caches.open/
