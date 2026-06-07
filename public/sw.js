// RepHuby Push Notification Service Worker
const CACHE_NAME = 'rephuby-v1'

self.addEventListener('install', e => self.skipWaiting())
self.addEventListener('activate', e => e.waitUntil(clients.claim()))

// Handle incoming push
self.addEventListener('push', e => {
  let data = { title: 'New Article', body: 'A new article has been published.', url: '/', icon: '/favicon.ico' }
  try { if (e.data) data = { ...data, ...e.data.json() } } catch {}
  
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/favicon.ico',
      badge: '/favicon.ico',
      data: { url: data.url },
      requireInteraction: false,
      tag: 'rephuby-article',
      renotify: true,
    })
  )
})

// Handle notification click — open the article
self.addEventListener('notificationclick', e => {
  e.notification.close()
  const url = e.notification.data?.url || '/'
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus()
      }
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})
