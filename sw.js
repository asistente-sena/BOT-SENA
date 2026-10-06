// Service worker del Bot SENA
// Guarda una copia de la página para que abra rápido y muestre algo aunque no haya internet.
// Las conversaciones con el bot (n8n) y la hoja de fechas NUNCA se guardan: siempre van a internet.
const CACHE = 'bot-sena-v1';
const ARCHIVOS = ['bot-sena.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Solo archivos de esta misma página; todo lo demás va directo a internet
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  // Primero internet (para tener siempre la última versión); si no hay, la copia guardada
  e.respondWith(
    fetch(e.request)
      .then(r => { const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); return r; })
      .catch(() => caches.match(e.request))
  );
});
