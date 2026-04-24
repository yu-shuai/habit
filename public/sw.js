// Habit App Service Worker — handles push notifications and background sync
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

self.addEventListener('push', event => {
  const data = event.data?.json?.() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? '习惯提醒', {
      body: data.body ?? '记得今日打卡哦！',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: { url: data.url ?? '/' },
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      const existing = clients.find(c => c.url.includes(self.location.origin));
      if (existing) return existing.focus();
      return self.clients.openWindow(event.notification.data?.url ?? '/');
    })
  );
});
