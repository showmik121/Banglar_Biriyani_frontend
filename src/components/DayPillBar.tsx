import { useCart } from "../context/CartContext"

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

export function getTodayDay(): Day {
  const dayNames: Day[] = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ]
  return dayNames[new Date().getDay()] || "Saturday"
}

type Props = {
  active?: Day | string
  onChange?: (d: Day) => void
}

export function DayPillBar({ active: propActive, onChange: propOnChange }: Props) {
  const { activeDay, setActiveDay } = useCart()

  const active = propActive ?? activeDay
  const onChange = propOnChange ?? setActiveDay

  const dayNames: Day[] = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ]
  const todayName = dayNames[new Date().getDay()] || "Saturday"

  return (
    <nav aria-label="Menu by day" className="-mx-4 sm:mx-0">
      <div
        role="tablist"
        aria-label="Select day of the week menu"
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
                  ? "border-maroon bg-maroon text-white shadow-[0_8px_18px_-10px_rgba(61,10,16,0.9)]"
                  : "border-line bg-white text-charcoal hover:text-brand sm:bg-transparent sm:hover:bg-cream"
              }`}
            >
              {d}
              {isToday && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    isActive ? "bg-saffron text-maroon" : "bg-gold-light text-gold"
                  }`}
                >
                  Today
                </span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
