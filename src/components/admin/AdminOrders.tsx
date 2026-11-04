import { useCallback, useEffect, useMemo, useState } from "react"
import { useLang } from "../../context/LanguageContext"
import { NEW_ORDER_EVENT } from "./useOrderAlerts"
import { adminFetch, btnDanger, btnPrimary, btnSecondary, dg, inputClass, taka, timeAgo } from "./adminApi"
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
    scheduledDay?: string
    deliverySlot?: string
  }
  items: { id: number; itemNameSnapshot: string; quantity: number }[]
}

// [English, Bangla]
const STATUS_LABEL: Record<Status, [string, string]> = {
  PENDING: ["New", "নতুন"],
  CONFIRMED: ["Confirmed", "কনফার্মড"],
  PREPARING: ["Cooking", "রান্না হচ্ছে"],
  OUT_FOR_DELIVERY: ["On the way", "পথে আছে"],
  DELIVERED: ["Delivered", "ডেলিভারি হয়েছে"],
  CANCELLED: ["Cancelled", "বাতিল"],
}

const STATUS_STYLE: Record<Status, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-sky-100 text-sky-800",
  PREPARING: "bg-violet-100 text-violet-800",
  OUT_FOR_DELIVERY: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-cream text-slate",
}

// The one button that moves an order forward
const NEXT_STEP: Partial<Record<Status, { to: Status; label: [string, string] }>> = {
  PENDING: { to: "CONFIRMED", label: ["Confirm order", "অর্ডার কনফার্ম করুন"] },
  CONFIRMED: { to: "PREPARING", label: ["Start cooking", "রান্না শুরু করুন"] },
  PREPARING: { to: "OUT_FOR_DELIVERY", label: ["Send for delivery", "ডেলিভারিতে পাঠান"] },
  OUT_FOR_DELIVERY: { to: "DELIVERED", label: ["Mark delivered", "ডেলিভারি হয়েছে"] },
}

