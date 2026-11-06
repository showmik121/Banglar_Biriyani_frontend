// Shows a "new order" notification on the owner's phone, even when the admin page is closed.
// The server sends an empty ping; no order details travel through the push service.
self.addEventListener("install", () => self.skipWaiting())
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()))

self.addEventListener("push", (event) => {
  event.waitUntil(
    self.registration.showNotification("🔔 নতুন অর্ডার এসেছে · New order", {
      body: "অর্ডার দেখতে ট্যাপ করুন · Tap to see it",
      icon: "/logo-mark.png",
      badge: "/logo-mark.png",
      tag: "bb-new-order",
      renotify: true,
      requireInteraction: true,
      vibrate: [300, 150, 300, 150, 300],
      data: { url: "/admin/orders" },
    }),
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const target = (event.notification.data && event.notification.data.url) || "/admin/orders"
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (new URL(client.url).pathname.startsWith("/admin") && "focus" in client) {
          return client.focus().then((c) => (c && "navigate" in c ? c.navigate(target) : undefined))
        }
      }
      return self.clients.openWindow(target)
    }),
  )
})
