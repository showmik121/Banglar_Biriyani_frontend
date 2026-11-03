// Orders placed on this device, so customers who order without an account can
// still find them later in "My orders". Only the order number and the phone
// number are kept; the order itself is always loaded fresh from the server.

export interface TrackedOrder {
  orderNumber: string
  phone: string
}

const KEY = "bb_tracked_orders"
const MAX = 20

export function getTrackedOrders(): TrackedOrder[] {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || "[]")
    return Array.isArray(list)
      ? list.filter((o): o is TrackedOrder => typeof o?.orderNumber === "string" && typeof o?.phone === "string")
      : []
  } catch {
    return []
  }
}

export function saveTrackedOrder(order: TrackedOrder) {
  try {
    const rest = getTrackedOrders().filter((o) => o.orderNumber !== order.orderNumber)
    localStorage.setItem(KEY, JSON.stringify([order, ...rest].slice(0, MAX)))
  } catch {
    // Private mode or storage full: tracking still works while the page is open
  }
}

export function forgetTrackedOrder(orderNumber: string) {
  try {
    localStorage.setItem(KEY, JSON.stringify(getTrackedOrders().filter((o) => o.orderNumber !== orderNumber)))
  } catch {
    // ignore
  }
}
