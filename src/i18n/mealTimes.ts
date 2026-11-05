import type { Lang } from "../context/LanguageContext"

/** The two meals customers choose between each day */
export const MEAL_TIMES = ["LUNCH", "DINNER"] as const
type KnownMeal = "BREAKFAST" | "LUNCH" | "DINNER"
export type MealTime = (typeof MEAL_TIMES)[number]

const LABELS: Record<KnownMeal, { en: string; bn: string; short: [string, string] }> = {
  BREAKFAST: { en: "Breakfast", bn: "সকালের নাস্তা", short: ["Breakfast", "সকাল"] },
  LUNCH: { en: "Lunch", bn: "দুপুরের খাবার", short: ["Lunch", "দুপুর"] },
  DINNER: { en: "Dinner", bn: "রাতের খাবার", short: ["Dinner", "রাত"] },
}

const known = (m: string): m is KnownMeal => m === "BREAKFAST" || m === "LUNCH" || m === "DINNER"

/** "LUNCH" -> "Lunch" / "দুপুরের খাবার" */
export const mealTimeLabel = (m: string, lang: Lang) => (known(m) ? LABELS[m][lang] : m)
/** "LUNCH" -> "Lunch" / "দুপুর" (for tabs) */
export const mealTimeShort = (m: string, lang: Lang) => (known(m) ? LABELS[m].short[lang === "bn" ? 1 : 0] : m)
/** English name saved on the order for the kitchen, e.g. "Lunch" */
export const mealTimeSlot = (m: string) => (known(m) ? LABELS[m].en : m)

/**
 * Hours (Bangladesh time) when each meal can be ordered for the same day. Orders for another
 * day are not limited. Keep these the same as MEAL_WINDOWS in the backend (server/utils/mealWindows.ts).
 */
export const MEAL_HOURS: Record<MealTime, { start: number; end: number }> = {
  LUNCH: { start: 12, end: 16 },
  DINNER: { start: 18, end: 22 },
}

/** Takes the hours the owner set in the admin panel (GET /api/meal-hours). Ignores anything odd. */
export function setMealHours(data: unknown) {
  if (!data || typeof data !== "object") return
  for (const m of MEAL_TIMES) {
    const w = (data as Record<string, { startHour?: unknown; endHour?: unknown } | undefined>)[m]
    if (
      w &&
      typeof w.startHour === "number" &&
      typeof w.endHour === "number" &&
      w.startHour >= 0 &&
      w.endHour <= 24 &&
      w.endHour > w.startHour
    ) {
      MEAL_HOURS[m] = { start: w.startHour, end: w.endHour }
    }
  }
}

const DAY_NAMES = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]

/** Day and hour in Bangladesh (UTC+6, no daylight saving), whatever the visitor's own time zone */
export function dhakaClock(date = new Date()): { day: string; hour: number } {
  const local = new Date(date.getTime() + 6 * 60 * 60 * 1000)
  return { day: DAY_NAMES[local.getUTCDay()], hour: local.getUTCHours() + local.getUTCMinutes() / 60 }
}

export const mealIsOpen = (m: MealTime, hour: number) => hour >= MEAL_HOURS[m].start && hour < MEAL_HOURS[m].end

const clock12 = (h: number) => `${h % 12 === 0 ? 12 : h % 12}:00 ${h % 24 < 12 ? "am" : "pm"}`
const BN_DIGITS = "০১২৩৪৫৬৭৮৯"
const bnClock = (h: number) => {
  const x = h % 24
  const period = x === 0 || x >= 20 ? "রাত" : x < 12 ? "সকাল" : x < 16 ? "দুপুর" : x < 18 ? "বিকাল" : "সন্ধ্যা"
  return `${period} ${String(h % 12 === 0 ? 12 : h % 12).replace(/\d/g, (d) => BN_DIGITS[+d])}টা`
}

/** One hour on its own: 16 -> "4:00 pm" / "বিকাল ৪টা" (24 is midnight) */
export const hourLabel = (h: number, lang: Lang) => (lang === "bn" ? bnClock(h) : clock12(h))

/** "12:00 pm to 4:00 pm" / "দুপুর ১২টা থেকে বিকাল ৪টা" */
export const mealHoursLabel = (m: MealTime, lang: Lang) =>
  lang === "bn"
    ? `${bnClock(MEAL_HOURS[m].start)} থেকে ${bnClock(MEAL_HOURS[m].end)}`
    : `${clock12(MEAL_HOURS[m].start)} to ${clock12(MEAL_HOURS[m].end)}`

/** The meal that fits the time right now in Bangladesh: lunch until halfway between the two meals (5 pm), then dinner */
export function mealTimeNow(date = new Date()): MealTime {
  return dhakaClock(date).hour < (MEAL_HOURS.LUNCH.end + MEAL_HOURS.DINNER.start) / 2 ? "LUNCH" : "DINNER"
}
