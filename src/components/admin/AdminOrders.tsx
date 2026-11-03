import { useCallback, useEffect, useMemo, useState } from "react"
import { adminFetch, btnDanger, btnPrimary, btnSecondary, inputClass, taka, timeAgo } from "./adminApi"
import { Empty, ListSkeleton, Notice, PageHeader } from "./adminUi"

type Status = "PENDING" | "CONFIRMED" | "PREPARING" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED"

interface OrderRow {
  order: {
    id: number
    orderNumber: string
    customerName: string
    customerPhone: string
    customerAddress: string
    paymentMethod: "COD" | "BKASH" | "NAGAD"
    paymentTrxId: string | null
    isPaymentVerified: boolean
    status: Status
    totalBdt: number
    discountBdt: number
    offerCode: string | null
    deliveryZoneId: number | null
    notes: string | null
    createdAt: string
  }
  items: { id: number; itemNameSnapshot: string; quantity: number }[]
}

const STATUS_LABEL: Record<Status, string> = {
  PENDING: "New",
  CONFIRMED: "Confirmed",
  PREPARING: "Cooking",
  OUT_FOR_DELIVERY: "On the way",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
}

const STATUS_STYLE: Record<Status, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-sky-100 text-sky-800",
  PREPARING: "bg-violet-100 text-violet-800",
  OUT_FOR_DELIVERY: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-slate-200 text-slate-600",
}

// The one button that moves an order forward
const NEXT_STEP: Partial<Record<Status, { to: Status; label: string }>> = {
  PENDING: { to: "CONFIRMED", label: "Confirm order" },
  CONFIRMED: { to: "PREPARING", label: "Start cooking" },
  PREPARING: { to: "OUT_FOR_DELIVERY", label: "Send for delivery" },
  OUT_FOR_DELIVERY: { to: "DELIVERED", label: "Mark delivered" },
}

