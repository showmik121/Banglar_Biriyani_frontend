import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { PushAlertsCard } from "../src/components/admin/PushAlertsCard"

const ENDPOINT = "https://fcm.googleapis.com/fcm/send/abc"
const PUBLIC_KEY = btoa(String.fromCharCode(...new Uint8Array(65).fill(4)))
  .replace(/\+/g, "-")
  .replace(/\//g, "_")
  .replace(/=+$/, "")

let current: { endpoint: string; unsubscribe: ReturnType<typeof vi.fn> } | null
let reg: { pushManager: { getSubscription: ReturnType<typeof vi.fn>; subscribe: ReturnType<typeof vi.fn> } }
let permission: NotificationPermission
let serverKey: string | null
let calls: { url: string; body: unknown }[]

function install(opts: { subscribed?: boolean; permission?: NotificationPermission; key?: string | null } = {}) {
  permission = opts.permission ?? "default"
  serverKey = opts.key === undefined ? PUBLIC_KEY : opts.key
  current = opts.subscribed ? { endpoint: ENDPOINT, unsubscribe: vi.fn(async () => true) } : null
  reg = {
    pushManager: {
      getSubscription: vi.fn(async () => current),
      subscribe: vi.fn(async () => {
        current = { endpoint: ENDPOINT, unsubscribe: vi.fn(async () => true) }
        return current
      }),
    },
  }
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
  calls = []
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({ url, body: init?.body ? JSON.parse(String(init.body)) : null })
      if (url.endsWith("/push/config")) return new Response(JSON.stringify({ data: { publicKey: serverKey } }), { status: 200 })
      if (url.endsWith("/push/test")) return new Response(JSON.stringify({ data: { sent: 1, failed: 0 } }), { status: 200 })
      return new Response(JSON.stringify({ data: {} }), { status: 201 })
    }),
  )
}

beforeEach(() => localStorage.setItem("bb_admin_lang", "en"))
afterEach(() => {
  Reflect.deleteProperty(navigator, "serviceWorker")
  vi.unstubAllGlobals()
})

describe("phone notifications card", () => {
  test("turning on asks permission, subscribes this phone and tells the server", async () => {
    install({ permission: "granted" })
    render(<PushAlertsCard />)
    fireEvent.click(await screen.findByRole("button", { name: "Turn on phone notifications" }))

    expect(await screen.findByText(/Phone notifications are on/)).toBeInTheDocument()
    expect(reg.pushManager.subscribe).toHaveBeenCalledWith(expect.objectContaining({ userVisibleOnly: true }))
    expect(calls.find((c) => c.url === "/api/admin/push/subscribe")?.body).toEqual({ endpoint: ENDPOINT })
  })

  test("a phone that is already subscribed shows as on, can be tested and turned off", async () => {
    install({ subscribed: true, permission: "granted" })
    const first = current!
    render(<PushAlertsCard />)
    fireEvent.click(await screen.findByRole("button", { name: "Send a test" }))
    expect(await screen.findByRole("status")).toHaveTextContent("Test sent")

    fireEvent.click(screen.getByRole("button", { name: "Turn off" }))
    expect(await screen.findByRole("button", { name: "Turn on phone notifications" })).toBeInTheDocument()
    expect(first.unsubscribe).toHaveBeenCalled()
    expect(calls.some((c) => c.url === "/api/admin/push/unsubscribe" && (c.body as { endpoint: string }).endpoint === ENDPOINT)).toBe(true)
  })

  test("refused permission explains how to allow it", async () => {
    install({ permission: "denied" })
    render(<PushAlertsCard />)
    expect(await screen.findByText(/blocked for this site/)).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Turn on phone notifications" })).toBeNull()
  })

  test("says so when the server has no keys yet, and does not subscribe", async () => {
    install({ permission: "granted", key: null })
    render(<PushAlertsCard />)
    fireEvent.click(await screen.findByRole("button", { name: "Turn on phone notifications" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("not set up on the server")
    expect(reg.pushManager.subscribe).not.toHaveBeenCalled()
  })

  test("shows nothing in a browser without push support", async () => {
    const { container } = render(<PushAlertsCard />)
    await waitFor(() => expect(container).toBeEmptyDOMElement())
  })
})
