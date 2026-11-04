import { useCallback, useEffect, useRef, useState } from "react"
import { adminFetch, adminIsBangla, dg, taka } from "./adminApi"

const KEY = "bb_admin_alerts"
const POLL_MS = 15000
export const NEW_ORDER_EVENT = "bb-admin:new-order"

interface Row {
  order: { id: number; orderNumber: string; customerName: string; totalBdt: number; status: string }
}
export interface NewOrderInfo {
  count: number
  name: string
  total: number
}

/** Three short rising beeps. Needs the person to have tapped the page once (browser rule). */
function beep() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    ;[880, 1175, 1480].forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.frequency.value = freq
      osc.connect(gain)
      gain.connect(ctx.destination)
      const t = ctx.currentTime + i * 0.28
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(0.4, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25)
      osc.start(t)
      osc.stop(t + 0.26)
    })
    window.setTimeout(() => ctx.close().catch(() => {}), 1500)
  } catch {
    // no audio available: the banner and vibration still work
  }
}

/**
 * Watches for new orders while the admin panel is open (any tab):
 * a banner, beep, vibration, page title and (if allowed) a system notification.
 * Orders already waiting when the page opens do not ring.
 */
export function useOrderAlerts() {
  const [enabled, setEnabled] = useState(() => {
    try {
      return localStorage.getItem(KEY) === "on"
    } catch {
      return false
    }
  })
  const [alert, setAlert] = useState<NewOrderInfo | null>(null)
  const seen = useRef<Set<number> | null>(null)
  const enabledRef = useRef(enabled)
  enabledRef.current = enabled

  const check = useCallback(async () => {
    try {
      const rows = await adminFetch<Row[]>("/api/admin/orders?limit=30")
      const pending = rows.filter((r) => r.order.status === "PENDING")
      if (seen.current === null) {
        seen.current = new Set(pending.map((r) => r.order.id)) // baseline: no ring for old orders
        return
      }
      const known = seen.current
      const fresh = pending.filter((r) => !known.has(r.order.id))
      if (fresh.length === 0) return
      fresh.forEach((r) => known.add(r.order.id))

      window.dispatchEvent(new Event(NEW_ORDER_EVENT))
      setAlert((prev) => ({
        count: (prev?.count ?? 0) + fresh.length,
        name: fresh[0].order.customerName,
        total: fresh[0].order.totalBdt,
      }))
      if (enabledRef.current) {
        beep()
        navigator.vibrate?.([300, 150, 300])
        try {
          if ("Notification" in window && Notification.permission === "granted") {
            const bn = adminIsBangla()
            new Notification(bn ? "🔔 নতুন অর্ডার এসেছে" : "🔔 New order", {
              body: `${fresh[0].order.customerName} · ${taka(fresh[0].order.totalBdt)}`,
              tag: "bb-new-order",
            })
          }
        } catch {
          // some phones only allow notifications from a service worker: ignore
        }
      }
    } catch {
      // offline or signed out: try again at the next tick
    }
  }, [])

  useEffect(() => {
    check()
    const timer = window.setInterval(check, POLL_MS)
    const onVisible = () => document.visibilityState === "visible" && check()
    document.addEventListener("visibilitychange", onVisible)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [check])

  // Page title shows how many new orders are waiting
  useEffect(() => {
    if (!alert) return
    const original = document.title
    document.title = `(${dg(alert.count)}) ${adminIsBangla() ? "নতুন অর্ডার" : "New order"} · ${original}`
    return () => {
      document.title = original
    }
  }, [alert])

  // Keep the screen awake while alerts are on (phone left at the counter)
  useEffect(() => {
    if (!enabled) return
    let lock: { release: () => Promise<void> } | null = null
    const request = async () => {
      try {
        const wl = (navigator as unknown as { wakeLock?: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> } }).wakeLock
        if (wl && document.visibilityState === "visible") lock = await wl.request("screen")
      } catch {
        // not supported or refused
      }
    }
    request()
    const onVisible = () => document.visibilityState === "visible" && request()
    document.addEventListener("visibilitychange", onVisible)
    return () => {
      document.removeEventListener("visibilitychange", onVisible)
      lock?.release().catch(() => {})
    }
  }, [enabled])

  /** Called from a tap, which also unlocks sound in the browser. */
  const enable = useCallback(async () => {
    try {
      if ("Notification" in window && Notification.permission === "default") await Notification.requestPermission()
    } catch {
      // ignore
    }
    beep()
    try {
      localStorage.setItem(KEY, "on")
    } catch {
      // not saved: works until the page closes
    }
    setEnabled(true)
  }, [])

  const dismiss = useCallback(() => setAlert(null), [])

  return { enabled, enable, alert, dismiss }
}