const ACTIVE: Status[] = ["PENDING", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY"]

type Filter = "active" | "DELIVERED" | "CANCELLED" | "all"
const FILTERS: { id: Filter; label: string }[] = [
  { id: "active", label: "Active" },
  { id: "DELIVERED", label: "Delivered" },
  { id: "CANCELLED", label: "Cancelled" },
  { id: "all", label: "All" },
]

interface Summary {
  today: { orders: number; revenueBdt: number }
  month: { orders: number; revenueBdt: number }
  allTime: { orders: number; revenueBdt: number }
  activeOrders: number
}

const plural = (n: number) => `${n.toLocaleString("en-IN")} ${n === 1 ? "order" : "orders"}`

/** Today / this month / all time at a glance. Cancelled orders are not counted. */
function SummaryCards({ summary }: { summary: Summary | null }) {
  const cards = [
    { label: "Today", data: summary?.today },
    { label: "This month", data: summary?.month },
    { label: "All time", data: summary?.allTime },
  ]
  return (
    <section aria-label="Sales summary" className="mb-6 grid grid-cols-3 gap-2 sm:gap-3">
      {cards.map((c) => (
        <div key={c.label} className="min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 sm:px-4 sm:py-3">
          <p className="truncate text-xs text-slate-500 sm:text-sm">{c.label}</p>
          {c.data ? (
            <>
              <p className="mt-0.5 truncate text-base font-semibold tabular-nums text-slate-900 sm:mt-1 sm:text-2xl">{taka(c.data.revenueBdt)}</p>
              <p className="truncate text-xs tabular-nums text-slate-600 sm:text-sm">{plural(c.data.orders)}</p>
            </>
          ) : (
            <div className="mt-1 space-y-1.5" aria-hidden>
              <div className="h-6 w-full max-w-28 animate-pulse rounded bg-slate-100 sm:h-7" />
              <div className="h-4 w-16 animate-pulse rounded bg-slate-100" />
            </div>
          )}
        </div>
      ))}
    </section>
  )
}

export function AdminOrders() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [rows, setRows] = useState<OrderRow[]>([])
  const [zones, setZones] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>("active")
  const [query, setQuery] = useState("")
  const [busyId, setBusyId] = useState<number | null>(null)
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)

  const load = useCallback(async () => {
    try {
      const [orderRows, stats] = await Promise.all([
        adminFetch<OrderRow[]>("/api/admin/orders?limit=100"),
        // The summary is a bonus: if it fails, the orders still show
        adminFetch<Summary>("/api/admin/stats").catch(() => null),
      ])
      setRows(orderRows)
      if (stats) setSummary(stats)
      setUpdatedAt(new Date())
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    adminFetch<{ id: number; name: string }[]>("/api/admin/delivery-zones")
      .then((list) => setZones(Object.fromEntries(list.map((z) => [z.id, z.name]))))
      .catch(() => {})
    // New orders show up on their own every 30 seconds
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") load()
    }, 30000)
    return () => window.clearInterval(timer)
  }, [load])

  const activeCount = rows.filter((r) => ACTIVE.includes(r.order.status)).length

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter(({ order }) => {
      if (filter === "active" && !ACTIVE.includes(order.status)) return false
      if (filter !== "active" && filter !== "all" && order.status !== filter) return false
      if (!q) return true
      return [order.orderNumber, order.customerName, order.customerPhone, order.paymentTrxId || ""].some((v) =>
        v.toLowerCase().includes(q),
      )
    })
  }, [rows, filter, query])

  const patch = async (row: OrderRow, url: string, body: object) => {
    setBusyId(row.order.id)
    try {
      await adminFetch(url, { method: "PATCH", body: JSON.stringify(body) })
      await load()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusyId(null)
    }
  }

  const setStatus = (row: OrderRow, status: Status) =>
    patch(row, `/api/admin/orders/${row.order.id}/status`, { status })

  const cancel = (row: OrderRow) => {
    if (window.confirm(`Cancel order ${row.order.orderNumber} for ${row.order.customerName}?`)) {
      setStatus(row, "CANCELLED")
    }
  }

  return (
    <div>
      <PageHeader
        title="Orders"
        action={
          <button type="button" onClick={load} className={btnSecondary}>
            Refresh
          </button>
        }
      />

      <SummaryCards summary={summary} />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div role="tablist" aria-label="Filter orders" className="flex gap-1 overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={`h-9 shrink-0 rounded-full px-3.5 text-sm font-medium transition ${
                filter === f.id ? "bg-slate-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
              }`}
            >
              {f.label}
              {f.id === "active" && activeCount > 0 && <span className="ml-1.5 tabular-nums">{activeCount}</span>}
            </button>
          ))}
        </div>
        <label className="sm:ml-auto sm:w-64">
          <span className="sr-only">Search orders</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, phone, order no."
            className={inputClass}
          />
        </label>
      </div>

      {error && <Notice kind="error">{error}</Notice>}

      {loading ? (
        <ListSkeleton />
      ) : visible.length === 0 ? (
        <Empty
          title={filter === "active" ? "No active orders" : "No orders here"}
          hint={filter === "active" ? "New orders appear here automatically." : undefined}
        />
      ) : (
        <ul className="space-y-3">
          {visible.map((row) => {
            const { order, items } = row
            const next = NEXT_STEP[order.status]
            const busy = busyId === order.id
            const online = order.paymentMethod !== "COD"
            return (
              <li key={order.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-semibold text-slate-900">{order.customerName}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[order.status]}`}>
                    {STATUS_LABEL[order.status]}
                  </span>
                  <span className="ml-auto text-sm text-slate-500">
                    {order.orderNumber} · {timeAgo(order.createdAt)}
                  </span>
                </div>

                <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                  <div className="space-y-1 text-slate-600">
                    <a href={`tel:${order.customerPhone}`} className="font-medium text-slate-900 underline-offset-2 hover:underline">
                      {order.customerPhone}
                    </a>
                    <p>
                      {order.deliveryZoneId && zones[order.deliveryZoneId] && (
                        <span className="font-medium text-slate-800">{zones[order.deliveryZoneId]} · </span>
                      )}
                      {order.customerAddress}
                    </p>
                    {order.notes && <p className="text-slate-500">Note: {order.notes}</p>}
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-800">
                      {items.map((i) => `${i.quantity}× ${i.itemNameSnapshot}`).join(", ")}
                    </p>
                    <p className="text-slate-600">
                      <span className="font-semibold text-slate-900">{taka(order.totalBdt)}</span>
                      {order.discountBdt > 0 && ` · ${order.offerCode} −${taka(order.discountBdt)}`}
                      {" · "}
                      {online ? (
                        <>
                          {order.paymentMethod === "BKASH" ? "bKash" : "Nagad"}
                          {order.paymentTrxId && <span className="font-mono text-xs"> {order.paymentTrxId}</span>}
                          {order.isPaymentVerified ? (
                            <span className="ml-1 font-medium text-emerald-700">✓ paid</span>
                          ) : (
                            <span className="ml-1 font-medium text-amber-700">not checked</span>
                          )}
                        </>
                      ) : (
                        "Cash on delivery"
                      )}
                    </p>
                  </div>
                </div>

                {(next || (online && !order.isPaymentVerified && order.status !== "CANCELLED")) && (
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                    {next && (
                      <button type="button" disabled={busy} onClick={() => setStatus(row, next.to)} className={btnPrimary}>
                        {busy ? "Saving…" : next.label}
                      </button>
                    )}
                    {online && !order.isPaymentVerified && order.status !== "CANCELLED" && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          patch(row, `/api/admin/orders/${order.id}/verify-payment`, { isVerified: true })
                        }
                        className={btnSecondary}
                      >
                        Payment received
                      </button>
                    )}
                    {next && (
                      <button type="button" disabled={busy} onClick={() => cancel(row)} className={`${btnDanger} ml-auto`}>
                        Cancel order
                      </button>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {updatedAt && (
        <p className="mt-4 text-xs text-slate-400">
          Updated {updatedAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} · refreshes every 30 seconds
        </p>
      )}
    </div>
  )
}
