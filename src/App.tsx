import { useEffect, useMemo, useState } from "react"
import { Header } from "./components/Header"
import { Hero } from "./components/Hero"
import { TornEdge } from "./components/TornEdge"
import { PHOTOS, PHOTO_IDS } from "./data/photos"
import { Footer } from "./components/Footer"
import { ProductCard, type Product } from "./components/ProductCard"
import { CartDrawer } from "./components/CartDrawer"
import { CheckoutModal } from "./components/CheckoutModal"
import { AddressModal } from "./components/AddressModal"
import { AuthModal } from "./components/AuthModal"
import { MyOrdersDrawer } from "./components/MyOrdersDrawer"
import { AdminPanelModal } from "./components/AdminPanelModal"
import { AdminPortal } from "./components/admin/AdminPortal"
import { useCurrentPath } from "./utils/navigation"
import { type SearchableDish } from "./components/SearchRecommendationPopup"
import { useCart } from "./context/CartContext"
import { useAddress } from "./context/AddressContext"
import { useLang } from "./context/LanguageContext"
import { DayPillBar, dayLabel } from "./components/DayPillBar"
import { categoryName, dishDescription, dishName } from "./i18n/dishes"

const img = (id: string, w = 800, h = 600) =>
  `https://images.unsplash.com/${id}?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=${w}&h=${h}`

/* Fallback Menu: biryani + regular items */
const INITIAL_MENU: Product[] = [
  {
    id: "1",
    category: "Kacchi & Biriyani",
    name: "Shahi Mutton Kacchi",
    description:
      "Slow-cooked mutton layered with aromatic basmati, saffron, potato and fried onions, sealed dum-style.",
    price: 450,
    bestseller: true,
    image: img(PHOTO_IDS.plateRedCloth),
  },
  {
    id: "8",
    category: "Kacchi & Biriyani",
    name: "Special Chicken Tehari",
    description:
      "Fragrant short-grain rice tossed with tender chicken, mustard oil and green chillies.",
    price: 320,
    image: img(PHOTO_IDS.pilafMeat),
  },
  {
    id: "11",
    category: "Kebab & Roast",
    name: "Jali Kabab (2 pcs)",
    description:
      "Crispy egg-laced minced beef patties, pan-fried golden and served with onion salad.",
    price: 100,
    image: img("photo-1603360946369-dc9bb6258143"),
  },
  {
    id: "13",
    category: "Drinks & Desserts",
    name: "Traditional Borhani (500ml)",
    description: "Spiced yoghurt drink with mint and black salt. The perfect biryani partner.",
    price: 80,
    image: img("photo-1692620609860-be6717812f71"),
  },
  {
    id: "2",
    category: "Kacchi & Biriyani",
    name: "Chicken Biryani (Dum Murgh)",
    description:
      "Basmati rice dum-cooked with spiced chicken, boiled egg and a hint of rose water.",
    price: 350,
    image: img(PHOTO_IDS.servingChicken),
  },
  {
    id: "7",
    category: "Kacchi & Biriyani",
    name: "Old Dhaka Beef Tehari",
    description: "Old Dhaka-style tehari with tender beef chunks and aromatic mustard oil.",
    price: 300,
    image: img(PHOTO_IDS.panDum),
  },
  {
    id: "12",
    category: "Kebab & Roast",
    name: "Chicken Roast",
    description: "Rich, mildly sweet wedding-style roast with ghee, yoghurt and fried onion.",
    price: 180,
    image: img("photo-1532636875304-0c89119d9b4d"),
  },
  {
    id: "14",
    category: "Drinks & Desserts",
    name: "Firni Cup",
    description: "Chilled ground-rice pudding with cardamom, pistachio and almond.",
    price: 70,
    image: img("photo-1705174299330-939dd03cc864"),
  },
]

const grid = "grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:gap-6 lg:grid-cols-4"

