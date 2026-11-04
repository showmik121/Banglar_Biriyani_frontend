import { useEffect, useRef, useState, type FormEvent, type ReactNode, type RefObject } from "react"
import { saveTrackedOrder } from "../lib/trackedOrders"
import { useCart } from "../context/CartContext"
import { useAddress } from "../context/AddressContext"
import { useAuth } from "../context/AuthContext"
import { useBodyScrollLock } from "../hooks/useBodyScrollLock"
import { useFocusTrap } from "../hooks/useFocusTrap"
import { STORE } from "../config/store"
import type { DayOfWeek, OrderDTO, OrderItemDTO } from "../types/menu"

type Props = {
  isOpen?: boolean
  onClose?: () => void
}

type DeliveryZone = { id: number; name: string; area: string; etaMinutes: string }
type AppliedOffer = { code: string; title: string; discountBdt: number }
type PaymentMethod = "COD" | "BKASH" | "NAGAD"
type FieldKey = "customerName" | "customerPhone" | "customerAddress" | "deliveryZoneId" | "paymentTrxId"

interface PlacedOrderState {
  order: OrderDTO
  items: OrderItemDTO[]
}

// Online payment shows only when the restaurant's number is set in src/config/store.ts
type PaymentOption = { id: PaymentMethod; label: string; number: string }
const ALL_PAYMENT_OPTIONS: PaymentOption[] = [
  { id: "COD", label: "Cash on delivery", number: "" },
  { id: "BKASH", label: "bKash", number: STORE.bkashNumber },
  { id: "NAGAD", label: "Nagad", number: STORE.nagadNumber },
]
const PAYMENT_OPTIONS = ALL_PAYMENT_OPTIONS.filter((p) => p.id === "COD" || p.number !== "")

/** "+880 1711-000001" -> "01711000001" */
const normalizePhone = (v: string) => {
  const digits = v.replace(/\D/g, "")
  return digits.startsWith("880") ? digits.slice(2) : digits
}
const taka = (n: number) => `৳${n.toLocaleString("en-IN")}`

const inputClass = (invalid?: boolean) =>
  `mt-1.5 block w-full rounded-xl border bg-white px-3.5 text-base text-charcoal outline-none transition placeholder:text-slate/50 focus:ring-2 sm:text-sm ${
    invalid ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200" : "border-line focus:border-brand focus:ring-brand/15"
  }`

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-bold text-charcoal">{title}</h3>
      {children}
    </section>
  )
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="mt-1.5 text-xs font-medium text-rose-600">
      {message}
    </p>
  )
}

