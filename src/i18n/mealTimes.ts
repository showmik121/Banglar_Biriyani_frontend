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

/** The meal that fits the time right now: before 5 pm lunch, then dinner */
export function mealTimeNow(date = new Date()): MealTime {
  const h = date.getHours()
  return h < 17 ? "LUNCH" : "DINNER"
}
