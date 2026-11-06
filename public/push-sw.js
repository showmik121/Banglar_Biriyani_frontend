// Shows phone notifications even when the site is closed:
//  - owner/staff: an empty ping from the server means "new order" (no details travel through the push service)
//  - customers: an encrypted message {title, body, url, tag} about their own order's status
self.addEventListener("install", () => self.skipWaiting())
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()))

self.addEventListener("push", (event) => {
  let message = null
  try {
    message = event.data ? event.data.json() : null
  } catch (e) {
    message = null
  }
  if (message && typeof message.title === "string") {
    event.waitUntil(
      self.registration.showNotification(message.title, {
        body: typeof message.body === "string" ? message.body : "",
        icon: "/logo-mark.png",
        badge: "/logo-mark.png",
        tag: typeof message.tag === "string" ? message.tag : "bb-order",
        renotify: true,
        vibrate: [200, 100, 200],
        data: { url: typeof message.url === "string" && message.url.startsWith("/") ? message.url : "/" },
      }),
    )
    return
  }
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
        const sameArea = target.startsWith("/admin")
          ? new URL(client.url).pathname.startsWith("/admin")
          : !new URL(client.url).pathname.startsWith("/admin")
        if (sameArea && "focus" in client) {
          return client.focus().then((c) => (c && target.startsWith("/admin") && "navigate" in c ? c.navigate(target) : undefined))
        }
      }
      return self.clients.openWindow(target)
    }),
  )
})
