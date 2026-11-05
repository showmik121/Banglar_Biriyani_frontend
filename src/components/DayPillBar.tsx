import { useCart } from "../context/CartContext"
import { useLang } from "../context/LanguageContext"
import { dhakaClock } from "../i18n/mealTimes"

export const DAYS = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
] as const

export type Day = (typeof DAYS)[number]

const DAY_BN: Record<Day, string> = {
  Saturday: "শনিবার",
  Sunday: "রবিবার",
  Monday: "সোমবার",
  Tuesday: "মঙ্গলবার",
  Wednesday: "বুধবার",
  Thursday: "বৃহস্পতিবার",
  Friday: "শুক্রবার",
}
/** "TUESDAY" / "Tuesday" -> "Tuesday" or "মঙ্গলবার" */
export function dayLabel(day: string, lang: "en" | "bn") {
  const d = DAYS.find((x) => x.toLowerCase() === day.toLowerCase())
  if (!d) return day
  return lang === "bn" ? DAY_BN[d] : d
}

/** Today's weekday in Bangladesh time, whatever time zone the visitor's device is set to */
export function getTodayDay(): Day {
  const today = dhakaClock().day // e.g. "THURSDAY"
  return DAYS.find((d) => d.toUpperCase() === today) ?? "Saturday"
}

type Props = {
  active?: Day | string
  onChange?: (d: Day) => void
}

export function DayPillBar({ active: propActive, onChange: propOnChange }: Props) {
  const { activeDay, setActiveDay } = useCart()
  const { lang, tr } = useLang()

  const active = propActive ?? activeDay
  const onChange = propOnChange ?? setActiveDay

  const todayName = getTodayDay()

  return (
    <nav aria-label={tr("Menu by day", "দিন অনুযায়ী মেনু")} className="-mx-4 sm:mx-0">
      <div
        role="tablist"
        aria-label={tr("Choose a day", "দিন বেছে নিন")}
        className="no-scrollbar flex snap-x gap-1 overflow-x-auto px-4 py-1 sm:w-fit sm:rounded-full sm:border sm:border-line sm:bg-white sm:p-1 sm:shadow-card"
      >
        {DAYS.map((d) => {
          const isActive = d.toLowerCase() === String(active).toLowerCase()
          const isToday = d.toLowerCase() === todayName.toLowerCase()
          return (
            <button
              key={d}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-pressed={isActive}
              onClick={() => onChange(d)}
              className={`relative inline-flex h-10 shrink-0 snap-start items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/25 cursor-pointer sm:border-transparent ${
                isActive
                  ? "border-white bg-brand text-white ring-2 ring-white/70 shadow-[0_8px_18px_-10px_rgba(140,10,18,0.9)]"
                  : "border-gold/35 bg-white text-charcoal hover:text-brand sm:border-line sm:bg-transparent sm:hover:bg-cream"
              }`}
            >
              {dayLabel(d, lang)}
              {isToday && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                    isActive ? "bg-saffron text-maroon" : "bg-gold-light text-gold"
                  }`}
                >
                  {tr("Today", "আজ")}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
