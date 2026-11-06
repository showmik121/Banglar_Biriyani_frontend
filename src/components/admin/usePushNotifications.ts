import { useCallback, useEffect, useState } from "react"
import { adminFetch, adminIsBangla } from "./adminApi"

/**
 * Phone notifications for new orders, even when the admin page is closed.
 * Uses the browser's own push (Web Push). The server pings this phone and /push-sw.js shows the alert.
 */
export type PushState = "unsupported" | "checking" | "off" | "on" | "blocked"

const SW_URL = "/push-sw.js"

export function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  )
}

function keyBytes(base64Url: string): Uint8Array {
  const padded = base64Url.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (base64Url.length % 4)) % 4)
  return Uint8Array.from(atob(padded), (ch) => ch.charCodeAt(0))
}

const say = (en: string, bn: string) => (adminIsBangla() ? bn : en)
const post = (url: string, endpoint: string) => adminFetch(url, { method: "POST", body: JSON.stringify({ endpoint }) })

export function usePushNotifications() {
  const [state, setState] = useState<PushState>(() => (pushSupported() ? "checking" : "unsupported"))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<string | null>(null)

  useEffect(() => {
    if (!pushSupported()) return
    let live = true
    ;(async () => {
      try {
        if (Notification.permission === "denied") return live && setState("blocked")
        const reg = await navigator.serviceWorker.getRegistration()
        const sub = await reg?.pushManager.getSubscription()
        if (!live) return
        setState(sub ? "on" : "off")
        // Make sure the server still knows this phone (it forgets phones the push service dropped)
        if (sub) post("/api/admin/push/subscribe", sub.endpoint).catch(() => {})
      } catch {
        if (live) setState("off")
      }
    })()
    return () => {
      live = false
    }
  }, [])

  const enable = useCallback(async () => {
    setBusy(true)
    setError(null)
    setTestResult(null)
    try {
      const permission = await Notification.requestPermission()
      if (permission === "denied") return setState("blocked")
      if (permission !== "granted") return setState("off")

      const config = await adminFetch<{ publicKey: string | null }>("/api/admin/push/config")
      if (!config?.publicKey) {
        return setError(
          say(
            "Phone notifications are not set up on the server yet.",
            "সার্ভারে ফোন নোটিফিকেশন এখনো সেট করা হয়নি।",
          ),
        )
      }

      const reg = await navigator.serviceWorker.register(SW_URL)
      await navigator.serviceWorker.ready
      // A phone registered with other keys would never get a ping: start fresh
      const old = await reg.pushManager.getSubscription()
      if (old) {
        await post("/api/admin/push/unsubscribe", old.endpoint).catch(() => {})
        await old.unsubscribe().catch(() => {})
      }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: keyBytes(config.publicKey) as BufferSource,
      })
      try {
        await post("/api/admin/push/subscribe", sub.endpoint)
      } catch (e) {
        await sub.unsubscribe().catch(() => {})
        throw e
      }
      setState("on")
    } catch (e) {
      setError(
        (e as Error).message ||
          say("Could not turn on notifications. Please try again.", "নোটিফিকেশন চালু করা যায়নি। আবার চেষ্টা করুন।"),
      )
    } finally {
      setBusy(false)
    }
  }, [])

  const disable = useCallback(async () => {
    setBusy(true)
    setError(null)
    setTestResult(null)
    try {
      const reg = await navigator.serviceWorker.getRegistration()
      const sub = await reg?.pushManager.getSubscription()
      if (sub) {
        await post("/api/admin/push/unsubscribe", sub.endpoint).catch(() => {})
        await sub.unsubscribe()
      }
      setState("off")
    } catch (e) {
      setError((e as Error).message || say("Could not turn off notifications.", "নোটিফিকেশন বন্ধ করা যায়নি।"))
    } finally {
      setBusy(false)
    }
  }, [])

  const sendTest = useCallback(async () => {
    setBusy(true)
    setError(null)
    setTestResult(null)
    try {
      const r = await adminFetch<{ sent: number; failed: number }>("/api/admin/push/test", { method: "POST", body: "{}" })
      setTestResult(
        r.sent > 0
          ? say("Test sent. Your phone should ring in a few seconds.", "টেস্ট পাঠানো হয়েছে। কয়েক সেকেন্ডে ফোনে আসবে।")
          : say(
              "The test could not be delivered. Turn notifications off and on again.",
              "টেস্ট পৌঁছায়নি। নোটিফিকেশন বন্ধ করে আবার চালু করুন।",
            ),
      )
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }, [])

  return { state, busy, error, testResult, enable, disable, sendTest }
}
