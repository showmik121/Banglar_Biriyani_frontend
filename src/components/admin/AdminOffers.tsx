import { useCallback, useEffect, useState, type FormEvent } from "react"
import { useAuth } from "../../context/AuthContext"
import { ApiError, adminFetch, inputClass, labelClass } from "./adminApi"

export interface OfferRecord {
  id: number
  code: string
  title: string
  description: string
  discountType: "PERCENT" | "FLAT"
  discountValue: number
  maxDiscountBdt: number | null
  minOrderBdt: number
  startsAt: string | null
  endsAt: string | null
  isActive: boolean
  showOnHomepage: boolean
}

type FormState = {
  code: string
  title: string
  description: string
  discountType: "PERCENT" | "FLAT"
  discountValue: string
  maxDiscountBdt: string
  minOrderBdt: string
  startsAt: string
  endsAt: string
  isActive: boolean
  showOnHomepage: boolean
}

const EMPTY: FormState = {
  code: "",
  title: "",
  description: "",
  discountType: "PERCENT",
  discountValue: "10",
  maxDiscountBdt: "",
  minOrderBdt: "0",
  startsAt: "",
  endsAt: "",
  isActive: true,
  showOnHomepage: true,
}

const toDateInput = (iso: string | null) => (iso ? iso.slice(0, 10) : "")

function toForm(o: OfferRecord): FormState {
  return {
    code: o.code,
    title: o.title,
    description: o.description,
    discountType: o.discountType,
    discountValue: String(o.discountValue),
    maxDiscountBdt: o.maxDiscountBdt ? String(o.maxDiscountBdt) : "",
    minOrderBdt: String(o.minOrderBdt),
    startsAt: toDateInput(o.startsAt),
    endsAt: toDateInput(o.endsAt),
    isActive: o.isActive,
    showOnHomepage: o.showOnHomepage,
  }
}

function toPayload(f: FormState) {
  return {
    code: f.code,
    title: f.title,
    description: f.description,
    discountType: f.discountType,
    discountValue: Number(f.discountValue),
    maxDiscountBdt: f.discountType === "PERCENT" && f.maxDiscountBdt ? Number(f.maxDiscountBdt) : null,
    minOrderBdt: Number(f.minOrderBdt || 0),
    // end date covers the whole day
    startsAt: f.startsAt ? new Date(`${f.startsAt}T00:00:00`).toISOString() : null,
    endsAt: f.endsAt ? new Date(`${f.endsAt}T23:59:59`).toISOString() : null,
    isActive: f.isActive,
    showOnHomepage: f.showOnHomepage,
  }
}

export function describeOffer(o: Pick<OfferRecord, "discountType" | "discountValue" | "maxDiscountBdt" | "minOrderBdt">) {
  const amount = o.discountType === "PERCENT" ? `${o.discountValue}% off` : `৳${o.discountValue} off`
  const cap = o.discountType === "PERCENT" && o.maxDiscountBdt ? ` (up to ৳${o.maxDiscountBdt})` : ""
  const min = o.minOrderBdt > 0 ? ` on orders over ৳${o.minOrderBdt}` : ""
  return amount + cap + min
}

function offerState(o: OfferRecord): { label: string; tone: string } {
  const now = Date.now()
  if (!o.isActive) return { label: "Paused", tone: "bg-slate-100 text-slate-600" }
  if (o.startsAt && new Date(o.startsAt).getTime() > now) return { label: "Scheduled", tone: "bg-amber-50 text-amber-700" }
  if (o.endsAt && new Date(o.endsAt).getTime() < now) return { label: "Expired", tone: "bg-rose-50 text-rose-700" }
  return { label: "Live", tone: "bg-emerald-50 text-emerald-700" }
}

