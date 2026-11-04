import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react"
import { useAuth } from "../context/AuthContext"
import { useBodyScrollLock } from "../hooks/useBodyScrollLock"
import { useFocusTrap } from "../hooks/useFocusTrap"
import { forgetTrackedOrder, getTrackedOrders, saveTrackedOrder } from "../lib/trackedOrders"
import { useLang, type Lang } from "../context/LanguageContext"
import { dishName } from "../i18n/dishes"

type Status = "PENDING" | "CONFIRMED" | "PREPARING" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED"

interface OrderGroup {
  order: {
    id: number
    orderNumber: string
    customerPhone: string
    customerAddress: string
    paymentMethod: string
    paymentTrxId?: string | null
    isPaymentVerified?: boolean
    totalBdt: number
    discountBdt?: number
    status: Status
    createdAt: string
  }
  items: { id: number; itemNameSnapshot: string; quantity: number; lineTotalBdt: number }[]
}

type Pair = [en: string, bn: string]

const STEPS: { status: Status; label: Pair }[] = [
  { status: "PENDING", label: ["Placed", "অর্ডার হয়েছে"] },
  { status: "CONFIRMED", label: ["Confirmed", "কনফার্ম"] },
  { status: "PREPARING", label: ["Cooking", "রান্না হচ্ছে"] },
  { status: "OUT_FOR_DELIVERY", label: ["On the way", "পথে আছে"] },
  { status: "DELIVERED", label: ["Delivered", "পৌঁছে গেছে"] },
]

const MESSAGE: Record<Status, { title: Pair; detail: Pair }> = {
  PENDING: {
    title: ["Order received", "অর্ডার পেয়েছি"],
    detail: [
      "Waiting for the restaurant to confirm it. This usually takes a few minutes.",
      "রেস্টুরেন্ট কনফার্ম করার অপেক্ষায়। সাধারণত কয়েক মিনিট লাগে।",
    ],
  },
  CONFIRMED: {
    title: ["Order confirmed", "অর্ডার কনফার্ম হয়েছে"],
    detail: ["We'll start cooking your food shortly.", "একটু পরেই রান্না শুরু করব।"],
  },
  PREPARING: {
    title: ["Cooking your food", "রান্না হচ্ছে"],
    detail: ["Your biriyani is in the handi.", "আপনার বিরিয়ানি এখন হাঁড়িতে।"],
  },
  OUT_FOR_DELIVERY: {
    title: ["On the way", "পথে আছে"],
    detail: [
      "The rider is bringing your order. Keep your phone close.",
      "রাইডার আপনার অর্ডার নিয়ে আসছে। ফোন কাছে রাখুন।",
    ],
  },
  DELIVERED: { title: ["Delivered", "পৌঁছে গেছে"], detail: ["Enjoy your meal!", "মজা করে খান!"] },
  CANCELLED: { title: ["Cancelled", "বাতিল"], detail: ["This order was cancelled.", "এই অর্ডারটি বাতিল হয়েছে।"] },
}

const isActive = (s: Status) => s !== "DELIVERED" && s !== "CANCELLED"
const when = (iso: string, lang: Lang) =>
  new Date(iso).toLocaleString(lang === "bn" ? "bn-BD" : "en-GB", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  })
const paymentLabel = (o: OrderGroup["order"], tr: (en: string, bn: string) => string) =>
  o.paymentMethod === "COD"
    ? tr("Cash on delivery", "ক্যাশ অন ডেলিভারি")
    : `${o.paymentMethod === "BKASH" ? tr("bKash", "বিকাশ") : tr("Nagad", "নগদ")}${
        o.isPaymentVerified ? tr(" · paid ✓", " · পেমেন্ট হয়েছে ✓") : tr(" · payment being checked", " · পেমেন্ট যাচাই হচ্ছে")
      }`