// Hero slider photos
const HERO_IMAGES = [
  img("photo-1631515243349-e0cb75fb8d3a", 2000, 1100),
  img("photo-1633945274405-b6c8069047b0", 2000, 1100),
  img("photo-1589302168068-964664d93dc0", 2000, 1100),
  img("photo-1563379091339-03b21ab4a4f8", 2000, 1100),
]
const MEAL_IMAGES = [
  img("photo-1589778655375-3e622a9fc91c", 2000, 1000),
  img("photo-1585937421612-70a008356fbe", 2000, 1000),
  img("photo-1546833999-b9f581a1996d", 2000, 1000),
  img("photo-1626777552726-4a6b54c97e46", 2000, 1000),
]

function SectionTitle({
  title,
  meta,
  eyebrow,
  bangla,
  light = false,
}: {
  title: string
  meta?: string
  eyebrow?: string
  bangla?: string
  light?: boolean
}) {
  return (
    <div className="mb-8 flex flex-col items-center text-center sm:mb-10">
      {eyebrow && (
        <p className={`text-eyebrow ${light ? "text-saffron" : "text-brand"}`}>{eyebrow}</p>
      )}
      {bangla && (
        <h2
          className={`text-display mt-3 text-[2rem] sm:text-5xl ${light ? "text-white" : "text-charcoal"}`}
        >
          {bangla}
        </h2>
      )}
      <p className={`mt-2 text-base font-semibold ${light ? "text-white/75" : "text-slate"}`}>
        {title}
      </p>
      <svg
        className={`mt-4 h-3 w-28 ${light ? "text-saffron" : "text-brand"}`}
        viewBox="0 0 120 12"
        fill="none"
        aria-hidden
      >
        <path
          d="M2 8c18-6 38-6 58-2s40 4 58-2"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </svg>
      {meta && <p className="mt-3 text-xs font-semibold text-slate">{meta}</p>}
    </div>
  )
}

