import { dayLabelBn } from "../utils/bengali"
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
    <nav aria-label="দিন অনুযায়ী মেনু" className="-mx-4 sm:mx-0">
      <div
        role="tablist"
        aria-label="সপ্তাহের দিন অনুযায়ী মেনু নির্বাচন করুন"
        className="no-scrollbar flex snap-x gap-2 overflow-x-auto px-4 py-1 sm:px-0"
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
              className={`text-display h-11 shrink-0 snap-start rounded-full border px-5 text-sm transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D7232B]/25 cursor-pointer ${
                isActive
                  ? "border-[#D7232B] bg-[#D7232B] text-white shadow-[0_6px_16px_-6px_rgba(215,35,43,0.6)]"
                  : "border-line bg-white text-charcoal hover:border-[#D7232B] hover:text-[#D7232B]"
              }`}
            >
              {dayLabelBn(d)}
              {isToday && (
                <span
                  className={`ml-1.5 text-[10px] ${isActive ? "text-saffron" : "text-[#D7232B]"}`}
                >
                  আজ
                </span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
