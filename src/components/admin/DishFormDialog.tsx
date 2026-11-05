import { useState, type FormEvent } from "react"
import { useLang } from "../../context/LanguageContext"
import { ApiError, adminFetch, btnDanger, inputClass, labelClass } from "./adminApi"
import { FieldError, FormDialog, Toggle } from "./adminUi"

export interface DishData {
  id: number
  categoryId: number
  name: string
  description: string
  basePriceBdt: number
  imageUrl: string
  isAvailable: boolean
}
export interface DishCategory {
  id: number
  name: string
}

const NEW_CATEGORY = "new"

/** Add or edit one dish (photo link, name, price, category, description). Shared by Menu and Daily meals. */
export function DishFormDialog({
  dish,
  categories,
  isAdmin,
  isEveryday = true,
  onClose,
  onSaved,
  onDeleted,
}: {
  dish: DishData | null
  categories: DishCategory[]
  isAdmin: boolean
  /** new dishes made from Daily meals are NOT "everyday": they only appear on the days/meals they are added to */
  isEveryday?: boolean
  onClose: () => void
  onSaved: (id: number, name: string, isNew: boolean) => void
  onDeleted?: (id: number, name: string) => void
}) {
  const { tr } = useLang()
  const isNew = dish === null
  const [form, setForm] = useState({
    name: dish?.name ?? "",
    price: dish ? String(dish.basePriceBdt) : "",
    imageUrl: dish?.imageUrl ?? "",
    description: dish?.description ?? "",
    categoryId: dish ? String(dish.categoryId) : categories[0] ? String(categories[0].id) : NEW_CATEGORY,
    newCategory: "",
    isAvailable: dish?.isAvailable ?? true,
  })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[] | undefined>>({})
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }))
  const fe = (k: string) => fieldErrors[k]?.[0]

  const save = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    setFieldErrors({})
    const base = {
      name: form.name.trim(),
      basePriceBdt: Number(form.price),
      imageUrl: form.imageUrl.trim(),
      description: form.description.trim(),
      isAvailable: form.isAvailable,
    }
    try {
      if (isNew) {
        const category =
          form.categoryId === NEW_CATEGORY ? { categoryName: form.newCategory.trim() } : { categoryId: Number(form.categoryId) }
        const res = await adminFetch<{ menuItem: { id: number } }>("/api/admin/menu", {
          method: "POST",
          body: JSON.stringify({ ...base, ...category, isEveryday }),
        })
        onSaved(res.menuItem.id, base.name, true)
      } else {
        await adminFetch(`/api/admin/menu/${dish.id}`, {
          method: "PATCH",
          body: JSON.stringify({ ...base, categoryId: Number(form.categoryId) }),
        })
        onSaved(dish.id, base.name, false)
      }
    } catch (err) {
      setFieldErrors(err instanceof ApiError ? err.fieldErrors : {})
      setFormError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!dish) return
    if (
      !window.confirm(
        tr(
          `Delete "${dish.name}"? If it was ever ordered, it will be hidden instead.`,
          `"${dish.name}" মুছে ফেলবেন? আগে অর্ডার হয়ে থাকলে মুছে না গিয়ে লুকানো থাকবে।`,
        ),
      )
    )
      return
    try {
      await adminFetch(`/api/admin/menu/${dish.id}`, { method: "DELETE" })
      onDeleted?.(dish.id, dish.name)
    } catch (err) {
      setFormError((err as Error).message)
    }
  }

  return (
    <FormDialog
      title={isNew ? tr("Add dish", "খাবার যোগ করুন") : tr(`Edit ${dish.name}`, `${dish.name} এডিট`)}
      onClose={onClose}
      onSubmit={save}
      saving={saving}
      submitLabel={isNew ? tr("Add dish", "খাবার যোগ করুন") : tr("Save changes", "পরিবর্তন সেভ করুন")}
      error={formError}
      footerExtra={
        isAdmin &&
        !isNew &&
        onDeleted && (
          <button type="button" onClick={remove} className={btnDanger}>
            {tr("Delete", "মুছুন")}
          </button>
        )
      }
    >
      <div className="flex items-start gap-3">
        <div className="size-20 shrink-0 overflow-hidden rounded-lg bg-cream">
          {form.imageUrl && <img src={form.imageUrl} alt={tr("Photo preview", "ছবির প্রিভিউ")} className="size-full object-cover" />}
        </div>
        <label className="min-w-0 flex-1">
          <span className={labelClass}>{tr("Photo link", "ছবির লিংক")}</span>
          <input
            className={inputClass}
            type="url"
            value={form.imageUrl}
            onChange={(e) => set("imageUrl", e.target.value)}
            placeholder="https://…"
            required
          />
          <FieldError message={fe("imageUrl")} />
        </label>
      </div>
      <label>
        <span className={labelClass}>{tr("Name", "নাম")}</span>
        <input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} required minLength={2} />
        <FieldError message={fe("name")} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label>
          <span className={labelClass}>{tr("Price (৳)", "দাম (৳)")}</span>
          <input
            className={inputClass}
            type="number"
            inputMode="numeric"
            min={1}
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            required
          />
          <FieldError message={fe("basePriceBdt")} />
        </label>
        <label>
          <span className={labelClass}>{tr("Category", "ক্যাটাগরি")}</span>
          <select className={inputClass} value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
            {isNew && <option value={NEW_CATEGORY}>{tr("New category…", "নতুন ক্যাটাগরি…")}</option>}
          </select>
        </label>
      </div>
      {form.categoryId === NEW_CATEGORY && (
        <label>
          <span className={labelClass}>{tr("New category name", "নতুন ক্যাটাগরির নাম")}</span>
          <input className={inputClass} value={form.newCategory} onChange={(e) => set("newCategory", e.target.value)} required minLength={2} />
        </label>
      )}
      <label>
        <span className={labelClass}>{tr("Description", "বিবরণ")}</span>
        <textarea
          className={`${inputClass} h-20 py-2`}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          required
          minLength={5}
        />
        <FieldError message={fe("description")} />
      </label>
      <Toggle checked={form.isAvailable} onChange={(v) => set("isAvailable", v)} label={tr("Show on the menu", "মেনুতে দেখান")} />
    </FormDialog>
  )
}
