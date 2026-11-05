import { useEffect, useState } from "react"
import { useLang } from "../../context/LanguageContext"
import { hourLabel } from "../../i18n/mealTimes"
import { adminFetch, btnPrimary } from "./adminApi"
import { Notice } from "./adminUi"

type Meal = "LUNCH" | "DINNER"
type Hours = Record<Meal, { startHour: number; endHour: number }>

const MEALS: Meal[] = ["LUNCH", "DINNER"]
const NAME: Record<Meal, [string, string]> = { LUNCH: ["Lunch", "দুপুরের খাবার"], DINNER: ["Dinner", "রাতের খাবার"] }
const STARTS = Array.from({ length: 24 }, (_, i) => i)
const ENDS = Array.from({ length: 24 }, (_, i) => i + 1)
const selectClass =
  "h-11 w-full rounded-lg border border-line bg-white px-2 text-base text-charcoal outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 disabled:bg-cream sm:text-sm"

/** Order hours for lunch and dinner. The server refuses orders outside them. */
export function MealHoursCard({ isAdmin }: { isAdmin: boolean }) {
  const { tr, lang } = useLang()
  const [hours, setHours] = useState<Hours | null>(null)
  const [saved, setSaved] = useState<Hours | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    adminFetch<Hours>("/api/admin/meal-hours")
      .then((h) => {
        if (!live || !h?.LUNCH || !h?.DINNER) return
        setHours(h)
        setSaved(h)
      })
      .catch((e) => live && setError((e as Error).message))
    return () => {
      live = false
    }
  }, [])

  if (!hours) {
    return error ? (
      <div className="mb-5">
        <Notice kind="error">{error}</Notice>
      </div>
    ) : null
  }

  const set = (m: Meal, key: "startHour" | "endHour", v: number) => {
    setOk(null)
    setHours({ ...hours, [m]: { ...hours[m], [key]: v } })
  }
  const bad = MEALS.find((m) => hours[m].endHour <= hours[m].startHour)
  const changed = JSON.stringify(hours) !== JSON.stringify(saved)

  const save = async () => {
    if (bad) return
    setSaving(true)
    setError(null)
    try {
      const next = await adminFetch<Hours>("/api/admin/meal-hours", { method: "PUT", body: JSON.stringify(hours) })
      setHours(next)
      setSaved(next)
      setOk(tr("Order hours saved", "অর্ডারের সময় সেভ হয়েছে"))
      window.dispatchEvent(new Event("banglar-biriyani:menu-updated"))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section aria-labelledby="meal-hours-h" className="mb-5 rounded-xl border border-line bg-white p-4">
      <h2 id="meal-hours-h" className="font-semibold text-charcoal">
        {tr("Order hours", "অর্ডারের সময়")}
      </h2>
      <p className="mb-3 text-sm text-slate">
        {tr(
          "Customers can order each meal only between these hours.",
          "গ্রাহক শুধু এই সময়ের মধ্যে প্রতিটি বেলার অর্ডার দিতে পারবেন।",
        )}
      </p>
      <div className="space-y-3">
        {MEALS.map((m) => (
          <fieldset key={m} className="grid grid-cols-2 gap-3">
            <legend className="mb-1.5 text-sm font-medium text-charcoal">{tr(NAME[m][0], NAME[m][1])}</legend>
            <label>
              <span className="mb-1 block text-xs text-slate">{tr("From", "শুরু")}</span>
              <select
                className={selectClass}
                value={hours[m].startHour}
                disabled={!isAdmin}
                aria-label={tr(`${NAME[m][0]} starts`, `${NAME[m][1]} শুরু`)}
                onChange={(e) => set(m, "startHour", Number(e.target.value))}
              >
                {STARTS.map((h) => (
                  <option key={h} value={h}>
                    {hourLabel(h, lang)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="mb-1 block text-xs text-slate">{tr("Until", "শেষ")}</span>
              <select
                className={selectClass}
                value={hours[m].endHour}
                disabled={!isAdmin}
                aria-label={tr(`${NAME[m][0]} ends`, `${NAME[m][1]} শেষ`)}
                onChange={(e) => set(m, "endHour", Number(e.target.value))}
              >
                {ENDS.map((h) => (
                  <option key={h} value={h}>
                    {hourLabel(h, lang)}
                  </option>
                ))}
              </select>
            </label>
          </fieldset>
        ))}
      </div>
      {bad && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {tr(
            `${NAME[bad][0]}: the end time must be after the start time.`,
            `${NAME[bad][1]}: শেষের সময় শুরুর পরে হতে হবে।`,
          )}
        </p>
      )}
      {error && <div className="mt-3"><Notice kind="error">{error}</Notice></div>}
      {ok && <div className="mt-3"><Notice kind="ok">{ok}</Notice></div>}
      {isAdmin ? (
        <button type="button" onClick={save} disabled={!changed || !!bad || saving} className={`${btnPrimary} mt-3 h-11 w-full sm:h-10 sm:w-auto`}>
          {saving ? tr("Saving…", "সেভ হচ্ছে…") : tr("Save hours", "সময় সেভ করুন")}
        </button>
      ) : (
        <p className="mt-3 text-xs text-slate">{tr("Only the admin can change these.", "শুধু অ্যাডমিন এটি বদলাতে পারেন।")}</p>
      )}
    </section>
  )
}
