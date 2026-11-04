import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { LanguageProvider } from "../src/context/LanguageContext"
import { AdminOrders } from "../src/components/admin/AdminOrders"

const order = {
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
    deliveryZoneId: null,
    notes: null,
    createdAt: new Date().toISOString(),
  },
  items: [{ id: 1, itemNameSnapshot: "Kacchi Biriyani", quantity: 2 }],
}

const json = (data: unknown) => Promise.resolve(new Response(JSON.stringify({ data }), { status: 200 }))

beforeEach(() => {
  localStorage.clear()
  vi.stubGlobal(
    "fetch",
    vi.fn((url: string) => {
      if (url.startsWith("/api/admin/orders")) return json([order])
      if (url.startsWith("/api/admin/stats"))
        return json({
          today: { orders: 3, revenueBdt: 1450 },
          month: { orders: 40, revenueBdt: 18200 },
          allTime: { orders: 120, revenueBdt: 52500 },
          activeOrders: 1,
        })
      return json([])
    }),
  )
})
afterEach(() => vi.unstubAllGlobals())

const renderBangla = () =>
  render(
    <LanguageProvider storageKey="bb_admin_lang" defaultLang="bn">
      <AdminOrders />
    </LanguageProvider>,
  )

describe("admin panel in Bangla", () => {
  test("opens in Bangla by default, with Bangla digits and buttons", async () => {
    renderBangla()
    expect(await screen.findByText("Rahim Uddin")).toBeInTheDocument()
    expect(screen.getByText("নতুন")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "অর্ডার কনফার্ম করুন" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "অর্ডার বাতিল" })).toBeInTheDocument()
    expect(await screen.findByText("৳১,৪৫০")).toBeInTheDocument()
    expect(screen.getByText("৩টি অর্ডার")).toBeInTheDocument()
    expect(screen.getByText("০১৭১১০০০০০৭")).toBeInTheDocument()
  })

  test("the order buttons still work in Bangla", async () => {
    renderBangla()
    fireEvent.click(await screen.findByRole("button", { name: "অর্ডার কনফার্ম করুন" }))
    await waitFor(() =>
      expect((fetch as unknown as ReturnType<typeof vi.fn>).mock.calls.some(([u]) => String(u).includes("/status"))).toBe(true),
    )
  })
})
