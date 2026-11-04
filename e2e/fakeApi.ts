import type { BrowserContext, Route } from "@playwright/test"

// A tiny in-memory stand-in for the real API, shared by every browser window in a test.
// It only knows what the signup -> menu -> order -> admin flow needs.

export const ADMIN = { id: 1, fullName: "Shop Admin", email: "admin@example.com", phone: "01700000000", role: "ADMIN" as const, password: "Admin-test-pass-1" }

const DISH = {
  id: 101,
  categoryId: 1,
  categoryName: "Biriyani",
  categorySlug: "biriyani",
  name: "Kacchi Biriyani",
  description: "Dum-cooked mutton kacchi",
  basePriceBdt: 450,
  specialPriceBdt: null,
  priceBdt: 450,
  imageUrl: "/logo-mark.png",
  portionSize: "1 plate",
  spiceLevel: "MEDIUM",
  rating: "4.8",
  isEveryday: true,
  isAvailable: true,
  isFeatured: true,
  remainingPortions: 50,
  dailyQuota: 50,
  soldCount: 0,
  mealTime: "LUNCH",
}

const ZONE = { id: 1, name: "Daffodil Smart City", area: "Campus & hostels", etaMinutes: "15-20" }

type User = { id: number; fullName: string; email: string | null; phone: string; role: "CUSTOMER" | "ADMIN"; defaultAddress: string | null; isActive: boolean }
type StoredUser = User & { password: string }
type StoredOrder = {
  order: Record<string, unknown> & { id: number; orderNumber: string; status: string }
  items: { id: number; itemNameSnapshot: string; quantity: number; unitPriceBdt: number }[]
}

export function createBackend() {
  const state = {
    users: [{ ...ADMIN, defaultAddress: null, isActive: true }] as StoredUser[],
    orders: [] as StoredOrder[],
    /** every POST /api/orders body, so tests can check what the site really sent */
    orderRequests: [] as Record<string, any>[],
  }
  const publicUser = ({ password: _p, ...u }: StoredUser): User => u

  const json = (route: Route, data: unknown, status = 200) =>
    route.fulfill({ status, contentType: "application/json", body: JSON.stringify({ success: status < 400, data }) })
  const fail = (route: Route, status: number, code: string, message: string, details: unknown = null) =>
    route.fulfill({ status, contentType: "application/json", body: JSON.stringify({ success: false, error: { code, message, details } }) })

  /** Call once per browser context (each context has its own sign-in, like a real browser). */
  async function attach(context: BrowserContext) {
    let session: StoredUser | null = null

    await context.route("**/api/**", async (route) => {
      const req = route.request()
      const url = new URL(req.url())
      const path = url.pathname.replace(/^\/api/, "")
      const method = req.method()
      const body = () => (req.postDataJSON() ?? {}) as Record<string, any>

      if (path === "/auth/me") return session ? json(route, { user: publicUser(session) }) : fail(route, 401, "UNAUTHORIZED", "Not signed in")

      if (path === "/auth/signup" && method === "POST") {
        const b = body()
        if (state.users.some((u) => u.phone === b.phone)) return fail(route, 409, "CONFLICT", "An account with this mobile number already exists.")
        const user: StoredUser = { id: state.users.length + 1, fullName: b.fullName, email: b.email ?? null, phone: b.phone, role: "CUSTOMER", defaultAddress: null, isActive: true, password: b.password }
        state.users.push(user)
        session = user
        return json(route, { user: publicUser(user) }, 201)
      }

      if (path === "/auth/login" && method === "POST") {
        const b = body()
        const user = state.users.find((u) => (u.phone === b.identifier || u.email === b.identifier) && u.password === b.password)
        if (!user) return fail(route, 401, "INVALID_CREDENTIALS", "Wrong email, phone or password.")
        session = user
        return json(route, { user: publicUser(user) })
      }

      if (path === "/auth/logout") {
        session = null
        return json(route, {})
      }

      if (path === "/menu") return json(route, { day: "WEDNESDAY", days: { WEDNESDAY: [DISH] }, items: [DISH] })
      if (path === "/delivery-zones") return json(route, [ZONE])
      if (path === "/offers") return json(route, [])

      if (path === "/orders" && method === "POST") {
        const b = body()
        state.orderRequests.push(b)
        const id = state.orders.length + 1
        const items = (b.items as { menuItemId: number; quantity: number }[]).map((i, n) => ({
          id: n + 1,
          itemNameSnapshot: DISH.name,
          quantity: i.quantity,
          unitPriceBdt: DISH.priceBdt,
        }))
        const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPriceBdt, 0)
        const order = {
          id,
          orderNumber: `BB-20261104-${100 + id}`,
          customerName: b.customerName,
          customerPhone: b.customerPhone,
          customerAddress: b.customerAddress,
          paymentMethod: b.paymentMethod,
          paymentTrxId: null,
          isPaymentVerified: false,
          status: "PENDING",
          subtotalBdt: subtotal,
          deliveryFeeBdt: 0,
          discountBdt: 0,
          totalBdt: subtotal,
          offerCode: null,
          deliveryZoneId: b.deliveryZoneId ?? null,
          scheduledDay: b.scheduledDay,
          deliverySlot: b.deliverySlot,
          notes: b.notes ?? null,
          createdAt: new Date().toISOString(),
        }
        state.orders.push({ order, items })
        return json(route, { order, items }, 201)
      }

      // ---- admin (only for a signed-in ADMIN) ----
      if (path.startsWith("/admin")) {
        if (!session) return fail(route, 401, "UNAUTHORIZED", "Please sign in")
        if (session.role !== "ADMIN") return fail(route, 403, "FORBIDDEN", "Only an admin can do this.")

        if (path === "/admin/orders" && method === "GET") return json(route, [...state.orders].reverse())
        if (path === "/admin/stats") {
          const revenue = state.orders.reduce((s, o) => s + Number(o.order.totalBdt), 0)
          const bucket = { orders: state.orders.length, revenueBdt: revenue }
          return json(route, { today: bucket, month: bucket, allTime: bucket, activeOrders: state.orders.length })
        }
        if (path === "/admin/delivery-zones") return json(route, [ZONE])
        const status = path.match(/^\/admin\/orders\/(\d+)\/status$/)
        if (status && method === "PATCH") {
          const found = state.orders.find((o) => o.order.id === Number(status[1]))
          if (!found) return fail(route, 404, "NOT_FOUND", "Order not found")
          found.order.status = body().status
          return json(route, found.order)
        }
        return json(route, [])
      }

      return fail(route, 404, "NOT_FOUND", `e2e fake API has no route for ${method} ${path}`)
    })
  }

  return { state, attach }
}
