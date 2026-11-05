import { useCallback, useEffect, useState, type FormEvent } from "react"
import { useAuth } from "../../context/AuthContext"
import { useLang } from "../../context/LanguageContext"
import { ApiError, adminFetch, adminIsBangla, btnDanger, btnPrimary, btnSecondary, dg, inputClass, labelClass, taka } from "./adminApi"
import { useRefreshOnReturn } from "./useRefreshOnReturn"
import { Empty, FieldError, FormDialog, ListSkeleton, Notice, PageHeader, Toggle } from "./adminUi"

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

type Form = {
  code: string
  title: string
  discountType: "PERCENT" | "FLAT"
  discountValue: string
  minOrderBdt: string
  maxDiscountBdt: string
  endsOn: string
  isActive: boolean
  showOnHomepage: boolean
}

const TZ = "Asia/Dhaka"
const toDateInput = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { timeZone: TZ })
const prettyDate = (iso: string) =>
  new Date(iso).toLocaleDateString(adminIsBangla() ? "bn-BD" : "en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: TZ })

/** "10% off (max ৳100) · orders from ৳300" */
export function describeOffer(o: Pick<OfferRecord, "discountType" | "discountValue" | "maxDiscountBdt" | "minOrderBdt">) {
  if (adminIsBangla()) {
    const amount =
      o.discountType === "PERCENT"
        ? `${dg(o.discountValue)}% ছাড়${o.maxDiscountBdt ? ` (সর্বোচ্চ ${taka(o.maxDiscountBdt)})` : ""}`
        : `${taka(o.discountValue)} ছাড়`
    return o.minOrderBdt > 0 ? `${amount} · ${taka(o.minOrderBdt)}-এর বেশি অর্ডারে` : amount
  }
  const amount =
    o.discountType === "PERCENT"
      ? `${o.discountValue}% off${o.maxDiscountBdt ? ` (max ${taka(o.maxDiscountBdt)})` : ""}`
      : `${taka(o.discountValue)} off`
  return o.minOrderBdt > 0 ? `${amount} · orders from ${taka(o.minOrderBdt)}` : amount
}

function stateOf(o: OfferRecord): { label: string; style: string } {
  const now = Date.now()
  const bn = adminIsBangla()
  if (o.endsAt && new Date(o.endsAt).getTime() < now) return { label: bn ? "শেষ" : "Ended", style: "bg-cream text-slate" }
  if (!o.isActive) return { label: bn ? "বন্ধ আছে" : "Paused", style: "bg-cream text-slate" }
  if (o.startsAt && new Date(o.startsAt).getTime() > now) return { label: bn ? "পরে শুরু" : "Starts later", style: "bg-sky-100 text-sky-800" }
  return { label: bn ? "চালু" : "Live", style: "bg-emerald-100 text-emerald-800" }
}

export function AdminOffers() {
  const { user } = useAuth()
  const { tr } = useLang()
  const isAdmin = user?.role === "ADMIN"
  const [offers, setOffers] = useState<OfferRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [editing, setEditing] = useState<OfferRecord | "new" | null>(null)
  const [form, setForm] = useState<Form | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[] | undefined>>({})
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      setOffers(await adminFetch<OfferRecord[]>("/api/admin/offers"))
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

  const open = (o: OfferRecord | "new") => {
    setEditing(o)
    setFormError(null)
    setFieldErrors({})
    setForm(
      o === "new"
        ? {
            code: "",
            title: "",
            discountType: "PERCENT",
            discountValue: "10",
            minOrderBdt: "0",
            maxDiscountBdt: "",
            endsOn: "",
            isActive: true,
            showOnHomepage: true,
          }
        : {
            code: o.code,
            title: o.title,
            discountType: o.discountType,
            discountValue: String(o.discountValue),
            minOrderBdt: String(o.minOrderBdt),
            maxDiscountBdt: o.maxDiscountBdt ? String(o.maxDiscountBdt) : "",
            endsOn: o.endsAt ? toDateInput(o.endsAt) : "",
            isActive: o.isActive,
            showOnHomepage: o.showOnHomepage,
          },
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
    const body = JSON.stringify({
      code: form.code,
      title: form.title,
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      minOrderBdt: Number(form.minOrderBdt || 0),
      maxDiscountBdt: form.discountType === "PERCENT" && form.maxDiscountBdt ? Number(form.maxDiscountBdt) : null,
      // The offer runs until the end of the chosen day, Bangladesh time
      endsAt: form.endsOn ? `${form.endsOn}T23:59:59+06:00` : null,
      isActive: form.isActive,
      showOnHomepage: form.showOnHomepage,
    })
    try {
      if (editing === "new") await adminFetch("/api/admin/offers", { method: "POST", body })
      else await adminFetch(`/api/admin/offers/${editing.id}`, { method: "PATCH", body })
      setNotice(tr(`${form.code.toUpperCase()} saved`, `${form.code.toUpperCase()} সেভ হয়েছে`))
      setEditing(null)
      load()
    } catch (err) {
      setFieldErrors(err instanceof ApiError ? err.fieldErrors : {})
      setFormError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const togglePause = async (o: OfferRecord) => {
    try {
      await adminFetch(`/api/admin/offers/${o.id}`, { method: "PATCH", body: JSON.stringify({ isActive: !o.isActive }) })
      setNotice(o.isActive ? tr(`${o.code} paused`, `${o.code} বন্ধ করা হয়েছে`) : tr(`${o.code} turned on`, `${o.code} চালু করা হয়েছে`))
      load()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const remove = async () => {
    if (!editing || editing === "new") return
    if (!window.confirm(
        tr(
          `Delete offer ${editing.code}? Customers will no longer be able to use it.`,
          `${editing.code} অফার মুছে ফেলবেন? কাস্টমার আর এটা ব্যবহার করতে পারবে না।`,
        ),
      )) return
    try {
      await adminFetch(`/api/admin/offers/${editing.id}`, { method: "DELETE" })
      setNotice(tr(`${editing.code} deleted`, `${editing.code} মুছে ফেলা হয়েছে`))
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
        title={tr("Offers", "অফার")}
        action={
          isAdmin && (
            <button type="button" onClick={() => open("new")} className={btnPrimary}>
              {tr("New offer", "নতুন অফার")}
            </button>
          )
        }
      />
      {notice && <Notice kind="ok">{notice}</Notice>}
      {error && <Notice kind="error">{error}</Notice>}

      {loading ? (
        <ListSkeleton />
      ) : offers.length === 0 ? (
        <Empty
          title={tr("No offers yet", "এখনও কোনো অফার নেই")}
          hint={tr("Create a promo code like DIU10 that customers type at checkout.", "DIU10-এর মতো একটা প্রোমো কোড বানান, যা কাস্টমার চেকআউটে লিখবে।")}
        />
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
          {offers.map((o) => {
            const st = stateOf(o)
            return (
              <li key={o.id} className="flex flex-wrap items-center gap-3 p-4 sm:flex-nowrap">
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-semibold text-charcoal">{o.code}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${st.style}`}>{st.label}</span>
                  </p>
                  <p className="mt-0.5 text-sm text-slate">{describeOffer(o)}</p>
                  {o.endsAt && <p className="text-sm text-slate">{tr("Until", "শেষ তারিখ")} {prettyDate(o.endsAt)}</p>}
                </div>
                {isAdmin && (
                  <div className="flex gap-2">
                    <button type="button" onClick={() => togglePause(o)} className={btnSecondary}>
                      {o.isActive ? tr("Pause", "বন্ধ করুন") : tr("Turn on", "চালু করুন")}
                    </button>
                    <button type="button" onClick={() => open(o)} className={btnSecondary}>
                      {tr("Edit", "এডিট")}
                    </button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {editing && form && (
        <FormDialog
          title={editing === "new" ? tr("New offer", "নতুন অফার") : tr(`Edit ${editing.code}`, `${editing.code} এডিট`)}
          onClose={close}
          onSubmit={save}
          saving={saving}
          submitLabel={editing === "new" ? tr("Create offer", "অফার তৈরি করুন") : tr("Save changes", "পরিবর্তন সেভ করুন")}
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
            <span className={labelClass}>{tr("Promo code", "প্রোমো কোড")}</span>
            <input
              className={`${inputClass} font-mono uppercase`}
              value={form.code}
              onChange={(e) => set("code", e.target.value)}
              placeholder="DIU10"
              required
              minLength={3}
              maxLength={20}
              autoCapitalize="characters"
            />
            <FieldError message={fe("code")} />
          </label>
          <label>
            <span className={labelClass}>{tr("Title customers see", "কাস্টমার যে শিরোনাম দেখবে")}</span>
            <input
              className={inputClass}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder={tr("10% off for DIU students", "DIU শিক্ষার্থীদের ১০% ছাড়")}
              required
              minLength={2}
            />
            <FieldError message={fe("title")} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className={labelClass}>{tr("Discount", "ছাড়")}</span>
              <select
                className={inputClass}
                value={form.discountType}
                onChange={(e) => set("discountType", e.target.value as Form["discountType"])}
              >
                <option value="PERCENT">{tr("Percent (%)", "শতাংশ (%)")}</option>
                <option value="FLAT">{tr("Fixed amount (৳)", "নির্দিষ্ট টাকা (৳)")}</option>
              </select>
            </label>
            <label>
              <span className={labelClass}>{form.discountType === "PERCENT" ? tr("Percent", "শতাংশ") : tr("Amount (৳)", "টাকার পরিমাণ (৳)")}</span>
              <input
                className={inputClass}
                type="number"
                inputMode="numeric"
                min={1}
                max={form.discountType === "PERCENT" ? 100 : undefined}
                value={form.discountValue}
                onChange={(e) => set("discountValue", e.target.value)}
                required
              />
              <FieldError message={fe("discountValue")} />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className={labelClass}>{tr("Minimum order (৳)", "সর্বনিম্ন অর্ডার (৳)")}</span>
              <input
                className={inputClass}
                type="number"
                inputMode="numeric"
                min={0}
                value={form.minOrderBdt}
                onChange={(e) => set("minOrderBdt", e.target.value)}
              />
            </label>
            {form.discountType === "PERCENT" && (
              <label>
                <span className={labelClass}>{tr("Max discount (৳)", "সর্বোচ্চ ছাড় (৳)")}</span>
                <input
                  className={inputClass}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={form.maxDiscountBdt}
                  onChange={(e) => set("maxDiscountBdt", e.target.value)}
                  placeholder={tr("No limit", "সীমা নেই")}
                />
              </label>
            )}
          </div>
          <label>
            <span className={labelClass}>{tr("Last day (optional)", "শেষ দিন (ঐচ্ছিক)")}</span>
            <input className={inputClass} type="date" value={form.endsOn} onChange={(e) => set("endsOn", e.target.value)} />
            <FieldError message={fe("endsAt")} />
          </label>
          <Toggle checked={form.isActive} onChange={(v) => set("isActive", v)} label={tr("Customers can use this code", "কাস্টমার এই কোড ব্যবহার করতে পারবে")} />
          <Toggle checked={form.showOnHomepage} onChange={(v) => set("showOnHomepage", v)} label={tr("Show on the homepage", "হোমপেজে দেখান")} />
        </FormDialog>
      )}
    </div>
  )
}
