import type { Lang } from "../context/LanguageContext"

/**
 * Bangla names for the dishes on the menu, matched by the English name saved in the admin panel.
 * A dish that is not listed here keeps its English name in Bangla mode.
 * To add one: copy a line and change the English name exactly as it is in the admin panel.
 */
const DISHES: Record<string, { name: string; description: string }> = {
  "Saturday Special Shahi Mutton Kacchi": {
    name: "শনিবারের স্পেশাল শাহি মাটন কাচ্চি",
    description: "সুগন্ধি বাসমতি, জাফরান, আলু আর বেরেস্তার স্তরে খাসির মাংস, দমে ধীরে রান্না।",
  },
  "Shahi Mutton Kacchi": {
    name: "শাহি মাটন কাচ্চি",
    description: "সুগন্ধি বাসমতি, জাফরান, আলু আর বেরেস্তার স্তরে খাসির মাংস, দমে ধীরে রান্না।",
  },
  "Chicken Biryani (Dum Murgh)": {
    name: "চিকেন বিরিয়ানি (দম মুরগ)",
    description: "মসলাদার মুরগি, সেদ্ধ ডিম আর হালকা গোলাপজলে দমে রান্না বাসমতি।",
  },
  "Tuesday Special Dhakaiya Morog Polao": {
    name: "মঙ্গলবারের স্পেশাল ঢাকাইয়া মোরগ পোলাও",
    description: "ঘিয়ে রাঁধা চিনিগুঁড়া পোলাওয়ের ওপর ঘন ঝোলে নরম মুরগির রান, পুরান ঢাকার স্টাইলে।",
  },
  "Wednesday Special Dum Biriyani": {
    name: "বুধবারের স্পেশাল দম বিরিয়ানি",
    description: "লম্বা দানার বাসমতি, মসলায় মাখানো মুরগি, বেরেস্তা, পুদিনা আর জাফরান দুধের স্তর।",
  },
  "Biye Bari Chicken Roast & Polao": {
    name: "বিয়েবাড়ির চিকেন রোস্ট ও পোলাও",
    description: "বিয়েবাড়ির স্বাদের চিকেন রোস্ট, সাথে চিনিগুঁড়া পোলাও, বেরেস্তা আর কিশমিশ।",
  },
  "Friday Royal Jummah Kacchi Platter": {
    name: "শুক্রবারের রাজকীয় জুম্মা কাচ্চি প্লেটার",
    description: "খাসির কাচ্চি, আস্ত আলু, সেদ্ধ ডিম, চিকেন রোস্ট আর জালি কাবাব নিয়ে শুক্রবারের ভোজ।",
  },
  "Sunday Special Old Dhaka Beef Tehari": {
    name: "রবিবারের স্পেশাল পুরান ঢাকার বিফ তেহারি",
    description: "সরিষার তেলে চিনিগুঁড়া চালে রাঁধা নরম গরুর মাংসের পুরান ঢাকার তেহারি।",
  },
  "Old Dhaka Beef Tehari": {
    name: "পুরান ঢাকার বিফ তেহারি",
    description: "সরিষার তেলে রাঁধা নরম গরুর মাংসের পুরান ঢাকার তেহারি।",
  },
  "Special Chicken Tehari": {
    name: "স্পেশাল চিকেন তেহারি",
    description: "ছোট দানার সুগন্ধি চালে নরম মুরগি, সরিষার তেল, কাঁচা মরিচ আর বেরেস্তা।",
  },
  "Monday Special Beef Bhuna Khichuri": {
    name: "সোমবারের স্পেশাল বিফ ভুনা খিচুড়ি",
    description: "চিনিগুঁড়া চাল আর ভাজা মুগ ডালের খিচুড়ি, সাথে ধীরে রাঁধা নরম গরুর রেজালা।",
  },
  "Thursday Special Najirshail Mutton Tehari": {
    name: "বৃহস্পতিবারের স্পেশাল নাজিরশাইল মাটন তেহারি",
    description: "সরিষার তেলে পুরোনো নাজিরশাইল চালে রাঁধা হাড়সহ রসালো খাসির মাংস।",
  },
  "Jali Kebab (2 pcs)": {
    name: "জালি কাবাব (২ পিস)",
    description: "ডিমের জালিতে মোড়া গরুর কিমার মচমচে কাবাব, সাথে পেঁয়াজের সালাদ।",
  },
  "Jali Kabab (2 pcs)": {
    name: "জালি কাবাব (২ পিস)",
    description: "ডিমের জালিতে মোড়া গরুর কিমার মচমচে কাবাব, সাথে পেঁয়াজের সালাদ।",
  },
  "Biye Bari Chicken Roast": {
    name: "বিয়েবাড়ির চিকেন রোস্ট",
    description: "ঘি, দই আর বেরেস্তায় রাঁধা হালকা মিষ্টি বিয়েবাড়ির রোস্ট।",
  },
  "Chicken Roast": {
    name: "চিকেন রোস্ট",
    description: "ঘি, দই আর বেরেস্তায় রাঁধা হালকা মিষ্টি বিয়েবাড়ির রোস্ট।",
  },
  "Shahi Borhani (500ml)": {
    name: "শাহি বোরহানি (৫০০ মিলি)",
    description: "পুদিনা, ধনেপাতা, সরিষা আর বিট লবণের মসলাদার দইয়ের পানীয়। বিরিয়ানির সেরা সঙ্গী।",
  },
  "Traditional Borhani (500ml)": {
    name: "ঐতিহ্যবাহী বোরহানি (৫০০ মিলি)",
    description: "পুদিনা আর বিট লবণের মসলাদার দইয়ের পানীয়। বিরিয়ানির সেরা সঙ্গী।",
  },
  "Zafrani Firni Cup": {
    name: "জাফরানি ফিরনি কাপ",
    description: "এলাচ, জাফরান, পেস্তা আর বাদাম দেওয়া ঠান্ডা চালের ফিরনি।",
  },
  "Firni Cup": {
    name: "ফিরনি কাপ",
    description: "এলাচ, পেস্তা আর বাদাম দেওয়া ঠান্ডা চালের ফিরনি।",
  },
}

