import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { render, screen, waitFor, within } from "@testing-library/react"
import { getTrackedOrders, saveTrackedOrder } from "../src/lib/trackedOrders"
import { MyOrdersDrawer } from "../src/components/MyOrdersDrawer"

// A guest (not signed in) with "My orders" open (vi.mock is hoisted above the imports)
vi.mock("../src/context/AuthContext", () => ({
  useAuth: () => ({ isMyOrdersOpen: true, closeMyOrders: vi.fn(), user: null, openAuthModal: vi.fn() }),
}))

const order = (orderNumber: string, status: string, createdAt: string) => ({
  order: {
    id: Number(orderNumber.slice(-3)),
    orderNumber,
    customerPhone: "01711000009",
    customerAddress: "Hall 2, DIU",
    paymentMethod: "COD",
    totalBdt: 450,
    status,
    createdAt,
  },
  items: [{ id: 1, itemNameSnapshot: "Kacchi Biriyani", quantity: 1, lineTotalBdt: 450 }],
})

beforeEach(() => localStorage.clear())
afterEach(() => vi.unstubAllGlobals())

describe("my orders for a guest", () => {
  test("shows the current order with its status and the previous orders", async () => {
    saveTrackedOrder({ orderNumber: "BB-1-001", phone: "01711000009" })
    saveTrackedOrder({ orderNumber: "BB-1-002", phone: "01711000009" })
    const fetchMock = vi.fn((url: string) => {
      const data = url.includes("BB-1-002")
        ? order("BB-1-002", "PREPARING", "2026-11-03T12:00:00Z")
        : order("BB-1-001", "DELIVERED", "2026-11-01T12:00:00Z")
      return Promise.resolve(new Response(JSON.stringify({ data }), { status: 200 }))
    })
    vi.stubGlobal("fetch", fetchMock)

    render(<MyOrdersDrawer />)

    expect(await screen.findByText("Cooking your food")).toBeInTheDocument()
    const previous = screen.getByRole("region", { name: "Previous orders" })
    expect(within(previous).getByText("Delivered")).toBeInTheDocument()
    // The phone number is sent so the server can check it's really this customer's order
    expect(fetchMock).toHaveBeenCalledWith("/api/orders/BB-1-002?phone=01711000009", expect.anything())
  })

  test("forgets an order the server no longer has", async () => {
    saveTrackedOrder({ orderNumber: "BB-1-404", phone: "01711000009" })
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(new Response("{}", { status: 404 }))))

    render(<MyOrdersDrawer />)

    expect(await screen.findByText("No orders yet")).toBeInTheDocument()
    await waitFor(() => expect(getTrackedOrders()).toEqual([]))
  })
})