const PROMISES = [
  {
    title: "দমে রান্না",
    photo: PHOTOS.promise.dum,
    body: "Sealed handi, slow-cooked for hours",
    bodyBn: "মুখ বন্ধ হাঁড়িতে ঘণ্টার পর ঘণ্টা ধীরে রান্না",
    d: "M4 11h16M5 11a7 7 0 0 0 14 0M9 7c0-1 1-1.5 1-2.5M13 7c0-1 1-1.5 1-2.5M3 18h18",
  },
  {
    title: "প্রতিদিন তাজা",
    photo: PHOTOS.promise.fresh,
    body: "Cooked fresh every single day",
    bodyBn: "প্রতিদিন নতুন করে তাজা রান্না",
    d: "M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z",
  },
  {
    title: "খাঁটি ঘি ও মশলা",
    photo: PHOTOS.promise.spices,
    body: "Aged basmati, pure ghee, whole spices",
    bodyBn: "পুরোনো বাসমতি, খাঁটি ঘি আর আস্ত মসলা",
    d: "M12 21c-4-2-7-6-7-11 3 0 5 1 7 3 2-2 4-3 7-3 0 5-3 9-7 11ZM12 13V3",
  },
  {
    title: "ফ্রি ডেলিভারি",
    photo: PHOTOS.promise.delivery,
    body: "Free, hot delivery to DIU campus, hostels & Ashulia",
    bodyBn: "ডিআইইউ ক্যাম্পাস, হোস্টেল ও আশুলিয়ায় ফ্রি, গরম ডেলিভারি",
    d: "M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  },
]

function PromiseStrip() {
  const { tr } = useLang()
  return (
    <section aria-label={tr("Our promise", "আমাদের প্রতিশ্রুতি")} className="bg-jali relative mt-6 text-white">
      <TornEdge side="top" className="text-brand" />
      <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-x-4 gap-y-8 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8 lg:py-12">
        {PROMISES.map((p) => (
          <li key={p.title} className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <span className="relative shrink-0">
              <img
                src={p.photo}
                alt=""
                loading="lazy"
                className="size-20 rounded-full object-cover ring-4 ring-white/90 shadow-[0_12px_24px_-10px_rgba(60,0,4,0.8)]"
              />
              <span className="absolute -bottom-1 -right-1 grid size-8 place-items-center rounded-full bg-saffron text-charcoal ring-2 ring-brand">
                <svg
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d={p.d} />
                </svg>
              </span>
            </span>
            <div>
              <p className="text-display text-xl">{p.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-white/75 sm:text-sm">{tr(p.body, p.bodyBn)}</p>
            </div>
          </li>
        ))}
      </ul>
      <TornEdge side="bottom" className="text-brand" />
    </section>
  )
}

const STEPS = [
  {
    n: "০১",
    title: ["Pick your dish", "খাবার বেছে নিন"],
    body: ["Browse the menu and add your favourites to the cart.", "মেনু দেখে পছন্দের খাবার কার্টে যোগ করুন।"],
  },
  {
    n: "০২",
    title: ["Place the order", "অর্ডার দিন"],
    body: ["Enter your address and pay cash when it arrives.", "ঠিকানা দিন, খাবার পৌঁছালে ক্যাশে টাকা দিন।"],
  },
  {
    n: "০৩",
    title: ["Enjoy it hot", "গরম গরম খান"],
    body: ["We pack it straight from the handi and ride it to you.", "হাঁড়ি থেকে সরাসরি প্যাক করে আপনার কাছে পৌঁছে দিই।"],
  },
] as const

type ZoneView = { name: string; note: string; time: string } // time = "15-20"

// Shown until the delivery points set in the admin panel load
const FALLBACK_ZONES: ZoneView[] = [
  { name: "Daffodil Smart City", note: "Campus & hostels", time: "15-20" },
  { name: "Khagan", note: "Student mess area", time: "15-20" },
  { name: "Birulia", note: "Bazar & around", time: "20-25" },
  { name: "Ashulia", note: "Zirabo, Baipail", time: "30-40" },
  { name: "Savar", note: "Nabinagar, Savar Bazar", time: "35-45" },
]

type PublicOffer = {
  code: string
  title: string
  description: string
  discountType: "PERCENT" | "FLAT"
  discountValue: number
}

function useStoreData() {
  const [zones, setZones] = useState<ZoneView[]>(FALLBACK_ZONES)
  const [offers, setOffers] = useState<PublicOffer[]>([])
  useEffect(() => {
    fetch("/api/delivery-zones")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        const rows = json?.data
        if (Array.isArray(rows) && rows.length > 0) {
          setZones(
            rows.map((z: { name: string; area: string; etaMinutes: string }) => ({
              name: z.name,
              note: z.area,
              time: z.etaMinutes,
            })),
          )
        }
      })
      .catch(() => {})
    fetch("/api/offers")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => Array.isArray(json?.data) && setOffers(json.data))
      .catch(() => {})
  }, [])
  return { zones, offers }
}