export function AdminOffers() {
  const { user } = useAuth()
  const isAdmin = user?.role === "ADMIN"
  const [offers, setOffers] = useState<OfferRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<OfferRecord | "new" | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[] | undefined>>({})
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setOffers(await adminFetch<OfferRecord[]>("/api/admin/offers"))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openNew = () => {
    setError(null)
    setEditing("new")
    setForm(EMPTY)
    setFieldErrors({})
  }
  const openEdit = (o: OfferRecord) => {
    setError(null)
    setEditing(o)
    setForm(toForm(o))
    setFieldErrors({})
  }
  const close = () => setEditing(null)

  const save = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setFieldErrors({})
    try {
      const body = JSON.stringify(toPayload(form))
      if (editing === "new") {
        await adminFetch("/api/admin/offers", { method: "POST", body })
        setNotice(`Offer ${form.code.toUpperCase()} created`)
      } else if (editing) {
        await adminFetch(`/api/admin/offers/${editing.id}`, { method: "PATCH", body })
        setNotice(`Offer ${form.code.toUpperCase()} saved`)
      }
      close()
      load()
    } catch (err) {
      setFieldErrors(err instanceof ApiError ? err.fieldErrors : {})
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const toggle = async (o: OfferRecord) => {
    try {
      await adminFetch(`/api/admin/offers/${o.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !o.isActive }),
      })
      setNotice(`${o.code} ${o.isActive ? "paused" : "turned on"}`)
      load()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const remove = async (o: OfferRecord) => {
    if (!window.confirm(`Delete offer ${o.code}? Customers will no longer be able to use it.`)) return
    try {
      await adminFetch(`/api/admin/offers/${o.id}`, { method: "DELETE" })
      setNotice(`${o.code} deleted`)
      load()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }))
  const fe = (k: string) => fieldErrors[k]?.[0]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Offers & Promo Codes</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create discount codes customers can use at checkout. Live offers also show on the homepage.
          </p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={openNew}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-bold text-white transition hover:bg-brand-hover"
          >
            + New offer
          </button>
        )}
      </div>

      {notice && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800" role="status">
          {notice}
        </p>
      )}
      {error && !editing && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid gap-3 md:grid-cols-2">
          {[1, 2].map((n) => (
            <div key={n} className="h-36 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : offers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-lg font-bold text-slate-900">No offers yet</p>
          <p className="mt-1 text-sm text-slate-500">Create a promo code like DIU10 to bring in more orders.</p>
          {isAdmin && (
            <button type="button" onClick={openNew} className="mt-4 inline-flex h-11 items-center rounded-xl bg-brand px-5 text-sm font-bold text-white">
              Create first offer
            </button>
          )}
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {offers.map((o) => {
            const st = offerState(o)
            return (
              <li key={o.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-lg font-bold tracking-wider text-brand">{o.code}</p>
                    <p className="mt-0.5 font-semibold text-slate-900">{o.title}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${st.tone}`}>{st.label}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{describeOffer(o)}</p>
                {(o.startsAt || o.endsAt) && (
                  <p className="mt-1 text-xs text-slate-500">
                    {o.startsAt ? `From ${new Date(o.startsAt).toLocaleDateString()}` : "From now"}
                    {o.endsAt ? ` until ${new Date(o.endsAt).toLocaleDateString()}` : ""}
                  </p>
                )}
                {isAdmin && (
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                    <button type="button" onClick={() => openEdit(o)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:border-brand hover:text-brand">
                      Edit
                    </button>
                    <button type="button" onClick={() => toggle(o)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:border-brand hover:text-brand">
                      {o.isActive ? "Pause" : "Turn on"}
                    </button>
                    <button type="button" onClick={() => remove(o)} className="ml-auto h-10 rounded-lg px-4 text-sm font-semibold text-rose-600 hover:bg-rose-50">
                      Delete
                    </button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="offer-form-title">
          <form onSubmit={save} className="max-h-[94dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-2xl">
            <div className="flex items-center justify-between">
              <h2 id="offer-form-title" className="text-lg font-bold text-slate-900">
                {editing === "new" ? "New offer" : `Edit ${editing.code}`}
              </h2>
              <button type="button" onClick={close} aria-label="Close" className="grid size-10 place-items-center rounded-full text-slate-500 hover:bg-slate-100">
                ✕
              </button>
            </div>

            {error && (
              <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">
                {error}
              </p>
            )}

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className={labelClass}>Promo code *</span>
                <input className={`${inputClass} font-mono uppercase`} value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="DIU10" required maxLength={20} />
                {fe("code") && <span className="mt-1 block text-xs text-rose-600">{fe("code")}</span>}
              </label>
              <label className="block">
                <span className={labelClass}>Title *</span>
                <input className={inputClass} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="10% off for DIU students" required />
                {fe("title") && <span className="mt-1 block text-xs text-rose-600">{fe("title")}</span>}
              </label>
              <label className="block sm:col-span-2">
                <span className={labelClass}>Short description</span>
                <input className={inputClass} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Shown on the homepage banner" />
              </label>
              <label className="block">
                <span className={labelClass}>Discount type</span>
                <select className={inputClass} value={form.discountType} onChange={(e) => set("discountType", e.target.value as FormState["discountType"])}>
                  <option value="PERCENT">Percent (%)</option>
                  <option value="FLAT">Fixed amount (৳)</option>
                </select>
              </label>
              <label className="block">
                <span className={labelClass}>{form.discountType === "PERCENT" ? "Percent off *" : "Taka off *"}</span>
                <input className={inputClass} type="number" min={1} max={form.discountType === "PERCENT" ? 100 : undefined} value={form.discountValue} onChange={(e) => set("discountValue", e.target.value)} required />
                {fe("discountValue") && <span className="mt-1 block text-xs text-rose-600">{fe("discountValue")}</span>}
              </label>
              {form.discountType === "PERCENT" && (
                <label className="block">
                  <span className={labelClass}>Maximum discount (৳)</span>
                  <input className={inputClass} type="number" min={1} value={form.maxDiscountBdt} onChange={(e) => set("maxDiscountBdt", e.target.value)} placeholder="No limit" />
                </label>
              )}
              <label className="block">
                <span className={labelClass}>Minimum order (৳)</span>
                <input className={inputClass} type="number" min={0} value={form.minOrderBdt} onChange={(e) => set("minOrderBdt", e.target.value)} />
              </label>
              <label className="block">
                <span className={labelClass}>Starts</span>
                <input className={inputClass} type="date" value={form.startsAt} onChange={(e) => set("startsAt", e.target.value)} />
              </label>
              <label className="block">
                <span className={labelClass}>Ends</span>
                <input className={inputClass} type="date" value={form.endsAt} onChange={(e) => set("endsAt", e.target.value)} />
                {fe("endsAt") && <span className="mt-1 block text-xs text-rose-600">{fe("endsAt")}</span>}
              </label>
              <label className="flex items-center gap-3 sm:col-span-2">
                <input type="checkbox" className="size-5 accent-brand" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} />
                <span className="text-sm text-slate-700">Offer is on</span>
              </label>
              <label className="flex items-center gap-3 sm:col-span-2">
                <input type="checkbox" className="size-5 accent-brand" checked={form.showOnHomepage} onChange={(e) => set("showOnHomepage", e.target.checked)} />
                <span className="text-sm text-slate-700">Show on the homepage</span>
              </label>
            </div>

            <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
              Customers get:{" "}
              <strong className="text-slate-900">
                {describeOffer({
                  discountType: form.discountType,
                  discountValue: Number(form.discountValue || 0),
                  maxDiscountBdt: form.maxDiscountBdt ? Number(form.maxDiscountBdt) : null,
                  minOrderBdt: Number(form.minOrderBdt || 0),
                })}
              </strong>
            </p>

            <div className="mt-6 flex gap-3">
              <button type="button" onClick={close} className="h-11 flex-1 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="h-11 flex-1 rounded-xl bg-brand text-sm font-bold text-white disabled:opacity-60">
                {saving ? "Saving…" : editing === "new" ? "Create offer" : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
