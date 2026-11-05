import { useCallback, useEffect, useMemo, useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { useLang } from "../../context/LanguageContext"
import { adminFetch, btnPrimary, btnSecondary, taka } from "./adminApi"
import { DishFormDialog, type DishData as Dish, type DishCategory as Category } from "./DishFormDialog"
import { useRefreshOnReturn } from "./useRefreshOnReturn"
import { Empty, ListSkeleton, Notice, PageHeader, Toggle } from "./adminUi"

export function AdminMenu() {
  const { user } = useAuth()
  const { tr } = useLang()
  const isAdmin = user?.role === "ADMIN"
  const [dishes, setDishes] = useState<Dish[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [editing, setEditing] = useState<Dish | "new" | null>(null)

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
  useRefreshOnReturn(load)

  const groups = useMemo(
    () =>
      categories
        .map((c) => ({ ...c, dishes: dishes.filter((d) => d.categoryId === c.id) }))
        .filter((g) => g.dishes.length > 0),
    [categories, dishes],
  )

  const close = useCallback(() => setEditing(null), [])

  const toggle = async (d: Dish, isAvailable: boolean) => {
    setDishes((list) => list.map((x) => (x.id === d.id ? { ...x, isAvailable } : x)))
    try {
      await adminFetch(`/api/admin/menu/${d.id}`, { method: "PATCH", body: JSON.stringify({ isAvailable }) })
      setNotice(
        isAvailable ? tr(`${d.name} is back on the menu`, `${d.name} আবার মেনুতে এসেছে`) : tr(`${d.name} is hidden from the menu`, `${d.name} মেনু থেকে লুকানো হয়েছে`),
      )
    } catch (err) {
      setError((err as Error).message)
      load()
    }
  }

  return (
    <div>
      <PageHeader
        title={tr("Menu", "মেনু")}
        action={
          isAdmin && (
            <button type="button" onClick={() => setEditing("new")} className={btnPrimary}>
              {tr("Add dish", "খাবার যোগ করুন")}
            </button>
          )
        }
      />
      {notice && <Notice kind="ok">{notice}</Notice>}
      {error && <Notice kind="error">{error}</Notice>}

      {loading ? (
        <ListSkeleton />
      ) : groups.length === 0 ? (
        <Empty
          title={tr("No dishes yet", "এখনও কোনো খাবার নেই")}
          hint={isAdmin ? tr("Add your first dish with the button above.", "ওপরের বাটন দিয়ে প্রথম খাবার যোগ করুন।") : undefined}
        />
      ) : (
        <div className="space-y-6">
          {groups.map((g) => (
            <section key={g.id} aria-labelledby={`cat-${g.id}`}>
              <h2 id={`cat-${g.id}`} className="mb-2 text-sm font-medium text-slate">
                {g.name}
              </h2>
              <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
                {g.dishes.map((d) => (
                  <li key={d.id} className="flex items-center gap-3 p-3">
                    <img
                      src={d.imageUrl}
                      alt=""
                      loading="lazy"
                      className={`size-12 shrink-0 rounded-lg bg-cream object-cover ${d.isAvailable ? "" : "opacity-40"}`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className={`truncate font-medium ${d.isAvailable ? "text-charcoal" : "text-slate/70"}`}>{d.name}</p>
                      <p className="text-sm text-slate">{taka(d.basePriceBdt)}</p>
                    </div>
                    <Toggle
                      checked={d.isAvailable}
                      onChange={(v) => toggle(d, v)}
                      label={tr("On menu", "মেনুতে আছে")}
                      compact
                    />
                    <button type="button" onClick={() => setEditing(d)} className={btnSecondary}>
                      {tr("Edit", "এডিট")}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {editing && (
        <DishFormDialog
          dish={editing === "new" ? null : editing}
          categories={categories}
          isAdmin={isAdmin}
          onClose={close}
          onSaved={(_id, name) => {
            setNotice(tr(`${name} saved`, `${name} সেভ হয়েছে`))
            setEditing(null)
            load()
          }}
          onDeleted={(_id, name) => {
            setNotice(tr(`${name} removed`, `${name} মুছে ফেলা হয়েছে`))
            setEditing(null)
            load()
          }}
        />
      )}
    </div>
  )
}
