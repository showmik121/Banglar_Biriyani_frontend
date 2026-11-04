import { afterEach, describe, expect, test, vi } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { CheckoutModal } from "../src/components/CheckoutModal"

const clearCart = vi.fn()
vi.mock("../src/context/CartContext", () => ({
  useCart: () => ({
    items: [{ menuItemId: 1, name: "Kacchi Biriyani", priceBdt: 450, quantity: 2, scheduledDay: "everyday" }],
    activeDay: "saturday",
    subtotalBdt: 900,
    clearCart,
    isCheckoutOpen: true,
    setIsCheckoutOpen: vi.fn(),
  }),
}))
vi.mock("../src/context/AddressContext", () => ({
  useAddress: () => ({ selectedAddress: null, setFreeformAddress: vi.fn() }),
}))
vi.mock("../src/context/AuthContext", () => ({
  useAuth: () => ({ user: null, openAuthModal: vi.fn(), openMyOrders: vi.fn() }),
}))

const zones = [{ id: 1, name: "Daffodil Smart City", area: "Campus & hostels", etaMinutes: "15-20" }]

function mockApi() {
  const posted: unknown[] = []
  vi.stubGlobal(
    "fetch",
    vi.fn((url: string, init?: RequestInit) => {
      if (url === "/api/delivery-zones") return Promise.resolve(new Response(JSON.stringify({ data: zones })))
      if (url === "/api/orders") {
        posted.push(JSON.parse(String(init?.body)))
        const order = { orderNumber: "BB-1", customerPhone: "01711000009", subtotalBdt: 900, totalBdt: 900, deliveryFeeBdt: 0, paymentMethod: "COD" }
        return Promise.resolve(new Response(JSON.stringify({ data: { order, items: [] } }), { status: 201 }))
      }
      return Promise.resolve(new Response("{}", { status: 404 }))
    }),
  )
  return posted
}

afterEach(() => vi.unstubAllGlobals())

describe("checkout", () => {
  test("shows the order, free delivery and cash on delivery", async () => {
    mockApi()
    render(<CheckoutModal />)
    expect(screen.getByText("2× Kacchi Biriyani")).toBeInTheDocument()
    expect(screen.getByText("Free")).toBeInTheDocument()
    expect(screen.getByText("Cash on delivery")).toBeInTheDocument()
    // No real bKash/Nagad number is set, so those options stay hidden
    expect(screen.queryByText("bKash")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Place order · ৳900" })).toBeInTheDocument()
  })

  test("points out missing details instead of sending the order", async () => {
    const posted = mockApi()
    render(<CheckoutModal />)
    fireEvent.click(screen.getByRole("button", { name: /Place order/ }))
    expect(screen.getByText("Enter your name")).toBeInTheDocument()
    expect(screen.getByText("Enter an 11-digit mobile number starting with 01")).toBeInTheDocument()
    expect(screen.getByText("Add your room, house or landmark")).toBeInTheDocument()
    expect(posted).toHaveLength(0)
  })

  test("places the order with the delivery point picked automatically", async () => {
    const posted = mockApi()
    render(<CheckoutModal />)
    await screen.findByText("Daffodil Smart City")
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Rahim" } })
    fireEvent.change(screen.getByLabelText("Mobile number"), { target: { value: "+880 1711 000009" } })
    fireEvent.change(screen.getByLabelText("Room, house or landmark"), { target: { value: "Room 304, Hall 2" } })
    fireEvent.click(screen.getByRole("button", { name: /Place order/ }))
    await waitFor(() => expect(posted).toHaveLength(1))
    expect(posted[0]).toMatchObject({
      customerName: "Rahim",
      customerPhone: "01711000009",
      customerAddress: "Room 304, Hall 2",
      paymentMethod: "COD",
      deliveryZoneId: 1,
      items: [{ menuItemId: 1, quantity: 2 }],
    })
    expect(await screen.findByText("What happens next")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Order placed!" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Track my order" })).toBeInTheDocument()
    // Guests are invited to sign up for email updates
    expect(screen.getByRole("button", { name: "Create an account" })).toBeInTheDocument()
    expect(clearCart).toHaveBeenCalled()
  })
})
