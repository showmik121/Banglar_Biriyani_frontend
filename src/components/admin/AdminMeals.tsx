import { useCallback, useEffect, useMemo, useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { useLang } from "../../context/LanguageContext"
import { adminFetch, btnPrimary, btnSecondary, dg, taka } from "./adminApi"
import { Empty, ListSkeleton, Notice, PageHeader } from "./adminUi"
import { DishFormDialog, type DishCategory, type DishData } from "./DishFormDialog"
import { MealHoursCard } from "./MealHoursCard"

/** Must match MAX_ITEMS_PER_MEAL on the server */
export const MAX_ITEMS_PER_MEAL = 12

const DAYS = ["SATURDAY", "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"] as const
type Day = (typeof DAYS)[number]
// [English, Bangla]
const DAY_NAME: Record<Day, [string, string]> = {
  SATURDAY: ["Saturday", "শনিবার"],
  SUNDAY: ["Sunday", "রবিবার"],
  MONDAY: ["Monday", "সোমবার"],
  TUESDAY: ["Tuesday", "মঙ্গলবার"],
  WEDNESDAY: ["Wednesday", "বুধবার"],
  THURSDAY: ["Thursday", "বৃহস্পতিবার"],
  FRIDAY: ["Friday", "শুক্রবার"],
}
const DAY_SHORT: Record<Day, [string, string]> = {
  SATURDAY: ["Sat", "শনি"],
  SUNDAY: ["Sun", "রবি"],
  MONDAY: ["Mon", "সোম"],
  TUESDAY: ["Tue", "মঙ্গল"],
  WEDNESDAY: ["Wed", "বুধ"],
  THURSDAY: ["Thu", "বৃহ"],
  FRIDAY: ["Fri", "শুক্র"],
}
const MEALS = ["LUNCH", "DINNER"] as const
type Meal = (typeof MEALS)[number]
const MEAL_NAME: Record<Meal, [string, string]> = { LUNCH: ["Lunch", "দুপুরের খাবার"], DINNER: ["Dinner", "রাতের খাবার"] }

const todayKey = (): Day => {
  const js = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"] as const
  return js[new Date().getDay()]
}

interface Dish extends DishData {
  categoryName: string
}
/** One dish in one meal; price, quota and "special" settings are kept as they were */
interface Slot {
  menuItemId: number
  mealTime: Meal
  specialPriceBdt: number | null
  dailyQuota: number
  isFeatured: boolean
}
interface ScheduleRow extends Omit<Slot, "mealTime"> {
  mealTime?: string
}

type Week = Record<Day, Slot[]>
const emptyWeek = (): Week => Object.fromEntries(DAYS.map((d) => [d, []])) as unknown as Week
const asMeal = (m?: string): Meal => (MEALS as readonly string[]).includes(m ?? "") ? (m as Meal) : "LUNCH"
const same = (a: Slot[], b: Slot[]) => JSON.stringify(a) === JSON.stringify(b)

export function AdminMeals() {
  const { tr } = useLang()
  const { user } = useAuth()
  const isAdmin = user?.role === "ADMIN"
  const dayName = (d: Day) => tr(DAY_NAME[d][0], DAY_NAME[d][1])
  const mealName = (m: Meal) => tr(MEAL_NAME[m][0], MEAL_NAME[m][1])
  const [catalog, setCatalog] = useState<Dish[]>([])
  const [categories, setCategories] = useState<DishCategory[]>([])
  const [dialog, setDialog] = useState<{ dish: Dish | null; meal: Meal } | null>(null)
  const [saved, setSaved] = useState<Week>(emptyWeek)
  const [draft, setDraft] = useState<Week>(emptyWeek)
  const [day, setDay] = useState<Day>(todayKey)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const data = await adminFetch<{ days: Record<Day, ScheduleRow[]>; menuCatalog: Dish[]; categories?: DishCategory[] }>("/api/admin/schedule")
      const week = emptyWeek()
      for (const d of DAYS) {
        week[d] = (data.days[d] || []).map(({ menuItemId, specialPriceBdt, dailyQuota, isFeatured, mealTime }) => ({
          menuItemId,
          mealTime: asMeal(mealTime),
          specialPriceBdt,
          dailyQuota,
          isFeatured,
        }))
      }
      setCatalog(data.menuCatalog)
      setCategories(data.categories ?? [])
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

  /** Reload only the dish list, so unsaved changes to the day's meals are kept */
  const refreshCatalog = useCallback(async () => {
    const data = await adminFetch<{ menuCatalog: Dish[]; categories?: DishCategory[] }>("/api/admin/schedule")
    setCatalog(data.menuCatalog)
    setCategories(data.categories ?? [])
  }, [])

  const dishById = useMemo(() => new Map(catalog.map((d) => [d.id, d])), [catalog])
  const slots = draft[day]
  const changed = !same(draft[day], saved[day])

  const setSlots = (next: Slot[]) => setDraft((w) => ({ ...w, [day]: next }))
  const mealSlots = (m: Meal) => slots.filter((s) => s.mealTime === m)
  const replaceMeal = (m: Meal, next: Slot[]) => setSlots([...slots.filter((s) => s.mealTime !== m), ...next])

  const add = (m: Meal, id: number) =>
    replaceMeal(m, [...mealSlots(m), { menuItemId: id, mealTime: m, specialPriceBdt: null, dailyQuota: 100, isFeatured: false }])
  const remove = (m: Meal, id: number) => replaceMeal(m, mealSlots(m).filter((s) => s.menuItemId !== id))
  const moveUp = (m: Meal, i: number) => {
    const list = [...mealSlots(m)]
    if (i <= 0) return
    ;[list[i - 1], list[i]] = [list[i], list[i - 1]]
    replaceMeal(m, list)
  }

  const dishSaved = async (id: number, name: string, isNew: boolean) => {
    const meal = dialog?.meal ?? "LUNCH"
    setDialog(null)
    try {
      await refreshCatalog()
    } catch (e) {
      setError((e as Error).message)
    }
    window.dispatchEvent(new Event("banglar-biriyani:menu-updated"))
    if (isNew) {
      if (mealSlots(meal).length < MAX_ITEMS_PER_MEAL) add(meal, id)
      setNotice(
        tr(
          `${name} created and added to ${MEAL_NAME[meal][0].toLowerCase()}. Press Save to publish it.`,
          `${name} তৈরি হয়েছে এবং ${MEAL_NAME[meal][1]}-এ যোগ হয়েছে। চালু করতে সেভ চাপুন।`,
        ),
      )
    } else {
      setNotice(tr(`${name} updated`, `${name} আপডেট হয়েছে`))
    }
  }
  const dishDeleted = async (id: number, name: string) => {
    setDialog(null)
    const strip = (w: Week) => Object.fromEntries(DAYS.map((d) => [d, w[d].filter((s) => s.menuItemId !== id)])) as unknown as Week
    setSaved(strip)
    setDraft(strip)
    try {
      await refreshCatalog()
    } catch (e) {
      setError((e as Error).message)
    }
    window.dispatchEvent(new Event("banglar-biriyani:menu-updated"))
    setNotice(tr(`${name} removed`, `${name} মুছে ফেলা হয়েছে`))
  }

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      // Saved in meal order; the first dish of each meal is that meal's special
      const assignments = MEALS.flatMap((m) => mealSlots(m).map((s, i) => ({ ...s, isFeatured: i === 0 })))
      await adminFetch(`/api/admin/schedule/${day}`, { method: "PUT", body: JSON.stringify({ assignments }) })
      setSaved((w) => ({ ...w, [day]: assignments }))
      setDraft((w) => ({ ...w, [day]: assignments }))
      setNotice(tr(`${DAY_NAME[day][0]} meals saved`, `${DAY_NAME[day][1]}-এর মিল সেভ হয়েছে`))
      window.dispatchEvent(new Event("banglar-biriyani:menu-updated"))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader title={tr("Daily meals", "দৈনিক মিল")} />
      <p className="-mt-3 mb-5 text-sm text-slate">
        {tr(
          `Set lunch and dinner for each day (up to ${MAX_ITEMS_PER_MEAL} dishes each). They show in "7-day special meals" on the website. The first dish of each meal is its special.`,
          `প্রতিদিনের দুপুর ও রাতের খাবার ঠিক করুন (প্রতিবেলায় সর্বোচ্চ ${dg(MAX_ITEMS_PER_MEAL)}টি)। এগুলো ওয়েবসাইটের "৭ দিনের স্পেশাল মিল"-এ দেখায়। প্রতি বেলার প্রথম খাবারটি স্পেশাল।`,
        )}
      </p>
      {notice && <Notice kind="ok">{notice}</Notice>}
      {error && <Notice kind="error">{error}</Notice>}

      <MealHoursCard isAdmin={isAdmin} />

      {/* Day picker */}
      <div role="tablist" aria-label={tr("Day", "দিন")} className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1">
        {DAYS.map((d) => {
          const active = d === day
          const unsaved = !same(draft[d], saved[d])
          const counts = MEALS.map((m) => draft[d].filter((s) => s.mealTime === m).length)
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
                {tr(DAY_SHORT[d][0], DAY_SHORT[d][1])}
                {d === todayKey() && <span className={active ? "text-saffron" : "text-brand"}> · {tr("today", "আজ")}</span>}
              </span>
              <span className={`text-xs font-medium ${active ? "text-white/80" : "text-slate"}`}>
                {counts.map((c) => dg(c)).join(" · ")}
                {unsaved ? ` · ${tr("not saved", "সেভ হয়নি")}` : ""}
              </span>
            </button>
          )
        })}
      </div>

      {loading ? (
        <ListSkeleton />
      ) : catalog.length === 0 ? (
        <Empty title={tr("No dishes yet", "এখনও কোনো খাবার নেই")} hint={tr("Add dishes in the Menu tab first.", "আগে মেনু ট্যাবে খাবার যোগ করুন।")} />
      ) : (
        <div className="space-y-4">
          <h2 className="font-semibold text-charcoal">{dayName(day)}</h2>

          {MEALS.map((m) => {
            const list = mealSlots(m)
            const choices = catalog.filter((d) => d.isAvailable && !list.some((s) => s.menuItemId === d.id))
            const groups = new Map<string, Dish[]>()
            choices.forEach((d) => groups.set(d.categoryName, [...(groups.get(d.categoryName) || []), d]))
            const selectId = `meal-add-${m}`
            return (
              <section key={m} aria-labelledby={`meal-${m}`} className="rounded-xl border border-line bg-white">
                <div className="flex items-center justify-between border-b border-line px-4 py-3">
                  <h3 id={`meal-${m}`} className="font-semibold text-charcoal">
                    {mealName(m)}
                  </h3>
                  <span className="text-xs text-slate">
                    {dg(list.length)}/{dg(MAX_ITEMS_PER_MEAL)}
                  </span>
                </div>
                <ol className="divide-y divide-line">
                  {list.map((s, i) => {
                    const dish = dishById.get(s.menuItemId)
                    const name = dish?.name ?? tr(`Dish #${s.menuItemId}`, `খাবার #${dg(s.menuItemId)}`)
                    return (
                      <li key={s.menuItemId} className="flex items-center gap-3 px-4 py-2.5">
                        {dish?.imageUrl ? (
                          <img src={dish.imageUrl} alt="" className="size-10 shrink-0 rounded-lg object-cover" />
                        ) : (
                          <span className="size-10 shrink-0 rounded-lg bg-cream" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-medium leading-snug text-charcoal">{name}</p>
                          <p className="text-xs text-slate">
                            {dish ? taka(s.specialPriceBdt ?? dish.basePriceBdt) : ""}
                            {i === 0 && <span className="ml-2 font-semibold text-brand">{tr("Special", "স্পেশাল")}</span>}
                            {dish && !dish.isAvailable && <span className="ml-2 text-red-600">{tr("Hidden from menu", "মেনু থেকে লুকানো")}</span>}
                          </p>
                        </div>
                        {dish && (
                          <button
                            type="button"
                            onClick={() => setDialog({ dish, meal: m })}
                            aria-label={tr(`Edit ${name}`, `${name} এডিট করুন`)}
                            className="grid size-9 shrink-0 place-items-center rounded-lg text-slate hover:bg-cream"
                          >
                            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                              <path d="M4 20h4L19 9l-4-4L4 16v4Z" strokeLinejoin="round" />
                            </svg>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => moveUp(m, i)}
                          disabled={i === 0}
                          aria-label={tr(`Move ${name} up in ${MEAL_NAME[m][0].toLowerCase()}`, `${mealName(m)}-এ ${name} ওপরে তুলুন`)}
                          className="grid size-9 shrink-0 place-items-center rounded-lg text-slate hover:bg-cream disabled:opacity-30"
                        >
                          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                            <path d="m6 15 6-6 6 6" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(m, s.menuItemId)}
                          aria-label={tr(`Remove ${name} from ${MEAL_NAME[m][0].toLowerCase()}`, `${mealName(m)} থেকে ${name} সরান`)}
                          className="grid size-9 shrink-0 place-items-center rounded-lg text-slate hover:bg-red-50 hover:text-red-600"
                        >
                          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                            <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
                          </svg>
                        </button>
                      </li>
                    )
                  })}
                  {list.length === 0 && <li className="px-4 py-3 text-sm text-slate">{tr(`No ${MEAL_NAME[m][0].toLowerCase()} yet.`, `${mealName(m)} এখনও ঠিক করা হয়নি।`)}</li>}
                  {list.length < MAX_ITEMS_PER_MEAL && (
                    <li className="px-4 py-3">
                      <label htmlFor={selectId} className="sr-only">
                        {tr(`Add a dish to ${MEAL_NAME[m][0].toLowerCase()}`, `${mealName(m)}-এ খাবার যোগ করুন`)}
                      </label>
                      <select
                        id={selectId}
                        value=""
                        onChange={(e) => e.target.value && add(m, Number(e.target.value))}
                        className="h-11 w-full rounded-lg border border-line bg-white px-3 text-base text-charcoal outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 sm:text-sm"
                      >
                        <option value="">{tr(`+ Add a dish to ${MEAL_NAME[m][0].toLowerCase()}…`, `+ ${mealName(m)}-এ খাবার যোগ করুন…`)}</option>
                        {[...groups.entries()].map(([cat, dishes]) => (
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
                  {list.length < MAX_ITEMS_PER_MEAL && isAdmin && (
                    <li className="px-4 pb-3">
                      <button type="button" onClick={() => setDialog({ dish: null, meal: m })} className={`${btnSecondary} h-11 w-full sm:h-10`}>
                        {tr(`+ Create a new ${MEAL_NAME[m][0].toLowerCase()} dish (with photo)`, `+ নতুন খাবার বানান (ছবিসহ)`)}
                      </button>
                    </li>
                  )}
                </ol>
              </section>
            )
          })}

          <div
            className={`flex flex-col-reverse gap-2 sm:flex-row sm:justify-end ${
              changed ? "sticky bottom-16 -mx-4 border-t border-line bg-alabaster/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0" : ""
            }`}
          >
            <button
              type="button"
              onClick={() => setSlots(saved[day])}
              disabled={!changed || saving}
              className={`${btnSecondary} h-11 sm:h-10`}
            >
              {tr("Undo changes", "পরিবর্তন বাতিল")}
            </button>
            <button type="button" onClick={save} disabled={!changed || saving} className={`${btnPrimary} h-11 sm:h-10`}>
              {saving ? tr("Saving…", "সেভ হচ্ছে…") : tr(`Save ${DAY_NAME[day][0]}`, `${DAY_NAME[day][1]} সেভ করুন`)}
            </button>
          </div>
        </div>
      )}

      {dialog && (
        <DishFormDialog
          dish={dialog.dish}
          categories={categories}
          isAdmin={isAdmin}
          isEveryday={false}
          onClose={() => setDialog(null)}
          onSaved={dishSaved}
          onDeleted={dishDeleted}
        />
      )}
    </div>
  )
}
