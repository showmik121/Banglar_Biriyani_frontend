import { useCallback, useEffect, useState, type FormEvent } from "react"
import { useAuth } from "../../context/AuthContext"
import { useLang } from "../../context/LanguageContext"
import { ApiError, adminFetch, btnDanger, btnPrimary, btnSecondary, dg, inputClass, labelClass } from "./adminApi"
import { useRefreshOnReturn } from "./useRefreshOnReturn"
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
  const { tr } = useLang()
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
  useRefreshOnReturn(load)

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
      setNotice(tr(`${form.name} saved`, `${form.name} সেভ হয়েছে`))
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
      setNotice(isActive ? tr(`${z.name} is open for delivery`, `${z.name}-এ ডেলিভারি চালু`) : tr(`${z.name} is paused`, `${z.name}-এ ডেলিভারি বন্ধ`))
    } catch (err) {
      setError((err as Error).message)
      load()
    }
  }

  const remove = async () => {
    if (!editing || editing === "new") return
    if (!window.confirm(
        tr(
          `Delete delivery point "${editing.name}"? Customers will no longer be able to choose it.`,
          `"${editing.name}" ডেলিভারি পয়েন্ট মুছে ফেলবেন? কাস্টমার আর এটা বেছে নিতে পারবে না।`,
        ),
      )) return
    try {
      await adminFetch(`/api/admin/delivery-zones/${editing.id}`, { method: "DELETE" })
      setNotice(tr(`${editing.name} deleted`, `${editing.name} মুছে ফেলা হয়েছে`))
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
        title={tr("Delivery points", "ডেলিভারি পয়েন্ট")}
        action={
          isAdmin && (
            <button type="button" onClick={() => open("new")} className={btnPrimary}>
              {tr("Add point", "পয়েন্ট যোগ করুন")}
            </button>
          )
        }
      />
      <p className="-mt-3 mb-5 text-sm text-slate">{tr("Customers pick one of these at checkout. Delivery is free everywhere.", "কাস্টমার চেকআউটে এর একটা বেছে নেয়। সব জায়গায় ডেলিভারি ফ্রি।")}</p>
      {notice && <Notice kind="ok">{notice}</Notice>}
      {error && <Notice kind="error">{error}</Notice>}

      {loading ? (
        <ListSkeleton />
      ) : zones.length === 0 ? (
        <Empty
          title={tr("No delivery points yet", "এখনও কোনো ডেলিভারি পয়েন্ট নেই")}
          hint={tr("Add places like DIU campus, Khagan or Birulia.", "DIU ক্যাম্পাস, খাগান বা বিরুলিয়ার মতো জায়গা যোগ করুন।")}
        />
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
          {zones.map((z) => (
            <li key={z.id} className="flex items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className={`font-medium ${z.isActive ? "text-charcoal" : "text-slate/70"}`}>{z.name}</p>
                <p className="text-sm text-slate">
                  {z.area ? `${z.area} · ` : ""}
                  {dg(z.etaMinutes)} {tr("min", "মিনিট")}
                </p>
              </div>
              {isAdmin && (
                <>
                  <Toggle checked={z.isActive} onChange={(v) => toggle(z, v)} label={tr("Open", "চালু")} compact />
                  <button type="button" onClick={() => open(z)} className={btnSecondary}>
                    {tr("Edit", "এডিট")}
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {editing && form && (
        <FormDialog
          title={editing === "new" ? tr("Add delivery point", "ডেলিভারি পয়েন্ট যোগ করুন") : tr(`Edit ${editing.name}`, `${editing.name} এডিট`)}
          onClose={close}
          onSubmit={save}
          saving={saving}
          submitLabel={editing === "new" ? tr("Add point", "পয়েন্ট যোগ করুন") : tr("Save changes", "পরিবর্তন সেভ করুন")}
          error={formError}
          footerExtra={
            editing !== "new" && (
              <button type="button" onClick={remove} className={btnDanger}>
                {tr("Delete", "মুছুন")}
              </button>
            )
          }
        >
          <label>
            <span className={labelClass}>{tr("Name", "নাম")}</span>
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
            <span className={labelClass}>{tr("Area or landmark (optional)", "এলাকা বা চেনা জায়গা (ঐচ্ছিক)")}</span>
            <input className={inputClass} value={form.area} onChange={(e) => set("area", e.target.value)} placeholder={tr("Campus & hostels", "ক্যাম্পাস ও হোস্টেল")} />
          </label>
          <label>
            <span className={labelClass}>{tr("Delivery time (minutes)", "ডেলিভারি সময় (মিনিট)")}</span>
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
          <Toggle checked={form.isActive} onChange={(v) => set("isActive", v)} label={tr("Customers can choose this point", "কাস্টমার এই পয়েন্ট বেছে নিতে পারবে")} />
        </FormDialog>
      )}
    </div>
  )
}
