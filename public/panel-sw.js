// Service worker del panel. Solo guarda la página "Sin conexión":
// las citas y los datos de clientas nunca se guardan en el dispositivo.
const CACHE = 'dbonita-panel-v2'
const OFFLINE_URL = '/panel-offline.html'
const OFFLINE_ASSETS = [OFFLINE_URL, '/icons/icon-192.png']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(OFFLINE_ASSETS)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    // Siempre a la red (sin caché del navegador) para no mostrar una copia vieja sin estilos
    const red = fetch(event.request.url, { cache: 'no-store', credentials: 'same-origin', redirect: 'manual' })
    event.respondWith(red.catch(() => caches.match(OFFLINE_URL)))
    return
  }
  if (new URL(event.request.url).pathname === '/icons/icon-192.png') {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)))
  }
})