export function CheckoutModal({ isOpen: propIsOpen, onClose: propOnClose }: Props) {
  const { items, activeDay, subtotalBdt, clearCart, isCheckoutOpen, setIsCheckoutOpen } = useCart()
  const { selectedAddress, setFreeformAddress } = useAddress()
  const { user, openAuthModal, openMyOrders } = useAuth()

  const isOpen = propIsOpen ?? isCheckoutOpen
  const handleClose = propOnClose ?? (() => setIsCheckoutOpen(false))
  const modalRef = useRef<HTMLDivElement>(null)
  useBodyScrollLock(isOpen)
  useFocusTrap(modalRef, isOpen)

  const [customerName, setCustomerName] = useState(user?.fullName || "")
  const [customerPhone, setCustomerPhone] = useState(user?.phone || selectedAddress?.contactPhone || "")
  const [customerAddress, setCustomerAddress] = useState(selectedAddress?.details || user?.defaultAddress || "")

  // Fill in what we already know about the customer
  useEffect(() => {
    if (!isOpen) return
    if (user?.fullName) setCustomerName((v) => v || user.fullName)
    if (user?.phone) setCustomerPhone((v) => v || user.phone)
    else if (selectedAddress?.contactPhone) setCustomerPhone((v) => v || selectedAddress.contactPhone || "")
    const address = selectedAddress?.details || user?.defaultAddress
    if (address) setCustomerAddress((v) => v || address)
  }, [isOpen, user, selectedAddress])

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD")
  const [paymentTrxId, setPaymentTrxId] = useState("")
  const [notes, setNotes] = useState("")
  const [showNote, setShowNote] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string>>>({})
  const [placedOrder, setPlacedOrder] = useState<PlacedOrderState | null>(null)

  // Delivery points and promo code
  const [zones, setZones] = useState<DeliveryZone[]>([])
  const [zoneId, setZoneId] = useState<number | null>(null)
  const [showPromo, setShowPromo] = useState(false)
  const [promoInput, setPromoInput] = useState("")
  const [appliedOffer, setAppliedOffer] = useState<AppliedOffer | null>(null)
  const [promoError, setPromoError] = useState<string | null>(null)
  const [promoLoading, setPromoLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    let alive = true
    fetch("/api/delivery-zones")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!alive || !Array.isArray(json?.data)) return
        setZones(json.data)
        // Only one place to deliver to? Pick it.
        if (json.data.length === 1) setZoneId(json.data[0].id)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [isOpen])

  // A cart change can push the order under an offer's minimum, so ask again
  useEffect(() => {
    setAppliedOffer(null)
  }, [subtotalBdt])

  const selectedZone = zones.find((z) => z.id === zoneId) || null
  const [placedZone, setPlacedZone] = useState<DeliveryZone | null>(null)
  const itemCount = items.reduce((n, i) => n + i.quantity, 0)
  const discountBdt = appliedOffer?.discountBdt ?? 0
  const checkoutTotalBdt = Math.max(0, subtotalBdt - discountBdt) // delivery is free
  const payment = PAYMENT_OPTIONS.find((p) => p.id === paymentMethod) || PAYMENT_OPTIONS[0]
  const online = payment.id !== "COD"

  const applyPromo = async () => {
    const code = promoInput.trim()
    if (!code) return
    setPromoLoading(true)
    setPromoError(null)
    try {
      const res = await fetch("/api/offers/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotalBdt }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        setAppliedOffer(null)
        setPromoError(json?.error?.message || "This code can't be used right now")
        return
      }
      setAppliedOffer(json.data)
    } catch {
      setPromoError("Couldn't check the code. Please try again.")
    } finally {
      setPromoLoading(false)
    }
  }

  const nameInputRef = useRef<HTMLInputElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (placedOrder) handleResetAndClose()
        else handleClose()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    if (placedOrder) closeBtnRef.current?.focus({ preventScroll: true })
    else if (!customerName) nameInputRef.current?.focus()
    return () => window.removeEventListener("keydown", onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, placedOrder, handleClose])

  if (!isOpen) return null

  const handleResetAndClose = () => {
    setPlacedOrder(null)
    setGeneralError(null)
    setFieldErrors({})
    setPaymentTrxId("")
    setNotes("")
    handleClose()
  }

  const clearError = (k: FieldKey) => setFieldErrors((e) => ({ ...e, [k]: undefined }))

  const validate = () => {
    const errors: Partial<Record<FieldKey, string>> = {}
    if (customerName.trim().length < 2) errors.customerName = "Enter your name"
    if (!/^01[3-9]\d{8}$/.test(normalizePhone(customerPhone)))
      errors.customerPhone = "Enter an 11-digit mobile number starting with 01"
    if (zones.length > 0 && !selectedZone) errors.deliveryZoneId = "Choose where we should deliver"
    if (customerAddress.trim().length < 5) errors.customerAddress = "Add your room, house or landmark"
    if (online && paymentTrxId.trim().length < 4) errors.paymentTrxId = "Enter the Transaction ID from your payment"
    return errors
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setGeneralError(null)

    if (items.length === 0) {
      setGeneralError("Your cart is empty. Add something tasty first.")
      return
    }
    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      setGeneralError("Please check the highlighted fields.")
      // Take the customer to the first problem
      const first = Object.keys(errors)[0]
      document.querySelector<HTMLElement>(`[data-field="${first}"]`)?.scrollIntoView?.({ block: "center", behavior: "smooth" })
      return
    }

    setSubmitting(true)
    try {
      const cleanPhone = normalizePhone(customerPhone)
      const payload = {
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        customerAddress: customerAddress.trim(),
        scheduledDay: activeDay.toUpperCase() as DayOfWeek,
        paymentMethod,
        paymentTrxId: online ? paymentTrxId.trim().toUpperCase() : undefined,
        notes: notes.trim() || undefined,
        deliveryZoneId: selectedZone?.id ?? null,
        offerCode: appliedOffer?.code ?? null,
        items: items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      })
      const json = await res.json().catch(() => ({}))

      if (res.status === 422 && json.error?.details && typeof json.error.details === "object") {
        const details = json.error.details as Record<string, string[] | undefined>
        const mapped: Partial<Record<FieldKey, string>> = {}
        for (const k of ["customerName", "customerPhone", "customerAddress", "deliveryZoneId", "paymentTrxId"] as FieldKey[]) {
          if (details[k]?.[0]) mapped[k] = details[k]![0]
        }
        setFieldErrors(mapped)
        setGeneralError(json.error.message || "Please check the highlighted fields.")
        return
      }
      if (!res.ok) {
        throw new Error(json.error?.message || "Couldn't place your order. Please try again.")
      }

      const orderData: OrderDTO = json.data?.order || json.order
      const orderItemsList: OrderItemDTO[] = json.data?.items || json.items || []
      setPlacedZone(selectedZone)
      setPlacedOrder({ order: orderData, items: orderItemsList })
      // Remember it on this device so "My orders" can show it, even without an account
      saveTrackedOrder({ orderNumber: orderData.orderNumber, phone: orderData.customerPhone || cleanPhone })
      clearCart()
      window.dispatchEvent(
        new CustomEvent("banglar-biriyani:order-placed", { detail: { order: orderData, items: orderItemsList } }),
      )
      // Next time the address is already filled in
      try {
        setFreeformAddress(customerAddress.trim(), "Home")
      } catch {
        // not important
      }
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : "Couldn't place your order. Please check your connection.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={placedOrder ? "order-confirmation-title" : "checkout-modal-title"}
    >
      <div className="fixed inset-0" onClick={placedOrder ? handleResetAndClose : handleClose} aria-hidden="true" />
      <div
        ref={modalRef}
        className="relative flex max-h-[94dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[92vh] sm:rounded-2xl"
      >
        {placedOrder ? (
          <OrderPlaced
            placed={placedOrder}
            zone={placedZone}
            email={user?.email ?? null}
            closeRef={closeBtnRef}
            onClose={handleResetAndClose}
            onTrack={() => {
              handleResetAndClose()
              openMyOrders()
            }}
            onSignup={() => {
              handleResetAndClose()
              openAuthModal("signup")
            }}
          />
        ) : (
          <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
            <div className="flex shrink-0 items-center gap-2.5 bg-maroon px-5 py-3.5 text-white">
              <img src="/logo-mark.png" alt="" className="size-9 shrink-0 rounded-full bg-white ring-2 ring-saffron/70" />
              <div className="min-w-0 flex-1">
                <h2 id="checkout-modal-title" className="text-lg font-bold leading-tight">
                  Checkout
                </h2>
                <p className="text-xs text-white/75">
                  {itemCount} {itemCount === 1 ? "item" : "items"} · free delivery
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close checkout"
                className="-mr-2 grid size-10 shrink-0 place-items-center rounded-full text-white/80 hover:bg-white/10 hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
              {generalError && (
                <p role="alert" className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">
                  {generalError}
                </p>
              )}

              {/* 1. Order */}
              <Section title="Your order">
                <ul className="space-y-1.5 text-sm">
                  {items.map((i) => (
                    <li key={`${i.menuItemId}-${i.scheduledDay}`} className="flex justify-between gap-3 text-charcoal">
                      <span>
                        {i.quantity}× {i.name}
                      </span>
                      <span className="shrink-0">{taka(i.priceBdt * i.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={handleClose} className="text-sm font-semibold text-brand hover:underline">
                  Edit cart
                </button>
              </Section>

              {/* 2. Contact */}
              <Section title="Your details">
                {user ? (
                  <p className="flex items-start gap-2 rounded-xl bg-cream px-3.5 py-2.5 text-sm text-charcoal">
                    <svg viewBox="0 0 24 24" className="mt-0.5 size-4 shrink-0 text-brand" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="m3 7 9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="min-w-0">
                      {user.email ? (
                        <>
                          Order updates will be emailed to <strong className="break-all">{user.email}</strong>
                        </>
                      ) : (
                        <>Signed in as {user.fullName}</>
                      )}
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-slate">
                    Have an account?{" "}
                    <button type="button" onClick={() => openAuthModal("login")} className="font-semibold text-brand hover:underline">
                      Sign in
                    </button>{" "}
                    to fill this in.
                  </p>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div data-field="customerName">
                    <label htmlFor="checkout-customer-name" className="block text-sm font-medium text-charcoal">
                      Name
                    </label>
                    <input
                      ref={nameInputRef}
                      id="checkout-customer-name"
                      autoComplete="name"
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value)
                        clearError("customerName")
                      }}
                      aria-invalid={!!fieldErrors.customerName}
                      aria-describedby={fieldErrors.customerName ? "err-name" : undefined}
                      className={`${inputClass(!!fieldErrors.customerName)} h-12`}
                    />
                    <FieldError id="err-name" message={fieldErrors.customerName} />
                  </div>
                  <div data-field="customerPhone">
                    <label htmlFor="checkout-customer-phone" className="block text-sm font-medium text-charcoal">
                      Mobile number
                    </label>
                    <input
                      id="checkout-customer-phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="01XXXXXXXXX"
                      value={customerPhone}
                      onChange={(e) => {
                        setCustomerPhone(e.target.value)
                        clearError("customerPhone")
                      }}
                      aria-invalid={!!fieldErrors.customerPhone}
                      aria-describedby={fieldErrors.customerPhone ? "err-phone" : undefined}
                      className={`${inputClass(!!fieldErrors.customerPhone)} h-12`}
                    />
                    <FieldError id="err-phone" message={fieldErrors.customerPhone} />
                  </div>
                </div>
              </Section>

              {/* 3. Delivery */}
              <Section title="Delivery · free">
                {zones.length > 0 && (
                  <fieldset data-field="deliveryZoneId">
                    <legend className="text-sm font-medium text-charcoal">Delivery point</legend>
                    <div className="mt-1.5 grid gap-2">
                      {zones.map((z) => {
                        const active = z.id === zoneId
                        return (
                          <label
                            key={z.id}
                            className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-sm transition ${
                              active ? "border-brand bg-brand-light/60 ring-1 ring-brand" : "border-line hover:border-brand/50"
                            }`}
                          >
                            <input
                              type="radio"
                              name="delivery-zone"
                              className="sr-only"
                              checked={active}
                              onChange={() => {
                                setZoneId(z.id)
                                clearError("deliveryZoneId")
                              }}
                            />
                            <span className="min-w-0">
                              <span className="block font-semibold text-charcoal">{z.name}</span>
                              {z.area && <span className="block text-slate">{z.area}</span>}
                            </span>
                            <span className="shrink-0 text-slate">{z.etaMinutes} min</span>
                          </label>
                        )
                      })}
                    </div>
                    <FieldError id="err-zone" message={fieldErrors.deliveryZoneId} />
                  </fieldset>
                )}
                <div data-field="customerAddress">
                  <label htmlFor="checkout-customer-address" className="block text-sm font-medium text-charcoal">
                    Room, house or landmark
                  </label>
                  <textarea
                    id="checkout-customer-address"
                    rows={2}
                    autoComplete="street-address"
                    placeholder="e.g. Room 304, YKSG-1 Hall"
                    value={customerAddress}
                    onChange={(e) => {
                      setCustomerAddress(e.target.value)
                      clearError("customerAddress")
                    }}
                    aria-invalid={!!fieldErrors.customerAddress}
                    aria-describedby={fieldErrors.customerAddress ? "err-address" : undefined}
                    className={`${inputClass(!!fieldErrors.customerAddress)} resize-none py-2.5`}
                  />
                  <FieldError id="err-address" message={fieldErrors.customerAddress} />
                </div>
                {showNote ? (
                  <div>
                    <label htmlFor="checkout-notes" className="block text-sm font-medium text-charcoal">
                      Note for the kitchen or rider
                    </label>
                    <input
                      id="checkout-notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. less spicy, call at the gate"
                      className={`${inputClass()} h-12`}
                      autoFocus
                    />
                  </div>
                ) : (
                  <button type="button" onClick={() => setShowNote(true)} className="text-sm font-semibold text-brand hover:underline">
                    + Add a note
                  </button>
                )}
              </Section>

              {/* 4. Payment */}
              <Section title="Payment">
                {PAYMENT_OPTIONS.length > 1 ? (
                  <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Payment method">
                    {PAYMENT_OPTIONS.map((p) => (
                      <label
                        key={p.id}
                        className={`flex h-12 cursor-pointer items-center justify-center rounded-xl border text-sm font-semibold transition ${
                          paymentMethod === p.id
                            ? "border-brand bg-brand-light/60 text-brand ring-1 ring-brand"
                            : "border-line text-charcoal hover:border-brand/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          className="sr-only"
                          checked={paymentMethod === p.id}
                          onChange={() => {
                            setPaymentMethod(p.id)
                            clearError("paymentTrxId")
                          }}
                        />
                        {p.label}
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-xl border border-line px-3.5 py-3 text-sm text-charcoal">
                    <span className="font-semibold">Cash on delivery</span>
                    <span className="text-slate"> · pay when your food arrives</span>
                  </p>
                )}
                {online && (
                  <div data-field="paymentTrxId" className="space-y-3 rounded-xl bg-cream/60 p-3.5 text-sm">
                    <p className="text-charcoal">
                      Send <strong>{taka(checkoutTotalBdt)}</strong> with {payment.label} "Send Money" to{" "}
                      <strong className="font-mono">{payment.number}</strong>, then enter the Transaction ID.
                    </p>
                    <div>
                      <label htmlFor="checkout-payment-trxid" className="block text-sm font-medium text-charcoal">
                        Transaction ID (TrxID)
                      </label>
                      <input
                        id="checkout-payment-trxid"
                        value={paymentTrxId}
                        onChange={(e) => {
                          setPaymentTrxId(e.target.value)
                          clearError("paymentTrxId")
                        }}
                        placeholder="e.g. 8N7A6KX2Q1"
                        autoCapitalize="characters"
                        aria-invalid={!!fieldErrors.paymentTrxId}
                        aria-describedby={fieldErrors.paymentTrxId ? "err-trx" : undefined}
                        className={`${inputClass(!!fieldErrors.paymentTrxId)} h-12 font-mono uppercase`}
                      />
                      <FieldError id="err-trx" message={fieldErrors.paymentTrxId} />
                    </div>
                  </div>
                )}
              </Section>

              {/* Promo code */}
              {appliedOffer ? (
                <p className="flex items-center justify-between rounded-xl bg-emerald-50 px-3.5 py-3 text-sm text-emerald-800">
                  <span>
                    <strong className="font-mono">{appliedOffer.code}</strong> applied · −{taka(discountBdt)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedOffer(null)
                      setPromoInput("")
                    }}
                    className="font-semibold underline"
                  >
                    Remove
                  </button>
                </p>
              ) : showPromo ? (
                <div>
                  <label htmlFor="promo-code" className="block text-sm font-medium text-charcoal">
                    Promo code
                  </label>
                  <div className="mt-1.5 flex gap-2">
                    <input
                      id="promo-code"
                      value={promoInput}
                      onChange={(e) => {
                        setPromoInput(e.target.value)
                        setPromoError(null)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          applyPromo()
                        }
                      }}
                      placeholder="DIU10"
                      autoCapitalize="characters"
                      className={`${inputClass(!!promoError)} mt-0 h-12 flex-1 font-mono uppercase`}
                    />
                    <button
                      type="button"
                      onClick={applyPromo}
                      disabled={promoLoading || !promoInput.trim()}
                      className="h-12 rounded-xl bg-charcoal px-5 text-sm font-semibold text-white disabled:opacity-40"
                    >
                      {promoLoading ? "…" : "Apply"}
                    </button>
                  </div>
                  {promoError && <p className="mt-1.5 text-xs font-medium text-rose-600">{promoError}</p>}
                </div>
              ) : (
                <button type="button" onClick={() => setShowPromo(true)} className="text-sm font-semibold text-brand hover:underline">
                  Have a promo code?
                </button>
              )}

              {/* Totals */}
              <div className="space-y-1.5 border-t border-line pt-4 text-sm">
                <div className="flex justify-between text-slate">
                  <span>Subtotal</span>
                  <span>{taka(subtotalBdt)}</span>
                </div>
                {discountBdt > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount ({appliedOffer?.code})</span>
                    <span>−{taka(discountBdt)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate">
                  <span>Delivery</span>
                  <span className="font-semibold text-emerald-700">Free</span>
                </div>
                <div className="flex justify-between pt-1 text-base font-bold text-charcoal">
                  <span>Total</span>
                  <span>{taka(checkoutTotalBdt)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-line bg-white px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 sm:pb-4">
              <button
                type="submit"
                disabled={submitting || items.length === 0}
                className="flex h-12 w-full items-center justify-center rounded-xl bg-brand text-base font-bold text-white transition hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30 disabled:opacity-60"
              >
                {submitting ? "Placing your order…" : `Place order · ${taka(checkoutTotalBdt)}`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

const PAYMENT_LABEL: Record<string, string> = {
  COD: "Cash on delivery · pay when it arrives",
  BKASH: "bKash",
  NAGAD: "Nagad",
}

function OrderPlaced({
  placed,
  zone,
  email,
  closeRef,
  onClose,
  onTrack,
  onSignup,
}: {
  placed: PlacedOrderState
  zone: DeliveryZone | null
  email: string | null
  closeRef: RefObject<HTMLButtonElement | null>
  onClose: () => void
  onTrack: () => void
  onSignup: () => void
}) {
  const { order, items } = placed
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(order.orderNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard not available; the number is still on screen
    }
  }
  const steps = [
    { title: "We confirm your order", text: "Usually within a few minutes." },
    {
      title: "We cook and deliver it",
      text: zone ? `Free delivery to ${zone.name}, about ${zone.etaMinutes} min.` : "Fresh from the kitchen, free delivery.",
    },
    { title: "Enjoy your meal", text: `We'll call ${order.customerPhone} if we need anything.` },
  ]

  return (
    <div className="flex min-h-0 flex-col">
      {/* Brand header */}
      <div className="relative shrink-0 bg-maroon px-5 pb-6 pt-5 text-center text-white">
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 grid size-10 place-items-center rounded-full text-white/80 hover:bg-white/10 hover:text-white"
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-saffron text-maroon">
          <svg className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h2 id="order-confirmation-title" className="mt-3 text-2xl font-bold">
          Order placed!
        </h2>
        <p className="mt-0.5 text-sm text-white/80">অর্ডার সফলভাবে গ্রহণ করা হয়েছে</p>
        <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-white/10 py-1 pl-4 pr-1 ring-1 ring-white/20">
          <span className="text-sm">
            Order <strong id="confirmation-order-number" className="tracking-wide">{order.orderNumber}</strong>
          </span>
          <button
            type="button"
            onClick={copy}
            className="h-8 rounded-full px-3 text-xs font-semibold text-saffron hover:bg-white/10"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5" role="status">
        {/* Email note */}
        {email ? (
          <p className="flex items-start gap-2 rounded-xl bg-cream px-3.5 py-2.5 text-sm text-charcoal">
            <svg viewBox="0 0 24 24" className="mt-0.5 size-4 shrink-0 text-brand" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="min-w-0">
              We'll email updates to <strong className="break-all">{email}</strong>
            </span>
          </p>
        ) : (
          <p className="rounded-xl bg-cream px-3.5 py-2.5 text-sm text-charcoal">
            Want updates by email next time?{" "}
            <button type="button" onClick={onSignup} className="font-semibold text-brand hover:underline">
              Create an account
            </button>
          </p>
        )}

        {/* What happens next */}
        <section aria-labelledby="next-steps-title">
          <h3 id="next-steps-title" className="text-sm font-bold text-charcoal">
            What happens next
          </h3>
          <ol className="mt-3 space-y-3">
            {steps.map((step, i) => (
              <li key={step.title} className="flex gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-light text-xs font-bold text-brand">
                  {i + 1}
                </span>
                <span className="min-w-0 text-sm">
                  <span className="block font-semibold text-charcoal">{step.title}</span>
                  <span className="block text-slate">{step.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        {/* Summary */}
        <section aria-labelledby="order-summary-title" className="rounded-xl border border-line">
          <h3 id="order-summary-title" className="border-b border-line px-4 py-3 text-sm font-bold text-charcoal">
            Your order
          </h3>
          <ul className="space-y-1.5 px-4 pt-3 text-sm">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between gap-3 text-charcoal">
                <span>
                  {item.quantity}× {item.itemNameSnapshot}
                </span>
                <span className="shrink-0">{taka(item.lineTotalBdt)}</span>
              </li>
            ))}
          </ul>
          <div className="mx-4 mt-3 space-y-1 border-t border-line pt-3 text-sm">
            {(order.discountBdt ?? 0) > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount ({order.offerCode})</span>
                <span>−{taka(order.discountBdt ?? 0)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate">
              <span>Delivery</span>
              <span className="font-semibold text-emerald-700">Free</span>
            </div>
            <div className="flex justify-between pt-1 text-base font-bold text-charcoal">
              <span>Total</span>
              <span>{taka(order.totalBdt)}</span>
            </div>
          </div>
          <dl className="mt-3 space-y-2 border-t border-line bg-alabaster px-4 py-3 text-sm">
            <div>
              <dt className="text-slate">Deliver to</dt>
              <dd className="text-charcoal">
                {order.customerName} · {order.customerPhone}
                <br />
                {zone ? `${zone.name}, ` : ""}
                {order.customerAddress}
              </dd>
            </div>
            <div>
              <dt className="text-slate">Payment</dt>
              <dd className="text-charcoal">
                {PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod}
                {order.paymentTrxId && <> · TrxID {order.paymentTrxId} (we'll check it)</>}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <div className="grid shrink-0 grid-cols-2 gap-2.5 border-t border-line px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 sm:pb-4">
        <button
          type="button"
          onClick={onClose}
          className="h-12 rounded-xl border border-line text-sm font-semibold text-charcoal transition hover:bg-cream focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/20"
        >
          Back to menu
        </button>
        <button
          type="button"
          onClick={onTrack}
          className="h-12 rounded-xl bg-brand text-sm font-bold text-white transition hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30"
        >
          Track my order
        </button>
      </div>
    </div>
  )
}