function OffersBand({ offers }: { offers: PublicOffer[] }) {
  const { tr, num, taka } = useLang()
  if (offers.length === 0) return null
  return (
    <section id="offers" aria-label={tr("Current offers", "চলতি অফার")} className="mx-auto w-full max-w-7xl scroll-mt-[var(--header-h,120px)] px-4 pt-14 sm:px-6 lg:px-8">
      <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
        {offers.map((o) => (
          <article
            key={o.code}
            className="relative w-[85%] shrink-0 snap-center overflow-hidden rounded-2xl bg-saffron p-5 text-charcoal shadow-card sm:w-auto"
          >
            <span className="absolute -right-6 -top-6 size-24 rounded-full bg-white/25" aria-hidden />
            <p className="text-display text-3xl">
              {o.discountType === "PERCENT"
                ? tr(`${o.discountValue}% OFF`, `${num(o.discountValue)}% ছাড়`)
                : tr(`৳${o.discountValue} OFF`, `${taka(o.discountValue)} ছাড়`)}
            </p>
            <p className="mt-1 font-bold">{o.title}</p>
            {o.description && <p className="mt-1 text-sm text-charcoal/75">{o.description}</p>}
            <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm">
              {tr("Code", "কোড")} <strong className="font-mono tracking-wider text-brand">{o.code}</strong>
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}

const MAP_URL =
  "https://www.google.com/maps/search/?api=1&query=Daffodil+Smart+City+Birulia+Savar"

function LocationSection({ zones }: { zones: ZoneView[] }) {
  const { tr, num, digits } = useLang()
  return (
    <section id="location" className="bg-jali relative scroll-mt-[var(--header-h,120px)] text-white">
      <TornEdge side="top" className="text-brand" />
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:gap-12 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:px-8 lg:py-24">
        <div>
          <p className="text-eyebrow text-saffron">{tr("Find us", "আমাদের খুঁজুন")}</p>
          <h2 className="text-display mt-3 text-[2rem] sm:text-5xl">
            ড্যাফোডিল স্মার্ট সিটির পাশেই
          </h2>
          <p className="mt-3 text-lg font-semibold text-white/85">
            {tr("Your biriyani spot next to DIU, Savar", "ডিআইইউর পাশে, সাভারে আপনার বিরিয়ানির ঠিকানা")}
          </p>
          <p className="mt-5 max-w-xl leading-relaxed text-white/80">
            {tr(
              "Between classes, late-night study sessions or a hostel party, we deliver hot biriyani straight to the DIU campus, hostels and messes, and all around Birulia, Ashulia and Savar.",
              "ক্লাসের ফাঁকে, রাত জেগে পড়ার সময় বা হোস্টেলের আড্ডায়, ডিআইইউ ক্যাম্পাস, হোস্টেল, মেস আর বিরুলিয়া, আশুলিয়া ও সাভারের সব জায়গায় গরম বিরিয়ানি পৌঁছে দিই।",
            )}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-saffron px-7 text-sm font-extrabold text-charcoal transition hover:bg-white"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                <path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12Zm0-9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
              </svg>
              {tr("Open in Google Maps", "গুগল ম্যাপে দেখুন")}
            </a>
            <a
              href="#menu"
              className="inline-flex h-12 items-center rounded-full border-2 border-white/70 px-7 text-sm font-bold text-white transition hover:bg-white hover:text-brand"
            >
              {tr("Order Now", "অর্ডার করুন")}
            </a>
          </div>
        </div>

        <div className="rounded-[1.75rem] bg-white p-5 text-charcoal shadow-[0_30px_60px_-30px_rgba(60,0,4,0.9)] sm:p-7">
          <div className="flex items-center justify-between">
            <p className="text-display text-2xl">{tr("Delivery zones", "ডেলিভারি এলাকা")}</p>
            <span className="font-bn rounded-full bg-brand-light px-3 py-1 text-sm font-semibold text-brand">
              সাভার
            </span>
          </div>
          <ul className="mt-5 divide-y divide-line">
            {zones.map((z, i) => (
              <li key={z.name} className="flex items-center gap-4 py-3.5">
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-full text-sm font-extrabold ${
                    i === 0 ? "bg-brand text-white" : "bg-cream text-brand"
                  }`}
                >
                  {num(i + 1)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{z.name}</p>
                  <p className="text-sm text-slate">{z.note}</p>
                </div>
                <span className="shrink-0 text-right">
                  <span className="block rounded-full bg-gold-light px-3 py-1 text-xs font-bold text-gold">
                    {tr(`${z.time.replace("-", "–")} min`, `${digits(z.time.replace("-", "–"))} মিনিট`)}
                  </span>
                  <span className="mt-1 block text-xs font-semibold text-emerald-700">{tr("Free delivery", "ফ্রি ডেলিভারি")}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <TornEdge side="bottom" className="text-brand" />
    </section>
  )
}

function OrderProcess() {
  const { tr } = useLang()
  return (
    <section id="how" className="mx-auto w-full max-w-7xl scroll-mt-[var(--header-h,120px)] px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <SectionTitle
        eyebrow={tr("How to order", "কীভাবে অর্ডার করবেন")}
        bangla="অর্ডার করুন সহজে"
        title={tr("Three steps to a plate of biriyani", "তিন ধাপে এক প্লেট বিরিয়ানি")}
      />
      <ol className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0">
        {STEPS.map((s, i) => (
          <li
            key={s.n}
            className="group relative w-[78%] shrink-0 snap-center overflow-hidden rounded-card border border-line bg-white p-3 pb-7 shadow-card sm:w-auto"
          >
            <div className="relative overflow-hidden rounded-[0.9rem]">
              <img
                src={PHOTOS.steps[i]}
                alt=""
                loading="lazy"
                className="aspect-[5/3] w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
            <span className="text-display relative -mt-7 ml-4 grid size-14 place-items-center rounded-full bg-brand text-lg text-white ring-4 ring-white">
              {s.n}
            </span>
            <div className="px-4">
              <p className="text-display mt-4 text-xl">{tr(s.title[0], s.title[1])}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate">{tr(s.body[0], s.body[1])}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

function ProductSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-card border border-line/70 bg-white p-2.5 shadow-card animate-pulse">
      <div className="relative aspect-[4/3] rounded-[0.9rem] bg-cream" />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="h-5 w-3/4 rounded bg-slate/15" />
        <div className="h-4 w-full rounded bg-slate/10" />
        <div className="h-4 w-2/3 rounded bg-slate/10" />
        <div className="mt-auto h-7 w-20 rounded bg-slate/15 pt-1" />
        <div className="mt-1 h-11 w-full rounded-full bg-slate/15" />
      </div>
    </div>
  )
}

type ApiMenuItem = {
  id: number
  categoryId: number
  categoryName: string
  categorySlug: string
  name: string
  description: string
  basePriceBdt: number
  specialPriceBdt?: number | null
  priceBdt?: number
  imageUrl: string
  portionSize: string
  spiceLevel: string
  rating: string
  isEveryday: boolean
  isAvailable: boolean
  isFeatured?: boolean
  remainingPortions?: number
  dailyQuota?: number
  soldCount?: number
}

type MenuByDay = Record<string, ApiMenuItem[]>

const HIDDEN_CATEGORIES = new Set(["home-style-meals"])

export default function App() {
  const currentPath = useCurrentPath()
  const { lang, tr, num, taka } = useLang()
  const isAdmin = currentPath.startsWith("/admin")
  // The admin panel is English only
  useEffect(() => {
    document.documentElement.lang = isAdmin ? "en" : lang
  }, [isAdmin, lang])
  const { zones: storeZones, offers: storeOffers } = useStoreData()
  const {
    totalItems,
    totalBdt,
    addItem,
    activeDay,
    isCartOpen,
    setIsCartOpen,
    isCheckoutOpen,
    setIsCheckoutOpen,
  } = useCart()
  const { isAddressModalOpen, setIsAddressModalOpen } = useAddress()
  const [query, setQuery] = useState("")
  const [showAll, setShowAll] = useState(false)
  const [loading, setLoading] = useState(true)
  const [menuDays, setMenuDays] = useState<MenuByDay>({})
  const [highlightedDishId, setHighlightedDishId] = useState<string | null>(null)

  // Load the menu from the API (falls back to the sample menu when the API is offline)
  useEffect(() => {
    let isMounted = true
    async function loadMenu() {
      try {
        setLoading(true)
        const res = await fetch("/api/menu")
        if (!res.ok) throw new Error(`HTTP error ${res.status}`)
        const json = await res.json()
        const days = json.data?.days || json.days
        if (isMounted && days) setMenuDays(days)
      } catch (err) {
        console.warn("Could not load menu from API, using fallback data:", err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    if (!currentPath.startsWith("/admin")) loadMenu()

    const handleMenuUpdated = () => loadMenu()
    window.addEventListener("banglar-biriyani:menu-updated", handleMenuUpdated)
    return () => {
      isMounted = false
      window.removeEventListener("banglar-biriyani:menu-updated", handleMenuUpdated)
    }
  }, [currentPath])

  const toProduct = (i: ApiMenuItem): Product => ({
    id: String(i.id),
    name: i.name,
    description: i.description,
    price: i.priceBdt ?? i.basePriceBdt,
    basePriceBdt: i.basePriceBdt,
    image: i.imageUrl,
    bestseller: i.isFeatured,
    portionSize: i.portionSize,
    category: i.categoryName,
    remainingPortions: i.remainingPortions,
    dailyQuota: i.dailyQuota,
  })

  // "Our menu": biriyani, tehari, kebab, drinks (every unique dish, home-style meals left out)
  const menu: Product[] = useMemo(() => {
    const seen = new Set<number>()
    const items: ApiMenuItem[] = []
    Object.values(menuDays).forEach((dayList) =>
      dayList.forEach((item) => {
        if (seen.has(item.id) || item.isAvailable === false) return
        if (HIDDEN_CATEGORIES.has(item.categorySlug) && !item.isFeatured) return
        seen.add(item.id)
        items.push(item)
      }),
    )
    return items.length === 0 ? INITIAL_MENU : items.map(toProduct)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuDays])

  // "7-day special meals": everything on the menu for the chosen day
  const dayKey = String(activeDay).toUpperCase()
  const meals: Product[] = useMemo(
    () => (menuDays[dayKey] || []).filter((i) => i.isAvailable !== false).map(toProduct),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [menuDays, dayKey],
  )

  const q = query.toLowerCase()
  const matches = (p: Product) =>
    p.name.toLowerCase().includes(q) ||
    dishName(p.name, "bn").includes(q) ||
    p.category?.toLowerCase().includes(q) ||
    categoryName(p.category ?? "", "bn").includes(q)
  const filteredMenu = useMemo(() => menu.filter(matches), [menu, q]) // eslint-disable-line react-hooks/exhaustive-deps
  const filteredMeals = useMemo(() => meals.filter(matches), [meals, q]) // eslint-disable-line react-hooks/exhaustive-deps
  const visibleMenu = showAll || q ? filteredMenu : filteredMenu.slice(0, 4)

  const allSearchableDishes: SearchableDish[] = useMemo(
    () =>
      [...menu, ...meals.filter((m) => !menu.some((p) => p.id === m.id))].map((p) => ({
        id: p.id,
        name: dishName(p.name, lang),
        description: dishDescription(p.name, p.description, lang),
        price: p.price,
        image: p.image,
        bestseller: p.bestseller,
        categoryName: p.category ? categoryName(p.category, lang) : p.category,
      })),
    [menu, meals, lang],
  )

  const handleSelectDish = (dish: SearchableDish) => {
    setQuery(dish.name)
    setShowAll(true)
    setHighlightedDishId(String(dish.id))
    setTimeout(() => {
      const el = document.getElementById(`dish-${dish.id}`)
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" })
      else document.getElementById("menu")?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 150)
    setTimeout(() => {
      setHighlightedDishId((prev) => (prev === String(dish.id) ? null : prev))
    }, 4000)
  }

  const handleExecuteSearch = (searchQuery: string) => {
    const qStr = searchQuery.trim()
    setQuery(qStr)
    if (!qStr) return
    const lower = qStr.toLowerCase()
    const matchedDish = allSearchableDishes.find(
      (d) =>
        d.name.toLowerCase().includes(lower) ||
        d.description?.toLowerCase().includes(lower) ||
        d.categoryName?.toLowerCase().includes(lower),
    )
    if (matchedDish) {
      handleSelectDish(matchedDish)
    } else {
      setShowAll(true)
      setTimeout(() => {
        document.getElementById("menu")?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 100)
    }
  }

  if (currentPath.startsWith("/admin")) {
    return <AdminPortal />
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        cartCount={totalItems}
        query={query}
        onQuery={setQuery}
        onOpenCart={() => setIsCartOpen(true)}
        dishes={allSearchableDishes}
        onSelectDish={handleSelectDish}
        onExecuteSearch={handleExecuteSearch}
      />

      <Hero
        images={HERO_IMAGES}
        alt={tr("A plate of fragrant biriyani with tender meat", "নরম মাংসের সুগন্ধি বিরিয়ানি")}
        badge={tr("This week only", "শুধু এই সপ্তাহে")}
        title={tr("Authentic Dhakaiya", "খাঁটি ঢাকাইয়া")}
        highlight={tr("biriyani taste", "বিরিয়ানির স্বাদ")}
        subtitle={tr("7-day special menu", "৭ দিনের স্পেশাল মেনু")}
        body={tr(
          "Dum-cooked kacchi, smoky tehari and fresh borhani. A new feast every day, delivered hot to your door.",
          "দমে রান্না করা কাচ্চি, ধোঁয়া ওঠা তেহারি আর তাজা বোরহানি। প্রতিদিন নতুন ভোজ, গরম গরম পৌঁছে যাবে আপনার কাছে।",
        )}
        primary={{ label: tr("Order now", "অর্ডার করুন"), href: "#menu" }}
        secondary={{ label: tr("View menu", "মেনু দেখুন"), href: "#meal" }}
      />

      <PromiseStrip />

      <OffersBand offers={storeOffers} />

      {/* Our menu: biriyani and regular dishes */}
      <section id="menu" className="scroll-mt-[calc(var(--header-h,120px)+16px)]">
        <div className="bg-brand-light/60 px-4 pb-8 pt-10 sm:px-6 sm:pt-12">
          <SectionTitle
            eyebrow={tr("Our Menu", "আমাদের মেনু")}
            bangla="আমাদের শাহি মেনু"
            title={tr("Straight from the nawab's handi", "সরাসরি নবাবি হাঁড়ি থেকে")}
            meta={
              loading
                ? tr("Loading...", "লোড হচ্ছে...")
                : tr(`${filteredMenu.length} dishes`, `${num(filteredMenu.length)}টি খাবার`)
            }
          />
        </div>
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className={grid}>
            {loading
              ? [1, 2, 3, 4].map((n) => <ProductSkeleton key={n} />)
              : visibleMenu.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    isHighlighted={highlightedDishId === String(p.id)}
                    onAdd={(item) => addItem(item, activeDay)}
                  />
                ))}
          </div>
          {!loading && filteredMenu.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-display text-2xl">{tr("No dishes found", "কোনো খাবার পাওয়া যায়নি")}</p>
              <p className="mt-2 text-slate">
                {tr(
                  `Nothing matches "${query}". Try biriyani, tehari or kabab.`,
                  `"${query}" এর সাথে কিছু মেলেনি। বিরিয়ানি, তেহারি বা কাবাব লিখে দেখুন।`,
                )}
              </p>
              <button
                type="button"
                onClick={() => setQuery("")}
                className="mt-5 inline-flex h-11 items-center rounded-full bg-brand px-6 text-sm font-bold text-white transition hover:bg-brand-hover"
              >
                {tr("Show full menu", "পুরো মেনু দেখুন")}
              </button>
            </div>
          )}
          {!q && filteredMenu.length > 4 && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                aria-expanded={showAll}
                className="inline-flex h-12 items-center gap-2 rounded-full border-2 border-charcoal bg-white px-7 text-sm font-bold text-charcoal transition hover:bg-charcoal hover:text-white"
              >
                {showAll ? tr("Show less", "কম দেখুন") : tr("See more", "আরও দেখুন")}
                <svg
                  className={`size-4 transition ${showAll ? "rotate-180" : ""}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  aria-hidden
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </section>

      <Hero
        compact
        as="h2"
        images={MEAL_IMAGES}
        alt={tr("A Bengali thali with rice, curries and sides", "ভাত, তরকারি ও সাইড ডিশসহ বাঙালি থালি")}
        badge={tr("Daily meals", "দৈনিক খাবার")}
        title={tr("Home-style", "ঘরোয়া স্বাদের")}
        highlight={tr("meals", "খাবার")}
        subtitle={tr("Rice, chicken, fish and more", "ভাত, মুরগি, মাছ ও আরও অনেক কিছু")}
        body={tr(
          "Fresh rice and curry every day of the week. Pick your day and order ahead.",
          "সপ্তাহের প্রতিদিন তাজা ভাত-তরকারির আয়োজন। আপনার দিন বেছে নিয়ে আগেই অর্ডার করুন।",
        )}
        primary={{ label: tr("See meals", "মিল দেখুন"), href: "#meal" }}
      />

      {/* 7-day meals with a sticky day picker */}
      <section id="meal" className="scroll-mt-[var(--header-h,120px)]">
        <div className="sticky top-[var(--header-h,120px)] z-30 border-b border-line bg-alabaster/95 py-3 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <DayPillBar />
          </div>
        </div>
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
            <h2 className="text-display text-3xl sm:text-4xl">{tr("7-day special meals", "৭ দিনের স্পেশাল মিল")}</h2>
            <p className="text-sm text-slate">
              {loading
                ? tr("Loading...", "লোড হচ্ছে...")
                : `${dayLabel(String(activeDay), lang)} • ${tr(
                    `${filteredMeals.length} meals`,
                    `${num(filteredMeals.length)}টি মিল`,
                  )}`}
            </p>
          </div>
          <div className={grid}>
            {loading
              ? [1, 2, 3, 4].map((n) => <ProductSkeleton key={n} />)
              : filteredMeals.map((p) => (
                  <ProductCard
                    key={`meal-${p.id}`}
                    product={p}
                    isHighlighted={highlightedDishId === String(p.id)}
                    onAdd={(item) => addItem(item, activeDay)}
                  />
                ))}
          </div>
          {!loading && filteredMeals.length === 0 && (
            <p className="py-12 text-center text-slate">
              {q
                ? tr(`No meals match "${query}" on this day.`, `এই দিনে "${query}" এর সাথে কোনো মিল মেলেনি।`)
                : tr("No meals on this day yet. Try another day.", "এই দিনে এখনো কোনো মিল নেই। অন্য দিন দেখুন।")}
            </p>
          )}
        </div>
      </section>

      <OrderProcess />

      <LocationSection zones={storeZones} />

      <Footer />

      {/* Phone-only cart bar, shown once something is in the cart */}
      {totalItems > 0 && !isCartOpen && !isCheckoutOpen && (
        <div className="fixed inset-x-0 bottom-0 z-30 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="flex h-14 w-full items-center justify-between rounded-2xl bg-brand pl-4 pr-3 text-white shadow-[0_18px_40px_-14px_rgba(140,10,18,0.9)] active:scale-[0.99]"
          >
            <span className="flex items-center gap-3">
              <span className="grid size-8 place-items-center rounded-full bg-saffron text-sm font-extrabold text-charcoal">
                {num(totalItems)}
              </span>
              <span className="text-sm font-bold">{tr("View cart", "কার্ট দেখুন")}</span>
            </span>
            <span className="flex items-center gap-1.5 text-base font-extrabold">
              {taka(totalBdt)}
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
                <path d="M9 6l6 6-6 6" />
              </svg>
            </span>
          </button>
        </div>
      )}
      {totalItems > 0 && <div className="h-20 md:hidden" aria-hidden />}

      <CartDrawer onProceedToCheckout={() => setIsCheckoutOpen(true)} />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
      <AddressModal isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} />
      <AuthModal />
      <MyOrdersDrawer />
      <AdminPanelModal />
    </div>
  )
}
