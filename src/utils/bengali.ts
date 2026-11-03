/**
 * Central Bengali labels and number formatting.
 *
 * Enum values (days, order status, payment method, role) are the API/database
 * contract and must never be translated in payloads. Map them to Bengali only
 * at display time, using the helpers in this file.
 */

export const DAY_LABELS_BN = {
  SATURDAY: "শনিবার",
  SUNDAY: "রবিবার",
  MONDAY: "সোমবার",
  TUESDAY: "মঙ্গলবার",
  WEDNESDAY: "বুধবার",
  THURSDAY: "বৃহস্পতিবার",
  FRIDAY: "শুক্রবার",
} as const

export const ORDER_STATUS_LABELS_BN = {
  PENDING: "অপেক্ষমান (Pending)",
  CONFIRMED: "নিশ্চিত করা হয়েছে",
  PREPARING: "রান্না চলছে",
  OUT_FOR_DELIVERY: "ডেলিভারির পথে",
  DELIVERED: "ডেলিভারি সম্পন্ন",
  CANCELLED: "বাতিল",
} as const

export const PAYMENT_METHOD_LABELS_BN = {
  COD: "ক্যাশ অন ডেলিভারি",
  BKASH: "বিকাশ (bKash)",
  NAGAD: "নগদ (Nagad)",
} as const

export const ROLE_LABELS_BN = {
  ADMIN: "অ্যাডমিন",
  STAFF: "কিচেন স্টাফ",
  CUSTOMER: "গ্রাহক",
} as const

/** Saved-address tags are stored in English in localStorage and mapped for display. */
export const ADDRESS_LABELS_BN: Record<string, string> = {
  Home: "বাসা",
  Work: "অফিস",
  Other: "অন্যান্য",
  Delivery: "ডেলিভারি",
}

/** Delivery slot values are sent to the API unchanged; these are their display labels. */
const DELIVERY_SLOT_LABELS_BN: Record<string, { full: string; short: string }> = {
  "Lunch 12:30 PM - 2:30 PM": { full: "দুপুর ১২:৩০ - ২:৩০", short: "দুপুর" },
  "Lunch (1:00 PM - 2:00 PM)": { full: "দুপুর ১:০০ - ২:০০", short: "দুপুর" },
  "Dinner 7:30 PM - 9:30 PM": { full: "রাত ৭:৩০ - ৯:৩০", short: "রাত" },
  "Express 45-60 mins": { full: "এক্সপ্রেস ৪৫-৬০ মিনিট", short: "এক্সপ্রেস" },
  "ASAP (45-60 mins)": { full: "যত দ্রুত সম্ভব (৪৫-৬০ মিনিট)", short: "এক্সপ্রেস" },
}

const BENGALI_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"]

/** Converts every ASCII digit in the value to its Bengali numeral. */
export function toBengaliNumber(value: number | string): string {
  return String(value).replace(/[0-9]/g, (digit) => BENGALI_DIGITS[Number(digit)])
}

/** Formats a BDT amount with South Asian digit grouping, e.g. 123456 -> ৳১,২৩,৪৫৬. */
export function formatBdt(amount: number): string {
  return `৳${toBengaliNumber(amount.toLocaleString("en-IN"))}`
}

/** Accepts any casing ("SATURDAY" or "Saturday"); unknown values pass through. */
export function dayLabelBn(day: string | null | undefined): string {
  if (!day) return ""
  return DAY_LABELS_BN[day.toUpperCase() as keyof typeof DAY_LABELS_BN] ?? day
}

/** Compact day label for narrow pills and chart axes, e.g. শনি, বৃহস্পতি. */
export function dayShortBn(day: string | null | undefined): string {
  return dayLabelBn(day).replace(/বার$/, "")
}

export function orderStatusLabelBn(status: string): string {
  return ORDER_STATUS_LABELS_BN[status as keyof typeof ORDER_STATUS_LABELS_BN] ?? status
}

export function paymentMethodLabelBn(method: string): string {
  return PAYMENT_METHOD_LABELS_BN[method as keyof typeof PAYMENT_METHOD_LABELS_BN] ?? method
}

export function roleLabelBn(role: string | null | undefined): string {
  if (!role) return ""
  return ROLE_LABELS_BN[role as keyof typeof ROLE_LABELS_BN] ?? role
}

/** Custom labels, such as a delivery zone name, pass through unchanged. */
export function addressLabelBn(label: string): string {
  return ADDRESS_LABELS_BN[label] ?? label
}

export function deliverySlotLabelBn(slot: string): string {
  return DELIVERY_SLOT_LABELS_BN[slot]?.full ?? slot
}

export function deliverySlotShortBn(slot: string): string {
  return DELIVERY_SLOT_LABELS_BN[slot]?.short ?? slot.split(" ")[0]
}

/** Lets customers typing on a Latin keyboard still find Bengali dish names. */
const SEARCH_ALIASES: Record<string, string> = {
  kacchi: "কাচ্চি",
  kachchi: "কাচ্চি",
  biriyani: "বিরিয়ানি",
  biryani: "বিরিয়ানি",
  tehari: "তেহারি",
  polao: "পোলাও",
  pulao: "পোলাও",
  khichuri: "খিচুড়ি",
  borhani: "বোরহানি",
  firni: "ফিরনি",
  kabab: "কাবাব",
  kebab: "কাবাব",
  roast: "রোস্ট",
  chicken: "চিকেন",
  morog: "মোরগ",
  beef: "বিফ",
  mutton: "মাটন",
  fish: "মাছ",
  egg: "ডিম",
  rice: "ভাত",
  thali: "থালি",
  rezala: "রেজালা",
  jali: "জালি",
}

/** Case-insensitive substring match that also resolves Latin dish words to Bengali. */
export function matchesSearch(text: string | null | undefined, query: string): boolean {
  const cleanQuery = query.trim().toLowerCase()
  if (!cleanQuery) return true
  if (!text) return false

  const cleanText = text.toLowerCase()
  if (cleanText.includes(cleanQuery)) return true

  return cleanQuery.split(/\s+/).every((word) => {
    const alias = SEARCH_ALIASES[word]
    return alias !== undefined && cleanText.includes(alias)
  })
}
