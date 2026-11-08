/* Light for Every Day — service worker: offline shell + cached messages */
const VERSION = 'ld-v202611082157';
const SHELL = ['./', './index.html', './today.html', './topics.html', './learn.html', './calendar.html', './archive.html', './tools.html', './help.html', './settings.html', './about.html', './privacy.html', './subscribe.html', './contact.html',
  './assets/grace.css', './assets/app.js', './assets/shell.js', './crisis_lines.json', './manifest.json', './icons/icon.svg', './icons/icon-192.png', './hero-beach.jpg'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (url.hostname.endsWith('supabase.co')) { e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request))); return; }
  if (url.origin === location.origin) { e.respondWith(fetch(e.request).then(r => { if (r.ok) caches.open(VERSION).then(c => c.put(e.request, r.clone())); return r; }).catch(() => caches.match(e.request))); }
});
self.addEventListener('notificationclick', e => { e.notification.close(); e.waitUntil(clients.matchAll({ type: 'window' }).then(ws => { const w = ws.find(x => 'focus' in x); return w ? (w.navigate('./today.html'), w.focus()) : clients.openWindow('./today.html'); })); });
