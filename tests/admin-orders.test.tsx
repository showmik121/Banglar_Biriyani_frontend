import { afterEach, describe, expect, test, vi } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { AdminOrders } from "../src/components/admin/AdminOrders"

const newOrder = {
  order: {
    id: 7,
    orderNumber: "BB-20261103-107",
    customerName: "Rahim Uddin",
    customerPhone: "01711000007",
    customerAddress: "Room 304, Hall 2",
    paymentMethod: "COD",
    paymentTrxId: null,
    isPaymentVerified: false,
    status: "PENDING",
    totalBdt: 760,
    discountBdt: 0,
    offerCode: null,
    deliveryZoneId: 1,
    notes: null,
    createdAt: new Date().toISOString(),
  },
  items: [{ id: 1, itemNameSnapshot: "Kacchi Biriyani", quantity: 2 }],
}

const json = (data: unknown) => Promise.resolve(new Response(JSON.stringify({ data }), { status: 200 }))

function mockApi() {
  const calls: { url: string; method: string; body?: string }[] = []
  vi.stubGlobal(
    "fetch",
    vi.fn((url: string, init?: RequestInit) => {
      calls.push({ url, method: init?.method || "GET", body: init?.body as string | undefined })
      if (url.startsWith("/api/admin/orders?")) return json([newOrder])
      if (url === "/api/admin/delivery-zones") return json([{ id: 1, name: "Daffodil Smart City" }])
      if (url === "/api/admin/stats")
        return json({
          today: { orders: 3, revenueBdt: 1450 },
          month: { orders: 41, revenueBdt: 18200 },
          allTime: { orders: 120, revenueBdt: 52500 },
          activeOrders: 1,
        })
      return json({})
    }),
  )
  return calls
}

afterEach(() => vi.unstubAllGlobals())

describe("admin orders", () => {
  test("shows a new order with its delivery point and items", async () => {
    mockApi()
    render(<AdminOrders />)
    expect(await screen.findByText("Rahim Uddin")).toBeInTheDocument()
    expect(screen.getByText("New")).toBeInTheDocument()
    expect(screen.getByText("2× Kacchi Biriyani")).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText(/Daffodil Smart City/)).toBeInTheDocument())
  })

  test("shows today, this month and all-time totals", async () => {
    mockApi()
    render(<AdminOrders />)
    expect(await screen.findByText("৳1,450")).toBeInTheDocument()
    expect(screen.getByText("3 orders")).toBeInTheDocument()
    expect(screen.getByText("৳18,200")).toBeInTheDocument()
    expect(screen.getByText("৳52,500")).toBeInTheDocument()
    expect(screen.getByText("120 orders")).toBeInTheDocument()
  })

  test("Confirm order moves a new order to CONFIRMED", async () => {
    const calls = mockApi()
    render(<AdminOrders />)
    fireEvent.click(await screen.findByRole("button", { name: "Confirm order" }))
    await waitFor(() =>
      expect(calls).toContainEqual({
        url: "/api/admin/orders/7/status",
        method: "PATCH",
        body: JSON.stringify({ status: "CONFIRMED" }),
      }),
    )
  })
})
