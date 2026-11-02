import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react"
import { useAuth } from "../../context/AuthContext"
import { ApiError, adminFetch, btnDanger, btnPrimary, btnSecondary, inputClass, labelClass, taka } from "./adminApi"
import { Empty, FieldError, FormDialog, ListSkeleton, Notice, PageHeader, Toggle } from "./adminUi"

interface Dish {
  id: number
  categoryId: number
  name: string
  description: string
  basePriceBdt: number
  imageUrl: string
  isAvailable: boolean
}
interface Category {
  id: number
  name: string
}

const NEW_CATEGORY = "new"

type Form = {
  name: string
  price: string
  imageUrl: string
  description: string
  categoryId: string
  newCategory: string
  isAvailable: boolean
}

export function AdminMenu() {
  const { user } = useAuth()
  const isAdmin = user?.role === "ADMIN"
  const [dishes, setDishes] = useState<Dish[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [editing, setEditing] = useState<Dish | "new" | null>(null)
  const [form, setForm] = useState<Form | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[] | undefined>>({})
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      const data = await adminFetch<{ items: Dish[]; categories: Category[] }>("/api/admin/menu")
      setDishes(data.items)
      setCategories(data.categories)
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

  const groups = useMemo(
    () =>
      categories
        .map((c) => ({ ...c, dishes: dishes.filter((d) => d.categoryId === c.id) }))
        .filter((g) => g.dishes.length > 0),
    [categories, dishes],
  )

  const open = (d: Dish | "new") => {
    setEditing(d)
    setFormError(null)
    setFieldErrors({})
    setForm(
      d === "new"
        ? {
            name: "",
            price: "",
            imageUrl: "",
            description: "",
            categoryId: categories[0] ? String(categories[0].id) : NEW_CATEGORY,
            newCategory: "",
            isAvailable: true,
          }
        : {
            name: d.name,
            price: String(d.basePriceBdt),
            imageUrl: d.imageUrl,
            description: d.description,
            categoryId: String(d.categoryId),
            newCategory: "",
            isAvailable: d.isAvailable,
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
    const base = {
      name: form.name.trim(),
      basePriceBdt: Number(form.price),
      imageUrl: form.imageUrl.trim(),
      description: form.description.trim(),
      isAvailable: form.isAvailable,
    }
    try {
      if (editing === "new") {
        const category =
          form.categoryId === NEW_CATEGORY
            ? { categoryName: form.newCategory.trim() }
            : { categoryId: Number(form.categoryId) }
        await adminFetch("/api/admin/menu", {
          method: "POST",
          body: JSON.stringify({ ...base, ...category, isEveryday: true }),
        })
      } else {
        await adminFetch(`/api/admin/menu/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify({ ...base, categoryId: Number(form.categoryId) }),
        })
      }
      setNotice(`${base.name} saved`)
      setEditing(null)
      load()
    } catch (err) {
      setFieldErrors(err instanceof ApiError ? err.fieldErrors : {})
      setFormError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const toggle = async (d: Dish, isAvailable: boolean) => {
    setDishes((list) => list.map((x) => (x.id === d.id ? { ...x, isAvailable } : x)))
    try {
      await adminFetch(`/api/admin/menu/${d.id}`, { method: "PATCH", body: JSON.stringify({ isAvailable }) })
      setNotice(`${d.name} ${isAvailable ? "is back on the menu" : "is hidden from the menu"}`)
    } catch (err) {
      setError((err as Error).message)
      load()
    }
  }

  const remove = async () => {
    if (!editing || editing === "new") return
    if (!window.confirm(`Delete "${editing.name}"? If it was ever ordered, it will be hidden instead.`)) return
    try {
      await adminFetch(`/api/admin/menu/${editing.id}`, { method: "DELETE" })
      setNotice(`${editing.name} removed`)
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
        title="Menu"
        action={
          isAdmin && (
            <button type="button" onClick={() => open("new")} className={btnPrimary}>
              Add dish
            </button>
          )
        }
      />
      {notice && <Notice kind="ok">{notice}</Notice>}
      {error && <Notice kind="error">{error}</Notice>}

      {loading ? (
        <ListSkeleton />
      ) : groups.length === 0 ? (
        <Empty title="No dishes yet" hint={isAdmin ? "Add your first dish with the button above." : undefined} />
      ) : (
        <div className="space-y-6">
          {groups.map((g) => (
            <section key={g.id} aria-labelledby={`cat-${g.id}`}>
              <h2 id={`cat-${g.id}`} className="mb-2 text-sm font-medium text-slate-500">
                {g.name}
              </h2>
              <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
                {g.dishes.map((d) => (
                  <li key={d.id} className="flex items-center gap-3 p-3">
                    <img
                      src={d.imageUrl}
                      alt=""
                      loading="lazy"
                      className={`size-12 shrink-0 rounded-lg bg-slate-100 object-cover ${d.isAvailable ? "" : "opacity-40"}`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className={`truncate font-medium ${d.isAvailable ? "text-slate-900" : "text-slate-400"}`}>{d.name}</p>
                      <p className="text-sm text-slate-500">{taka(d.basePriceBdt)}</p>
                    </div>
                    <Toggle
                      checked={d.isAvailable}
                      onChange={(v) => toggle(d, v)}
                      label="On menu"
                      compact
                    />
                    <button type="button" onClick={() => open(d)} className={btnSecondary}>
                      Edit
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {editing && form && (
        <FormDialog
          title={editing === "new" ? "Add dish" : `Edit ${editing.name}`}
          onClose={close}
          onSubmit={save}
          saving={saving}
          submitLabel={editing === "new" ? "Add dish" : "Save changes"}
          error={formError}
          footerExtra={
            isAdmin &&
            editing !== "new" && (
              <button type="button" onClick={remove} className={btnDanger}>
                Delete
              </button>
            )
          }
        >
          <div className="flex items-start gap-3">
            <div className="size-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
              {form.imageUrl && <img src={form.imageUrl} alt="Photo preview" className="size-full object-cover" />}
            </div>
            <label className="min-w-0 flex-1">
              <span className={labelClass}>Photo link</span>
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
            <span className={labelClass}>Name</span>
            <input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} required minLength={2} />
            <FieldError message={fe("name")} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className={labelClass}>Price (৳)</span>
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
              <span className={labelClass}>Category</span>
              <select className={inputClass} value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
                {editing === "new" && <option value={NEW_CATEGORY}>New category…</option>}
              </select>
            </label>
          </div>
          {form.categoryId === NEW_CATEGORY && (
            <label>
              <span className={labelClass}>New category name</span>
              <input className={inputClass} value={form.newCategory} onChange={(e) => set("newCategory", e.target.value)} required minLength={2} />
            </label>
          )}
          <label>
            <span className={labelClass}>Description</span>
            <textarea
              className={`${inputClass} h-20 py-2`}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              required
              minLength={5}
            />
            <FieldError message={fe("description")} />
          </label>
          <Toggle checked={form.isAvailable} onChange={(v) => set("isAvailable", v)} label="Show on the menu" />
        </FormDialog>
      )}
    </div>
  )
}