const CATEGORIES: Record<string, string> = {
  All: "সব",
  "Signature Biriyani": "সিগনেচার বিরিয়ানি",
  "Tehari & Khichuri": "তেহারি ও খিচুড়ি",
  "Kebabs & Sides": "কাবাব ও সাইড",
  "Beverages & Desserts": "পানীয় ও ডেজার্ট",
  "Kacchi & Biriyani": "কাচ্চি ও বিরিয়ানি",
  "Kebab & Roast": "কাবাব ও রোস্ট",
  "Drinks & Desserts": "পানীয় ও ডেজার্ট",
  "Home-Style Meals": "ঘরোয়া খাবার",
}

export const dishName = (name: string, lang: Lang) => (lang === "bn" && DISHES[name]?.name) || name
export const dishDescription = (name: string, description: string, lang: Lang) =>
  (lang === "bn" && DISHES[name]?.description) || description
export const categoryName = (name: string, lang: Lang) => (lang === "bn" && CATEGORIES[name]) || name

const PORTIONS: Record<string, string> = {
  "1:1 Regular": "১:১ রেগুলার",
  "1:1 Grand Platter": "১:১ গ্র্যান্ড প্লেটার",
  "2 Pieces": "২ পিস",
  "1 Leg Quarter": "১টি লেগ পিস",
  "500 ml Bottle": "৫০০ মিলি বোতল",
  "1 Clay Cup (150g)": "১টি মাটির কাপ (১৫০ গ্রাম)",
  "1 Platter": "১টি প্লেটার",
}
export const portionName = (p: string, lang: Lang) => (lang === "bn" && PORTIONS[p]) || p

/** Saved address labels (Home, Work, Other, Delivery) */
const ADDRESS_LABELS: Record<string, string> = { Home: "বাসা", Work: "কাজের জায়গা", Other: "অন্যান্য", Delivery: "ডেলিভারি" }
export const addressLabel = (label: string, lang: Lang) => (lang === "bn" && ADDRESS_LABELS[label]) || label
