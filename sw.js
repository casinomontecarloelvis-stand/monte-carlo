/* Monte-Carlo · notifications */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { texte: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.titre || 'Monte-Carlo', {
    body: d.texte || 'Nouveau message', icon: 'icone-512.png', badge: 'icone.png', tag: d.tag || undefined, data: { url: d.url || 'index.html#messages' }
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || 'index.html', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(l => {
    for (const c of l) if (c.url.split('#')[0] === url.split('#')[0]) { c.navigate(url).catch(() => {}); return c.focus(); }
    return self.clients.openWindow(url);
  }));
});

/* Images de l'appli : gardées sur le téléphone (leur nom change quand l'image change) */
const CACHE_IMG = 'mc-img-1';
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || !/\/img\/[0-9a-f]{12}\.(webp|jpg|png|gif)$/.test(u.pathname)) return;
  e.respondWith(caches.open(CACHE_IMG).then(c => c.match(e.request).then(r => r || fetch(e.request).then(rep => { if (rep.ok) c.put(e.request, rep.clone()); return rep; }))));
});
