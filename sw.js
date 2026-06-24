// ============================================================
//  SERVICE WORKER — Cache offline + Push Notifications
// ============================================================

const CACHE_NAME = 'agente90-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/config.js',
  '/tasks-data.js',
  '/db.js',
  '/push.js',
  '/app.js',
  '/manifest.json',
  '/icon.svg',
];

// Instalar y cachear archivos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activar y limpiar caches viejos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Responder con cache cuando no hay internet
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

// ============================================================
//  PUSH NOTIFICATIONS — Recibe y muestra notificaciones
// ============================================================

self.addEventListener('push', event => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { titulo: 'Agente 90 Días', cuerpo: event.data ? event.data.text() : 'Hora de tu tarea' };
  }

  const titulo = data.titulo || '🏠 Agente 90 Días';
  const opciones = {
    body: data.cuerpo || 'Revisá tu tarea del día',
    icon: '/icon.svg',
    badge: '/icon.svg',
    tag: data.taskId ? `task-${data.taskId}` : 'agente-notif',
    requireInteraction: data.esOro || false,
    vibrate: data.esOro ? [200, 100, 200, 100, 200] : [200, 100, 200],
    data: { url: data.url || '/' },
    actions: [
      { action: 'ver', title: '✅ Ver tarea' },
      { action: 'cerrar', title: '❌ Cerrar' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(titulo, opciones)
  );
});

// Click en la notificación
self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'cerrar') return;

  const urlToOpen = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(urlToOpen);
          return;
        }
      }
      return clients.openWindow(urlToOpen);
    })
  );
});
