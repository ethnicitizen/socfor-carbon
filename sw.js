const CACHE_NAME = 'karbon-kemantan-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './app.js',
    './manifest.json',
    'https://jsdelivr.net'
];

// Tahap Install: Menyimpan aset utama ke memori cache HP
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Menyimpan aset ke cache internal...');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// Tahap Aktivasi: Pembersihan cache versi lama jika ada pembaruan kode
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Menghapus cache usang:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Tahap Fetch: Mengambil data dari cache internal saat tidak ada sinyal internet
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse; // Gunakan aset dari cache jika offline
                }
                return fetch(event.request); // Ambil dari internet jika online
            })
    );
});
