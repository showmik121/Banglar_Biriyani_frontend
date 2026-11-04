import type { Lang } from "../context/LanguageContext"

export const MEAL_TIMES = ["BREAKFAST", "LUNCH", "DINNER"] as const
export type MealTime = (typeof MEAL_TIMES)[number]

const LABELS: Record<MealTime, { en: string; bn: string; short: [string, string] }> = {
  BREAKFAST: { en: "Breakfast", bn: "সকালের নাস্তা", short: ["Breakfast", "সকাল"] },
  LUNCH: { en: "Lunch", bn: "দুপুরের খাবার", short: ["Lunch", "দুপুর"] },
  DINNER: { en: "Dinner", bn: "রাতের খাবার", short: ["Dinner", "রাত"] },
}

const known = (m: string): m is MealTime => (MEAL_TIMES as readonly string[]).includes(m)

/** "LUNCH" -> "Lunch" / "দুপুরের খাবার" */
export const mealTimeLabel = (m: string, lang: Lang) => (known(m) ? LABELS[m][lang] : m)
/** "LUNCH" -> "Lunch" / "দুপুর" (for tabs) */
export const mealTimeShort = (m: string, lang: Lang) => (known(m) ? LABELS[m].short[lang === "bn" ? 1 : 0] : m)
/** English name saved on the order for the kitchen, e.g. "Lunch" */
export const mealTimeSlot = (m: string) => (known(m) ? LABELS[m].en : m)

/** The meal that fits the time right now: before 11 breakfast, before 5 pm lunch, then dinner */
export function mealTimeNow(date = new Date()): MealTime {
  const h = date.getHours()
  return h < 11 ? "BREAKFAST" : h < 17 ? "LUNCH" : "DINNER"
}