const ACTIVE: Status[] = ["PENDING", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY"]

type Filter = "active" | "DELIVERED" | "CANCELLED" | "all"
const FILTERS: { id: Filter; label: [string, string] }[] = [
  { id: "active", label: ["Active", "চলমান"] },
  { id: "DELIVERED", label: ["Delivered", "ডেলিভারি হয়েছে"] },
  { id: "CANCELLED", label: ["Cancelled", "বাতিল"] },
  { id: "all", label: ["All", "সব"] },
]

const SLOT_BN: Record<string, string> = { Breakfast: "সকাল", Lunch: "দুপুর", Dinner: "রাত" }
const DAY_BN: Record<string, string> = {
  SAT: "শনি",
  SUN: "রবি",
  MON: "সোম",
  TUE: "মঙ্গল",
  WED: "বুধ",
  THU: "বৃহ",
  FRI: "শুক্র",
}

interface Summary {
  today: { orders: number; revenueBdt: number }
  month: { orders: number; revenueBdt: number }
  allTime: { orders: number; revenueBdt: number }
  activeOrders: number
}

const plural = (n: number, bn: boolean) =>
  bn ? `${dg(n.toLocaleString("en-IN"))}টি অর্ডার` : `${n.toLocaleString("en-IN")} ${n === 1 ? "order" : "orders"}`

/** Today / this month / all time at a glance. Cancelled orders are not counted. */
function SummaryCards({ summary }: { summary: Summary | null }) {
  const { tr, lang } = useLang()
  const cards = [
    { label: tr("Today", "আজ"), data: summary?.today },
    { label: tr("This month", "এই মাস"), data: summary?.month },
    { label: tr("All time", "মোট"), data: summary?.allTime },
  ]
  return (
    <section aria-label={tr("Sales summary", "বিক্রির সারসংক্ষেপ")} className="mb-6 grid grid-cols-3 gap-2 sm:gap-3">
      {cards.map((c, i) => (
        <div
          key={c.label}
          className={`min-w-0 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 ${
            i === 0 ? "bg-brand text-white shadow-[0_10px_24px_-14px_rgba(214,19,30,0.9)]" : "border border-line bg-white"
          }`}
        >
          <p className={`truncate text-xs sm:text-sm ${i === 0 ? "text-white/80" : "text-slate"}`}>{c.label}</p>
          {c.data ? (
            <>
              <p
                className={`mt-0.5 truncate text-base font-bold tabular-nums sm:mt-1 sm:text-2xl ${i === 0 ? "text-white" : "text-charcoal"}`}
              >
                {taka(c.data.revenueBdt)}
              </p>
              <p className={`truncate text-xs tabular-nums sm:text-sm ${i === 0 ? "text-white/80" : "text-slate"}`}>
                {plural(c.data.orders, lang === "bn")}
              </p>
            </>
          ) : (
            <div className="mt-1 space-y-1.5" aria-hidden>
              <div className="h-6 w-full max-w-28 animate-pulse rounded bg-cream sm:h-7" />
              <div className="h-4 w-16 animate-pulse rounded bg-cream" />
            </div>
          )}
        </div>
      ))}
    </section>
  )
}

export function AdminOrders() {
  const { tr, lang } = useLang()
  const bn = lang === "bn"
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
    // The layout spotted a new order: show it straight away
    window.addEventListener(NEW_ORDER_EVENT, load)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener(NEW_ORDER_EVENT, load)
    }
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
    if (window.confirm(
        tr(
          `Cancel order ${row.order.orderNumber} for ${row.order.customerName}?`,
          `${row.order.customerName}-এর অর্ডার ${row.order.orderNumber} বাতিল করবেন?`,
        ),
      )) {
      setStatus(row, "CANCELLED")
    }
  }

  return (
    <div>
      <PageHeader
        title={tr("Orders", "অর্ডার")}
        action={
          <button type="button" onClick={load} className={btnSecondary}>
            {tr("Refresh", "রিফ্রেশ")}
          </button>
        }
      />

      <SummaryCards summary={summary} />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div role="tablist" aria-label={tr("Filter orders", "অর্ডার ফিল্টার")} className="flex gap-1 overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={`h-9 shrink-0 rounded-full px-3 text-sm font-medium transition sm:px-3.5 ${
                filter === f.id ? "bg-brand text-white" : "bg-white text-slate ring-1 ring-line hover:bg-cream"
              }`}
            >
              {tr(f.label[0], f.label[1])}
              {f.id === "active" && activeCount > 0 && <span className="ml-1.5 tabular-nums">{dg(activeCount)}</span>}
            </button>
          ))}
        </div>
        <label className="sm:ml-auto sm:w-64">
          <span className="sr-only">{tr("Search orders", "অর্ডার খুঁজুন")}</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tr("Search name, phone, order no.", "নাম, ফোন বা অর্ডার নম্বর খুঁজুন")}
            className={inputClass}
          />
        </label>
      </div>

      {error && <Notice kind="error">{error}</Notice>}

      {loading ? (
        <ListSkeleton />
      ) : visible.length === 0 ? (
        <Empty
          title={filter === "active" ? tr("No active orders", "কোনো চলমান অর্ডার নেই") : tr("No orders here", "এখানে কোনো অর্ডার নেই")}
          hint={filter === "active" ? tr("New orders appear here automatically.", "নতুন অর্ডার এখানে নিজে থেকেই আসবে।") : undefined}
        />
      ) : (
        <ul className="space-y-3">
          {visible.map((row) => {
            const { order, items } = row
            const next = NEXT_STEP[order.status]
            const busy = busyId === order.id
            const online = order.paymentMethod !== "COD"
            return (
              <li
                key={order.id}
                className={`rounded-xl border border-line bg-white p-4 ${order.status === "PENDING" ? "border-l-4 border-l-brand" : ""}`}
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-semibold text-charcoal">{order.customerName}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[order.status]}`}>
                    {tr(STATUS_LABEL[order.status][0], STATUS_LABEL[order.status][1])}
                  </span>
                  {order.deliverySlot && ["Breakfast", "Lunch", "Dinner"].includes(order.deliverySlot) && (
                    <span className="rounded-full bg-saffron/30 px-2 py-0.5 text-xs font-semibold text-charcoal">
                      {bn ? SLOT_BN[order.deliverySlot] : order.deliverySlot}
                      {order.scheduledDay
                        ? ` · ${bn ? (DAY_BN[order.scheduledDay.slice(0, 3)] ?? "") : `${order.scheduledDay.charAt(0)}${order.scheduledDay.slice(1, 3).toLowerCase()}`}`
                        : ""}
                    </span>
                  )}
                  <span className="w-full text-xs text-slate sm:ml-auto sm:w-auto sm:text-sm">
                    {bn ? dg(order.orderNumber) : order.orderNumber} · {timeAgo(order.createdAt)}
                  </span>
                </div>

                <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                  <div className="space-y-1 text-slate">
                    <a
                      href={`tel:${order.customerPhone}`}
                      aria-label={tr(`Call ${order.customerName} at ${order.customerPhone}`, `${order.customerName}-কে ফোন করুন: ${order.customerPhone}`)}
                      className="inline-flex h-11 items-center gap-2 rounded-lg bg-cream px-3.5 font-semibold text-charcoal hover:bg-brand-light hover:text-brand sm:h-9"
                    >
                      <svg viewBox="0 0 24 24" className="size-4 text-brand" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" strokeLinejoin="round" />
                      </svg>
                      {dg(order.customerPhone)}
                    </a>
                    <p>
                      {order.deliveryZoneId && zones[order.deliveryZoneId] && (
                        <span className="font-medium text-charcoal">{zones[order.deliveryZoneId]} · </span>
                      )}
                      {order.customerAddress}
                    </p>
                    {order.notes && <p className="text-slate">{tr("Note", "নোট")}: {order.notes}</p>}
                  </div>
                  <div className="space-y-1">
                    <p className="text-charcoal">
                      {items.map((i) => `${dg(i.quantity)}× ${i.itemNameSnapshot}`).join(", ")}
                    </p>
                    <p className="text-slate">
                      <span className="font-semibold text-charcoal">{taka(order.totalBdt)}</span>
                      {order.discountBdt > 0 && ` · ${order.offerCode} −${taka(order.discountBdt)}`}
                      {" · "}
                      {online ? (
                        <>
                          {order.paymentMethod === "BKASH" ? "bKash" : "Nagad"}
                          {order.paymentTrxId && <span className="font-mono text-xs"> {order.paymentTrxId}</span>}
                          {order.isPaymentVerified ? (
                            <span className="ml-1 font-medium text-emerald-700">{tr("✓ paid", "✓ পেইড")}</span>
                          ) : (
                            <span className="ml-1 font-medium text-amber-700">{tr("not checked", "যাচাই হয়নি")}</span>
                          )}
                        </>
                      ) : (
                        tr("Cash on delivery", "ক্যাশ অন ডেলিভারি")
                      )}
                    </p>
                  </div>
                </div>

                {(next || (online && !order.isPaymentVerified && order.status !== "CANCELLED")) && (
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3">
                    {next && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setStatus(row, next.to)}
                        className={`${btnPrimary} h-11 flex-1 sm:h-10 sm:flex-none`}
                      >
                        {busy ? tr("Saving…", "সেভ হচ্ছে…") : tr(next.label[0], next.label[1])}
                      </button>
                    )}
                    {online && !order.isPaymentVerified && order.status !== "CANCELLED" && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          patch(row, `/api/admin/orders/${order.id}/verify-payment`, { isVerified: true })
                        }
                        className={`${btnSecondary} h-11 flex-1 sm:h-10 sm:flex-none`}
                      >
                        {tr("Mark as paid", "পেমেন্ট পেয়েছি")}
                      </button>
                    )}
                    {next && (
                      <button type="button" disabled={busy} onClick={() => cancel(row)} className={`${btnDanger} w-full sm:ml-auto sm:w-auto`}>
                        {tr("Cancel order", "অর্ডার বাতিল")}
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
        <p className="mt-4 text-xs text-slate/70">
          {tr("Updated", "আপডেট")} {dg(updatedAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }))} ·{" "}
          {tr("refreshes every 30 seconds", "প্রতি ৩০ সেকেন্ডে নিজে থেকে রিফ্রেশ হয়")}
        </p>
      )}
    </div>
  )
}
