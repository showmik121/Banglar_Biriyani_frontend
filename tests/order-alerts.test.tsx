import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { saveTrackedOrder } from "../src/lib/trackedOrders"
import { MyOrdersDrawer } from "../src/components/MyOrdersDrawer"

vi.mock("../src/context/AuthContext", () => ({
  useAuth: () => ({ isMyOrdersOpen: true, closeMyOrders: vi.fn(), user: null, openAuthModal: vi.fn() }),
}))

const b64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
const PUBLIC_KEY = b64(new Uint8Array(65).fill(4))
const ENDPOINT = "https://fcm.googleapis.com/fcm/send/abc"

let permission: NotificationPermission
let current: unknown
let calls: { url: string; body: any }[]
let subscribe: ReturnType<typeof vi.fn>

function install(opts: { permission?: NotificationPermission; subscribed?: boolean; key?: string | null; supported?: boolean } = {}) {
  permission = opts.permission ?? "default"
  const subscription = {
    endpoint: ENDPOINT,
    toJSON: () => ({ endpoint: ENDPOINT, keys: { p256dh: PUBLIC_KEY, auth: b64(new Uint8Array(16)) } }),
  }
  current = opts.subscribed ? subscription : null
  subscribe = vi.fn(async () => {
    current = subscription
    return subscription
  })
  const reg = { pushManager: { getSubscription: vi.fn(async () => current), subscribe } }
  if (opts.supported !== false) {
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: { register: vi.fn(async () => reg), ready: Promise.resolve(reg), getRegistration: vi.fn(async () => reg) },
    })
    vi.stubGlobal("PushManager", class {})
    vi.stubGlobal(
      "Notification",
      Object.assign(vi.fn(), {
        get permission() {
          return permission
        },
        requestPermission: vi.fn(async () => permission),
      }),
    )
  }
  calls = []
  const key = opts.key === undefined ? PUBLIC_KEY : opts.key
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({ url, body: init?.body ? JSON.parse(String(init.body)) : null })
      if (url.endsWith("/order-push/config")) return new Response(JSON.stringify({ data: { publicKey: key } }), { status: 200 })
      if (url.startsWith("/api/orders/BB-1-002")) {
        const data = {
          order: { id: 2, orderNumber: "BB-1-002", customerPhone: "01711000009", customerAddress: "DIU", paymentMethod: "COD", totalBdt: 450, status: "PREPARING", createdAt: "2026-11-03T12:00:00Z" },
          items: [{ id: 1, itemNameSnapshot: "Kacchi Biriyani", quantity: 1, lineTotalBdt: 450 }],
        }
        return new Response(JSON.stringify({ data }), { status: 200 })
      }
      return new Response(JSON.stringify({ data: {} }), { status: 201 })
    }),
  )
}

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem("bb_lang", "en")
  saveTrackedOrder({ orderNumber: "BB-1-002", phone: "01711000009" })
})
afterEach(() => {
  Reflect.deleteProperty(navigator, "serviceWorker")
  vi.unstubAllGlobals()
})

describe("order notifications in My orders", () => {
  test("turning on subscribes this phone for the current orders", async () => {
    install({ permission: "granted" })
    render(<MyOrdersDrawer />)
    fireEvent.click(await screen.findByRole("button", { name: "Notify me" }))

    expect(await screen.findByText("Phone notifications are on")).toBeInTheDocument()
    expect(subscribe).toHaveBeenCalledWith(expect.objectContaining({ userVisibleOnly: true }))
    const sent = calls.find((c) => c.url === "/api/order-push/subscribe")!.body
    expect(sent.endpoint).toBe(ENDPOINT)
    expect(sent.orders).toEqual([{ orderNumber: "BB-1-002", phone: "01711000009" }])
    expect(sent.lang).toBe("en")
  })

  test("turning off tells the server to stop for this phone", async () => {
    install({ permission: "granted", subscribed: true })
    localStorage.setItem("bb_order_alerts", "1")
    render(<MyOrdersDrawer />)
    fireEvent.click(await screen.findByRole("button", { name: "Turn off" }))

    expect(await screen.findByRole("button", { name: "Notify me" })).toBeInTheDocument()
    expect(calls.find((c) => c.url === "/api/order-push/unsubscribe")?.body).toEqual({ endpoint: ENDPOINT })
    expect(localStorage.getItem("bb_order_alerts")).toBeNull()
  })

  test("while on, the current orders are re-sent so new orders are covered", async () => {
    install({ permission: "granted", subscribed: true })
    localStorage.setItem("bb_order_alerts", "1")
    render(<MyOrdersDrawer />)
    await waitFor(() => expect(calls.some((c) => c.url === "/api/order-push/subscribe")).toBe(true))
  })

  test("blocked notifications explain how to allow them", async () => {
    install({ permission: "denied" })
    render(<MyOrdersDrawer />)
    expect(await screen.findByText(/blocked in your browser settings/)).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Notify me" })).not.toBeInTheDocument()
  })

  test("a refused permission shows the blocked message", async () => {
    install({ permission: "default" })
    ;(Notification.requestPermission as ReturnType<typeof vi.fn>).mockResolvedValue("denied")
    render(<MyOrdersDrawer />)
    fireEvent.click(await screen.findByRole("button", { name: "Notify me" }))
    expect(await screen.findByText(/blocked in your browser settings/)).toBeInTheDocument()
  })

  test("shows a message when the server has no notification keys", async () => {
    install({ permission: "granted", key: null })
    render(<MyOrdersDrawer />)
    fireEvent.click(await screen.findByRole("button", { name: "Notify me" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("not available")
  })

  test("browsers without push show no card", async () => {
    install({ supported: false })
    render(<MyOrdersDrawer />)
    await screen.findByText("Cooking your food")
    expect(screen.queryByText(/Get updates on your phone/)).not.toBeInTheDocument()
  })
})
