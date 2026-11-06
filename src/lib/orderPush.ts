/**
 * Phone notifications for the customer's own orders (Web Push). When the restaurant changes
 * an order's status, the server sends an encrypted message to this phone and /push-sw.js shows it.
 */
export type OrderAlertState = "unsupported" | "off" | "on" | "blocked"

export interface AlertOrder {
  orderNumber: string
  phone: string
}

const SW_URL = "/push-sw.js"
const FLAG = "bb_order_alerts"

export function orderAlertsSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  )
}

const readFlag = (): boolean => {
  try {
    return localStorage.getItem(FLAG) === "1"
  } catch {
    return false
  }
}
const writeFlag = (on: boolean) => {
  try {
    if (on) localStorage.setItem(FLAG, "1")
    else localStorage.removeItem(FLAG)
  } catch {
    // private mode: the setting just is not remembered
  }
}

function keyBytes(base64Url: string): Uint8Array {
  const padded = base64Url.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (base64Url.length % 4)) % 4)
  return Uint8Array.from(atob(padded), (ch) => ch.charCodeAt(0))
}

export function getOrderAlertState(): OrderAlertState {
  if (!orderAlertsSupported()) return "unsupported"
  if (Notification.permission === "denied") return "blocked"
  return readFlag() && Notification.permission === "granted" ? "on" : "off"
}

async function sendSubscription(sub: PushSubscription, orders: AlertOrder[], lang: string): Promise<boolean> {
  const json = sub.toJSON()
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth || orders.length === 0) return false
  const res = await fetch("/api/order-push/subscribe", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      endpoint: json.endpoint,
      keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
      lang: lang === "en" ? "en" : "bn",
      orders: orders.slice(0, 20),
    }),
  })
  return res.ok
}

/** Asks permission and starts notifications for these orders. Throws a short message on failure. */
export async function enableOrderAlerts(orders: AlertOrder[], lang: string): Promise<void> {
  if (!orderAlertsSupported()) throw new Error("unsupported")
  const permission = await Notification.requestPermission()
  if (permission !== "granted") throw new Error("blocked")
  const config = await fetch("/api/order-push/config").then((r) => r.json())
  const publicKey: string | null = config?.data?.publicKey ?? null
  if (!publicKey) throw new Error("not-set-up")
  const reg = await navigator.serviceWorker.register(SW_URL)
  await navigator.serviceWorker.ready
  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(publicKey) as BufferSource }))
  if (!(await sendSubscription(sub, orders, lang))) throw new Error("failed")
  writeFlag(true)
}

/** Keeps new orders covered while notifications are on. Quiet on any problem. */
export async function syncOrderAlerts(orders: AlertOrder[], lang: string): Promise<void> {
  if (getOrderAlertState() !== "on") return
  try {
    const reg = await navigator.serviceWorker.getRegistration()
    const sub = await reg?.pushManager.getSubscription()
    if (!sub) return writeFlag(false)
    await sendSubscription(sub, orders, lang)
  } catch {
    // will be tried again with the next refresh
  }
}

/** Stops order notifications on this phone. */
export async function disableOrderAlerts(): Promise<void> {
  writeFlag(false)
  try {
    const reg = await navigator.serviceWorker.getRegistration()
    const sub = await reg?.pushManager.getSubscription()
    if (sub) {
      await fetch("/api/order-push/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      })
    }
  } catch {
    // nothing else to do
  }
}
