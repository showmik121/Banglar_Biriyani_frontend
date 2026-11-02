import { useCallback, useEffect, useState, type FormEvent } from "react"
import { useAuth } from "../../context/AuthContext"
import { ApiError, adminFetch, inputClass, labelClass } from "./adminApi"

export interface DeliveryZoneRecord {
  id: number
  name: string
  area: string
  feeBdt: number
  etaMinutes: string
  isActive: boolean
  sortOrder: number
}

type FormState = { name: string; area: string; feeBdt: string; etaMinutes: string; sortOrder: string; isActive: boolean }
const EMPTY: FormState = { name: "", area: "", feeBdt: "40", etaMinutes: "20-30", sortOrder: "0", isActive: true }

export function AdminDeliveryZones() {
  const { user } = useAuth()
  const isAdmin = user?.role === "ADMIN"
  const [zones, setZones] = useState<DeliveryZoneRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [editing, setEditing] = useState<DeliveryZoneRecord | "new" | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[] | undefined>>({})
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setZones(await adminFetch<DeliveryZoneRecord[]>("/api/admin/delivery-zones"))
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const open = (z: DeliveryZoneRecord | "new") => {
    setEditing(z)
    setError(null)
    setFieldErrors({})
    setForm(
      z === "new"
        ? { ...EMPTY, sortOrder: String(zones.length + 1) }
        : {
            name: z.name,
            area: z.area,
            feeBdt: String(z.feeBdt),
            etaMinutes: z.etaMinutes,
            sortOrder: String(z.sortOrder),
            isActive: z.isActive,
          },
    )
  }

  const save = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setFieldErrors({})
    const body = JSON.stringify({
      name: form.name,
      area: form.area,
      feeBdt: Number(form.feeBdt),
      etaMinutes: form.etaMinutes.replace(/\s+/g, ""),
      sortOrder: Number(form.sortOrder || 0),
      isActive: form.isActive,
    })
    try {
      if (editing === "new") await adminFetch("/api/admin/delivery-zones", { method: "POST", body })
      else if (editing) await adminFetch(`/api/admin/delivery-zones/${editing.id}`, { method: "PATCH", body })
      setNotice(`${form.name} saved`)
      setEditing(null)
      load()
    } catch (err) {
      setFieldErrors(err instanceof ApiError ? err.fieldErrors : {})
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const toggle = async (z: DeliveryZoneRecord) => {
    try {
      await adminFetch(`/api/admin/delivery-zones/${z.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !z.isActive }),
      })
      setNotice(`${z.name} ${z.isActive ? "paused" : "turned on"}`)
      load()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const remove = async (z: DeliveryZoneRecord) => {
    if (!window.confirm(`Delete delivery point "${z.name}"? Customers will no longer be able to choose it.`)) return
    try {
      await adminFetch(`/api/admin/delivery-zones/${z.id}`, { method: "DELETE" })
      setNotice(`${z.name} deleted`)
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
          <h1 className="text-2xl font-bold text-slate-900">Delivery Points</h1>
          <p className="mt-1 text-sm text-slate-500">
            Places you deliver to, with their delivery fee and time. Customers pick one at checkout.
          </p>
        </div>
        {isAdmin && (
          <button type="button" onClick={() => open("new")} className="inline-flex h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-bold text-white transition hover:bg-brand-hover">
            + Add delivery point
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
        <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />
      ) : zones.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-lg font-bold text-slate-900">No delivery points yet</p>
          <p className="mt-1 text-sm text-slate-500">Add DIU campus, Khagan, Birulia… with a fee for each.</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {zones.map((z) => (
            <li key={z.id} className="flex flex-wrap items-center gap-3 p-4 sm:flex-nowrap">
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-semibold text-slate-900">
                  {z.name}
                  {!z.isActive && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">Paused</span>}
                </p>
                <p className="text-sm text-slate-500">{z.area || "—"}</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="rounded-full bg-brand-light px-3 py-1 font-bold text-brand">৳{z.feeBdt}</span>
                <span className="rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-700">{z.etaMinutes} min</span>
              </div>
              {isAdmin && (
                <div className="flex w-full gap-2 sm:w-auto">
                  <button type="button" onClick={() => open(z)} className="h-10 flex-1 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:border-brand hover:text-brand sm:flex-none">
                    Edit
                  </button>
                  <button type="button" onClick={() => toggle(z)} className="h-10 flex-1 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:border-brand hover:text-brand sm:flex-none">
                    {z.isActive ? "Pause" : "Turn on"}
                  </button>
                  <button type="button" onClick={() => remove(z)} className="h-10 flex-1 rounded-lg px-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 sm:flex-none">
                    Delete
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="zone-form-title">
          <form onSubmit={save} className="max-h-[94dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-2xl">
            <div className="flex items-center justify-between">
              <h2 id="zone-form-title" className="text-lg font-bold text-slate-900">
                {editing === "new" ? "Add delivery point" : `Edit ${editing.name}`}
              </h2>
              <button type="button" onClick={() => setEditing(null)} aria-label="Close" className="grid size-10 place-items-center rounded-full text-slate-500 hover:bg-slate-100">
                ✕
              </button>
            </div>
            {error && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">{error}</p>}

            <div className="mt-5 grid gap-4">
              <label className="block">
                <span className={labelClass}>Name *</span>
                <input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Daffodil Smart City" required />
                {fe("name") && <span className="mt-1 block text-xs text-rose-600">{fe("name")}</span>}
              </label>
              <label className="block">
                <span className={labelClass}>Area / note</span>
                <input className={inputClass} value={form.area} onChange={(e) => set("area", e.target.value)} placeholder="Campus & hostels" />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className={labelClass}>Delivery fee (৳) *</span>
                  <input className={inputClass} type="number" min={0} value={form.feeBdt} onChange={(e) => set("feeBdt", e.target.value)} required />
                  {fe("feeBdt") && <span className="mt-1 block text-xs text-rose-600">{fe("feeBdt")}</span>}
                </label>
                <label className="block">
                  <span className={labelClass}>Time (minutes)</span>
                  <input className={inputClass} value={form.etaMinutes} onChange={(e) => set("etaMinutes", e.target.value)} placeholder="20-30" />
                  {fe("etaMinutes") && <span className="mt-1 block text-xs text-rose-600">{fe("etaMinutes")}</span>}
                </label>
              </div>
              <label className="block">
                <span className={labelClass}>Order in list</span>
                <input className={inputClass} type="number" min={0} value={form.sortOrder} onChange={(e) => set("sortOrder", e.target.value)} />
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="size-5 accent-brand" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} />
                <span className="text-sm text-slate-700">Customers can choose this point</span>
              </label>
            </div>

            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => setEditing(null)} className="h-11 flex-1 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="h-11 flex-1 rounded-xl bg-brand text-sm font-bold text-white disabled:opacity-60">
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