async function fetchTracked(orderNumber: string, phone: string): Promise<OrderGroup | "gone" | null> {
  try {
    const res = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}?phone=${encodeURIComponent(phone)}`, {
      credentials: "include",
    })
    if (res.status === 404) return "gone"
    if (!res.ok) return null
    return (await res.json()).data as OrderGroup
  } catch {
    return null
  }
}

export function MyOrdersDrawer() {
  const { isMyOrdersOpen, closeMyOrders, user, openAuthModal } = useAuth()
  const { lang, tr, taka } = useLang()
  const drawerRef = useRef<HTMLDivElement>(null)
  useBodyScrollLock(isMyOrdersOpen)
  useFocusTrap(drawerRef, isMyOrdersOpen)

  const [orders, setOrders] = useState<OrderGroup[]>([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const found = new Map<string, OrderGroup>()
      if (user) {
        const res = await fetch("/api/orders/my-orders", { credentials: "include" })
        if (!res.ok) throw new Error(tr("Could not load your orders. Please try again.", "অর্ডার লোড করা যায়নি। আবার চেষ্টা করুন।"))
        for (const g of ((await res.json()).data || []) as OrderGroup[]) found.set(g.order.orderNumber, g)
      }
      // Orders placed on this device (for example without signing in)
      const tracked = getTrackedOrders().filter((t) => !found.has(t.orderNumber))
      const results = await Promise.all(tracked.map((t) => fetchTracked(t.orderNumber, t.phone)))
      results.forEach((r, i) => {
        if (r === "gone") forgetTrackedOrder(tracked[i].orderNumber)
        else if (r) found.set(r.order.orderNumber, r)
      })
      setOrders([...found.values()].sort((a, b) => b.order.createdAt.localeCompare(a.order.createdAt)))
      setError(null)
    } catch (e) {
      setError((e as Error).message || tr("Could not load your orders. Please try again.", "অর্ডার লোড করা যায়নি। আবার চেষ্টা করুন।"))
    } finally {
      setLoading(false)
      setLoaded(true)
    }
  }, [user, tr])

  // Load when opened, then keep the status fresh every 20 seconds
  useEffect(() => {
    if (!isMyOrdersOpen) return
    load()
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") load()
    }, 20000)
    return () => window.clearInterval(timer)
  }, [isMyOrdersOpen, load])

  // A new order placed in this tab shows up right away
  useEffect(() => {
    const onPlaced = () => isMyOrdersOpen && load()
    window.addEventListener("banglar-biriyani:order-placed", onPlaced)
    return () => window.removeEventListener("banglar-biriyani:order-placed", onPlaced)
  }, [isMyOrdersOpen, load])

  useEffect(() => {
    if (!isMyOrdersOpen) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeMyOrders()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isMyOrdersOpen, closeMyOrders])

  const active = useMemo(() => orders.filter((g) => isActive(g.order.status)), [orders])
  const previous = useMemo(() => orders.filter((g) => !isActive(g.order.status)), [orders])

  if (!isMyOrdersOpen) return null

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="my-orders-title">
      <div className="fixed inset-0 bg-charcoal/50" onClick={closeMyOrders} aria-hidden="true" />
      <div
        ref={drawerRef}
        className="fixed inset-y-0 right-0 flex w-full max-w-md flex-col bg-alabaster pb-[env(safe-area-inset-bottom)] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-line bg-white px-5 py-4">
          <div>
            <h2 id="my-orders-title" className="text-lg font-bold text-charcoal">
              {tr("My orders", "আমার অর্ডার")}
            </h2>
            <p className="text-xs text-slate" aria-live="polite">
              {loading ? tr("Updating…", "আপডেট হচ্ছে…") : tr("Status updates automatically", "অবস্থা নিজে থেকেই আপডেট হয়")}
            </p>
          </div>
          <button
            type="button"
            onClick={closeMyOrders}
            aria-label={tr("Close my orders", "আমার অর্ডার বন্ধ করুন")}
            className="grid size-10 place-items-center rounded-full text-slate hover:bg-cream hover:text-charcoal"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          {error && (
            <div role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}{" "}
              <button type="button" onClick={load} className="font-semibold underline">
                {tr("Try again", "আবার চেষ্টা করুন")}
              </button>
            </div>
          )}

          {!loaded ? (
            <div className="space-y-3" aria-hidden>
              <div className="h-40 animate-pulse rounded-2xl bg-white" />
              <div className="h-16 animate-pulse rounded-2xl bg-white" />
            </div>
          ) : orders.length === 0 && !error ? (
            <div className="rounded-2xl bg-white px-5 py-10 text-center">
              <p className="font-bold text-charcoal">{tr("No orders yet", "এখনো কোনো অর্ডার নেই")}</p>
              <p className="mt-1 text-sm text-slate">
                {tr("Orders you place on this phone will show up here.", "এই ফোন থেকে দেওয়া অর্ডার এখানে দেখা যাবে।")}
              </p>
              <button
                type="button"
                onClick={() => {
                  closeMyOrders()
                  document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })
                }}
                className="mt-4 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-hover"
              >
                {tr("Browse the menu", "মেনু দেখুন")}
              </button>
            </div>
          ) : null}

          {active.length > 0 && (
            <section aria-labelledby="active-orders" className="space-y-3">
              <h3 id="active-orders" className="text-sm font-bold text-charcoal">
                {tr(`Current order${active.length > 1 ? "s" : ""}`, "চলমান অর্ডার")}
              </h3>
              {active.map((g) => (
                <ActiveOrderCard key={g.order.orderNumber} group={g} />
              ))}
            </section>
          )}

          {previous.length > 0 && (
            <section aria-labelledby="previous-orders" className="space-y-2">
              <h3 id="previous-orders" className="text-sm font-bold text-charcoal">
                {tr("Previous orders", "আগের অর্ডার")}
              </h3>
              <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-white">
                {previous.map(({ order, items }) => (
                  <li key={order.orderNumber} className="px-4 py-3">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm font-semibold text-charcoal">{when(order.createdAt, lang)}</span>
                      <span className="text-sm font-bold text-charcoal">{taka(order.totalBdt)}</span>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-slate">
                      {items.map((i) => `${i.quantity}× ${dishName(i.itemNameSnapshot, lang)}`).join(", ")}
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-xs text-slate">
                      <span
                        className={`rounded-full px-2 py-0.5 font-semibold ${
                          order.status === "DELIVERED" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {tr(...MESSAGE[order.status].title)}
                      </span>
                      <span className="font-mono">{order.orderNumber}</span>
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <TrackForm
            onFound={(g, phone) => {
              saveTrackedOrder({ orderNumber: g.order.orderNumber, phone })
              setOrders((list) =>
                [g, ...list.filter((x) => x.order.orderNumber !== g.order.orderNumber)].sort((a, b) =>
                  b.order.createdAt.localeCompare(a.order.createdAt),
                ),
              )
            }}
          />

          {!user && (
            <p className="text-center text-xs text-slate">
              <button type="button" onClick={() => openAuthModal("login")} className="font-semibold text-brand underline">
                {tr("Sign in", "সাইন ইন করুন")}
              </button>
              {tr(" to see your orders on any device.", ", যেকোনো ডিভাইস থেকে অর্ডার দেখতে।")}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function ActiveOrderCard({ group: { order, items } }: { group: OrderGroup }) {
  const { lang, tr, taka, num } = useLang()
  const step = STEPS.findIndex((s) => s.status === order.status)
  const msg = MESSAGE[order.status]
  return (
    <article className="rounded-2xl bg-white p-4 shadow-xs ring-1 ring-line">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-base font-bold text-brand">{tr(...msg.title)}</p>
        <span className="font-mono text-xs text-slate">{order.orderNumber}</span>
      </div>
      <p className="mt-0.5 text-sm text-slate">{tr(...msg.detail)}</p>

      <ol className="mt-4 grid grid-cols-5 gap-1" aria-label={tr("Order progress", "অর্ডারের অগ্রগতি")}>
        {STEPS.map((s, i) => {
          const done = i <= step
          return (
            <li key={s.status} aria-current={i === step ? "step" : undefined}>
              <span className={`block h-1.5 rounded-full ${done ? "bg-brand" : "bg-line"}`} />
              <span className={`mt-1.5 block text-[11px] leading-tight ${done ? "font-semibold text-charcoal" : "text-slate"}`}>
                {tr(...s.label)}
              </span>
            </li>
          )
        })}
      </ol>

      <div className="mt-4 space-y-1 border-t border-line pt-3 text-sm">
        {items.map((i) => (
          <div key={i.id} className="flex justify-between gap-3 text-charcoal">
            <span>
              {num(i.quantity)}× {dishName(i.itemNameSnapshot, lang)}
            </span>
            <span>{taka(i.lineTotalBdt)}</span>
          </div>
        ))}
        <div className="flex justify-between gap-3 pt-1 font-bold text-charcoal">
          <span>{tr("Total · free delivery", "মোট · ফ্রি ডেলিভারি")}</span>
          <span>{taka(order.totalBdt)}</span>
        </div>
        <p className="pt-1 text-xs text-slate">
          {paymentLabel(order, tr)} · {tr("Ordered", "অর্ডার")} {when(order.createdAt, lang)}
        </p>
        <p className="text-xs text-slate">
          {tr("Deliver to:", "ডেলিভারি:")} {order.customerAddress}
        </p>
      </div>
    </article>
  )
}

/** Find an order placed on another phone with its order number and phone number. */
function TrackForm({ onFound }: { onFound: (g: OrderGroup, phone: string) => void }) {
  const [open, setOpen] = useState(false)
  const [orderNumber, setOrderNumber] = useState("")
  const [phone, setPhone] = useState("")
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const { tr } = useLang()

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setMessage(null)
    const result = await fetchTracked(orderNumber.trim().toUpperCase(), phone.trim())
    setBusy(false)
    if (result && result !== "gone") {
      onFound(result, phone.trim())
      setOrderNumber("")
      setOpen(false)
    } else {
      setMessage(
        result === "gone"
          ? tr(
              "We couldn't find that order. Check the order number and the phone number you used.",
              "অর্ডারটি পাওয়া যায়নি। অর্ডার নম্বর আর যে ফোন নম্বর দিয়েছিলেন তা দেখে নিন।",
            )
          : tr("Couldn't check right now. Please try again.", "এখন যাচাই করা যাচ্ছে না। আবার চেষ্টা করুন।"),
      )
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl border border-dashed border-line bg-white px-4 py-3 text-sm font-semibold text-charcoal hover:border-brand hover:text-brand"
      >
        {tr("Track an order with its order number", "অর্ডার নম্বর দিয়ে অর্ডার ট্র্যাক করুন")}
      </button>
    )
  }

  const field =
    "mt-1 h-11 w-full rounded-xl border border-line bg-white px-3 text-base text-charcoal outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 sm:text-sm"
  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl bg-white p-4 ring-1 ring-line">
      <p className="text-sm font-bold text-charcoal">{tr("Track an order", "অর্ডার ট্র্যাক করুন")}</p>
      <label className="block text-sm text-charcoal">
        {tr("Order number", "অর্ডার নম্বর")}
        <input
          className={`${field} font-mono uppercase`}
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="BB-20261103-1234567"
          required
        />
      </label>
      <label className="block text-sm text-charcoal">
        {tr("Phone number used for the order", "অর্ডারে দেওয়া ফোন নম্বর")}
        <input
          className={field}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="01XXXXXXXXX"
          required
        />
      </label>
      {message && (
        <p role="alert" className="text-sm text-rose-700">
          {message}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="h-11 flex-1 rounded-full bg-brand text-sm font-bold text-white hover:bg-brand-hover disabled:opacity-60"
        >
          {busy ? tr("Checking…", "খোঁজা হচ্ছে…") : tr("Find order", "অর্ডার খুঁজুন")}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="h-11 rounded-full px-4 text-sm font-semibold text-slate hover:bg-cream"
        >
          {tr("Cancel", "বাতিল")}
        </button>
      </div>
    </form>
  )
}
