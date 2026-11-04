import { useCallback, useEffect, useMemo, useState } from "react"
import { adminFetch, btnPrimary, btnSecondary, taka } from "./adminApi"
import { Empty, ListSkeleton, Notice, PageHeader } from "./adminUi"

/** Must match MEALS_PER_DAY on the server */
export const MEALS_PER_DAY = 3

const DAYS = ["SATURDAY", "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"] as const
type Day = (typeof DAYS)[number]
const DAY_NAME: Record<Day, string> = {
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
}
const todayKey = (): Day => {
  const js = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"] as const
  return js[new Date().getDay()]
}

interface Dish {
  id: number
  name: string
  basePriceBdt: number
  imageUrl: string
  isAvailable: boolean
  categoryName: string
}
/** One chosen meal; price, quota and "special" settings are kept as they were */
interface Slot {
  menuItemId: number
  specialPriceBdt: number | null
  dailyQuota: number
  isFeatured: boolean
}
interface ScheduleRow extends Slot {
  dayOfWeek: Day
}

type Week = Record<Day, Slot[]>
const emptyWeek = (): Week => Object.fromEntries(DAYS.map((d) => [d, []])) as unknown as Week

export function AdminMeals() {
  const [catalog, setCatalog] = useState<Dish[]>([])
  const [saved, setSaved] = useState<Week>(emptyWeek)
  const [draft, setDraft] = useState<Week>(emptyWeek)
  const [day, setDay] = useState<Day>(todayKey)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const data = await adminFetch<{ days: Record<Day, ScheduleRow[]>; menuCatalog: Dish[] }>("/api/admin/schedule")
      const week = emptyWeek()
      for (const d of DAYS) {
        week[d] = (data.days[d] || []).map(({ menuItemId, specialPriceBdt, dailyQuota, isFeatured }) => ({
          menuItemId,
          specialPriceBdt,
          dailyQuota,
          isFeatured,
        }))
      }
      setCatalog(data.menuCatalog)
      setSaved(week)
      setDraft(week)
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

  const dishById = useMemo(() => new Map(catalog.map((d) => [d.id, d])), [catalog])
  const slots = draft[day]
  const changed = JSON.stringify(draft[day]) !== JSON.stringify(saved[day])
  const tooMany = slots.length > MEALS_PER_DAY
  const choices = catalog.filter((d) => d.isAvailable && !slots.some((s) => s.menuItemId === d.id))
  const groups = useMemo(() => {
    const map = new Map<string, Dish[]>()
    choices.forEach((d) => map.set(d.categoryName, [...(map.get(d.categoryName) || []), d]))
    return [...map.entries()]
  }, [choices])

  const setSlots = (next: Slot[]) => setDraft((w) => ({ ...w, [day]: next }))
  const add = (id: number) =>
    setSlots([...slots, { menuItemId: id, specialPriceBdt: null, dailyQuota: 100, isFeatured: false }])
  const remove = (id: number) => setSlots(slots.filter((s) => s.menuItemId !== id))
  const move = (i: number, by: -1 | 1) => {
    const next = [...slots]
    const j = i + by
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    setSlots(next)
  }

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      // The first meal is the day's special; it shows first on the site
      const assignments = slots.map((s, i) => ({ ...s, isFeatured: i === 0 }))
      await adminFetch(`/api/admin/schedule/${day}`, { method: "PUT", body: JSON.stringify({ assignments }) })
      setSaved((w) => ({ ...w, [day]: assignments }))
      setDraft((w) => ({ ...w, [day]: assignments }))
      setNotice(`${DAY_NAME[day]} meals saved`)
      window.dispatchEvent(new Event("banglar-biriyani:menu-updated"))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader title="Daily meals" />
      <p className="-mt-3 mb-5 text-sm text-slate">
        Pick {MEALS_PER_DAY} dishes for each day. They show in "7-day special meals" on the website. The first one
        is the day's special.
      </p>
      {notice && <Notice kind="ok">{notice}</Notice>}
      {error && <Notice kind="error">{error}</Notice>}

      {/* Day picker */}
      <div role="tablist" aria-label="Day" className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1">
        {DAYS.map((d) => {
          const count = draft[d].length
          const active = d === day
          const unsaved = JSON.stringify(draft[d]) !== JSON.stringify(saved[d])
          return (
            <button
              key={d}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setDay(d)}
              className={`flex h-12 shrink-0 flex-col items-center justify-center rounded-xl border px-3.5 text-sm font-semibold transition ${
                active ? "border-brand bg-brand text-white" : "border-line bg-white text-charcoal hover:border-brand/40"
              }`}
            >
              <span>
                {DAY_NAME[d].slice(0, 3)}
                {d === todayKey() && <span className={active ? "text-saffron" : "text-brand"}> · today</span>}
              </span>
              <span className={`text-[11px] font-medium ${active ? "text-white/80" : count > MEALS_PER_DAY ? "font-bold text-red-600" : count === MEALS_PER_DAY ? "text-emerald-700" : "text-slate"}`}>
                {count}/{MEALS_PER_DAY}
                {unsaved ? " · not saved" : ""}
              </span>
            </button>
          )
        })}
      </div>

      {loading ? (
        <ListSkeleton />
      ) : catalog.length === 0 ? (
        <Empty title="No dishes yet" hint="Add dishes in the Menu tab first." />
      ) : (
        <section aria-labelledby="meals-day-title" className="rounded-xl border border-line bg-white">
          <h2 id="meals-day-title" className="border-b border-line px-4 py-3 font-semibold text-charcoal">
            {DAY_NAME[day]}
          </h2>
          <ol className="divide-y divide-line">
            {slots.map((s, i) => {
              const dish = dishById.get(s.menuItemId)
              return (
                <li key={s.menuItemId} className="flex items-center gap-3 px-4 py-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-cream text-xs font-bold text-brand">
                    {i + 1}
                  </span>
                  {dish?.imageUrl ? (
                    <img src={dish.imageUrl} alt="" className="size-11 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <span className="size-11 shrink-0 rounded-lg bg-cream" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 font-medium leading-snug text-charcoal">{dish?.name ?? `Dish #${s.menuItemId}`}</p>
                    <p className="text-sm text-slate">
                      {dish ? taka(s.specialPriceBdt ?? dish.basePriceBdt) : ""}
                      {i === 0 && <span className="ml-2 font-semibold text-brand">Day special</span>}
                      {dish && !dish.isAvailable && <span className="ml-2 text-red-600">Hidden from menu</span>}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center">
                    <button
                      type="button"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      aria-label={`Move ${dish?.name ?? "dish"} up`}
                      className="grid size-9 place-items-center rounded-lg text-slate hover:bg-cream disabled:opacity-30"
                    >
                      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                        <path d="m6 15 6-6 6 6" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(s.menuItemId)}
                      aria-label={`Remove ${dish?.name ?? "dish"} from ${DAY_NAME[day]}`}
                      className="grid size-9 place-items-center rounded-lg text-slate hover:bg-red-50 hover:text-red-600"
                    >
                      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                        <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                </li>
              )
            })}

            {slots.length < MEALS_PER_DAY && (
              <li className="px-4 py-3">
                <label htmlFor="meal-add" className="mb-1.5 block text-sm font-medium text-charcoal">
                  Add meal {slots.length + 1} of {MEALS_PER_DAY}
                </label>
                <select
                  id="meal-add"
                  value=""
                  onChange={(e) => e.target.value && add(Number(e.target.value))}
                  className="h-11 w-full rounded-lg border border-line bg-white px-3 text-base text-charcoal outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 sm:text-sm"
                >
                  <option value="">Choose a dish…</option>
                  {groups.map(([cat, dishes]) => (
                    <optgroup key={cat} label={cat}>
                      {dishes.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} · {taka(d.basePriceBdt)}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </li>
            )}
          </ol>

          {tooMany && (
            <p role="alert" className="mx-4 mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              This day has {slots.length} meals. Remove {slots.length - MEALS_PER_DAY} to keep {MEALS_PER_DAY}.
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 border-t border-line px-4 py-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setSlots(saved[day])}
              disabled={!changed || saving}
              className={`${btnSecondary} h-11 sm:h-10`}
            >
              Undo changes
            </button>
            <button
              type="button"
              onClick={save}
              disabled={!changed || saving || tooMany}
              className={`${btnPrimary} h-11 sm:h-10`}
            >
              {saving ? "Saving…" : `Save ${DAY_NAME[day]}`}
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
