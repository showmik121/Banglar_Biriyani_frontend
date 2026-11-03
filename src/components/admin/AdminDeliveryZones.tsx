import { useCallback, useEffect, useState, type FormEvent } from "react"
import { useAuth } from "../../context/AuthContext"
import { ApiError, adminFetch, btnDanger, btnPrimary, btnSecondary, inputClass, labelClass } from "./adminApi"
import { Empty, FieldError, FormDialog, ListSkeleton, Notice, PageHeader, Toggle } from "./adminUi"

export interface DeliveryZoneRecord {
  id: number
  name: string
  area: string
  etaMinutes: string
  isActive: boolean
  sortOrder: number
}

type Form = { name: string; area: string; etaMinutes: string; isActive: boolean }

export function AdminDeliveryZones() {
  const { user } = useAuth()
  const isAdmin = user?.role === "ADMIN"
  const [zones, setZones] = useState<DeliveryZoneRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [editing, setEditing] = useState<DeliveryZoneRecord | "new" | null>(null)
  const [form, setForm] = useState<Form | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[] | undefined>>({})
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
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
    setFormError(null)
    setFieldErrors({})
    setForm(
      z === "new"
        ? { name: "", area: "", etaMinutes: "20-30", isActive: true }
        : { name: z.name, area: z.area, etaMinutes: z.etaMinutes, isActive: z.isActive },
    )
  }
  const close = useCallback(() => setEditing(null), [])
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => (f ? { ...f, [k]: v } : f))

  const save = async (e: FormEvent) => {
    e.preventDefault()
    if (!form || !editing) return
    setSaving(true)
    setFormError(null)
    setFieldErrors({})
    const fields = {
      name: form.name,
      area: form.area,
      etaMinutes: form.etaMinutes.replace(/\s+/g, ""),
      isActive: form.isActive,
    }
    try {
      if (editing === "new") {
        await adminFetch("/api/admin/delivery-zones", {
          method: "POST",
          body: JSON.stringify({ ...fields, sortOrder: zones.length + 1 }),
        })
      } else {
        await adminFetch(`/api/admin/delivery-zones/${editing.id}`, { method: "PATCH", body: JSON.stringify(fields) })
      }
      setNotice(`${form.name} saved`)
      setEditing(null)
      load()
    } catch (err) {
      setFieldErrors(err instanceof ApiError ? err.fieldErrors : {})
      setFormError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const toggle = async (z: DeliveryZoneRecord, isActive: boolean) => {
    setZones((list) => list.map((x) => (x.id === z.id ? { ...x, isActive } : x)))
    try {
      await adminFetch(`/api/admin/delivery-zones/${z.id}`, { method: "PATCH", body: JSON.stringify({ isActive }) })
      setNotice(`${z.name} ${isActive ? "is open for delivery" : "is paused"}`)
    } catch (err) {
      setError((err as Error).message)
      load()
    }
  }

  const remove = async () => {
    if (!editing || editing === "new") return
    if (!window.confirm(`Delete delivery point "${editing.name}"? Customers will no longer be able to choose it.`)) return
    try {
      await adminFetch(`/api/admin/delivery-zones/${editing.id}`, { method: "DELETE" })
      setNotice(`${editing.name} deleted`)
      setEditing(null)
      load()
    } catch (err) {
      setFormError((err as Error).message)
    }
  }

  const fe = (k: string) => fieldErrors[k]?.[0]

  return (
    <div>
      <PageHeader
        title="Delivery points"
        action={
          isAdmin && (
            <button type="button" onClick={() => open("new")} className={btnPrimary}>
              Add point
            </button>
          )
        }
      />
      <p className="-mt-3 mb-5 text-sm text-slate">Customers pick one of these at checkout. Delivery is free everywhere.</p>
      {notice && <Notice kind="ok">{notice}</Notice>}
      {error && <Notice kind="error">{error}</Notice>}

      {loading ? (
        <ListSkeleton />
      ) : zones.length === 0 ? (
        <Empty title="No delivery points yet" hint="Add places like DIU campus, Khagan or Birulia." />
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
          {zones.map((z) => (
            <li key={z.id} className="flex items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className={`font-medium ${z.isActive ? "text-charcoal" : "text-slate/70"}`}>{z.name}</p>
                <p className="text-sm text-slate">
                  {z.area ? `${z.area} · ` : ""}
                  {z.etaMinutes} min
                </p>
              </div>
              {isAdmin && (
                <>
                  <Toggle checked={z.isActive} onChange={(v) => toggle(z, v)} label="Open" compact />
                  <button type="button" onClick={() => open(z)} className={btnSecondary}>
                    Edit
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {editing && form && (
        <FormDialog
          title={editing === "new" ? "Add delivery point" : `Edit ${editing.name}`}
          onClose={close}
          onSubmit={save}
          saving={saving}
          submitLabel={editing === "new" ? "Add point" : "Save changes"}
          error={formError}
          footerExtra={
            editing !== "new" && (
              <button type="button" onClick={remove} className={btnDanger}>
                Delete
              </button>
            )
          }
        >
          <label>
            <span className={labelClass}>Name</span>
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Daffodil Smart City"
              required
              minLength={2}
            />
            <FieldError message={fe("name")} />
          </label>
          <label>
            <span className={labelClass}>Area or landmark (optional)</span>
            <input className={inputClass} value={form.area} onChange={(e) => set("area", e.target.value)} placeholder="Campus & hostels" />
          </label>
          <label>
            <span className={labelClass}>Delivery time (minutes)</span>
            <input
              className={inputClass}
              value={form.etaMinutes}
              onChange={(e) => set("etaMinutes", e.target.value)}
              placeholder="20-30"
              inputMode="numeric"
              required
            />
            <FieldError message={fe("etaMinutes")} />
          </label>
          <Toggle checked={form.isActive} onChange={(v) => set("isActive", v)} label="Customers can choose this point" />
        </FormDialog>
      )}
    </div>
  )
}
