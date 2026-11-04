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

const grid =
  "grid grid-cols-1 gap-3 min-[560px]:grid-cols-2 min-[560px]:gap-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-6"

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
    d: "M4 11h16M5 11a7 7 0 0 0 14 0M9 7c0-1 1-1.5 1-2.5M13 7c0-1 1-1.5 1-2.5M3 18h18",
  },
  {
    title: "প্রতিদিন তাজা",
    photo: PHOTOS.promise.fresh,
    body: "Cooked fresh every single day",
    d: "M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z",
  },
  {
    title: "খাঁটি ঘি ও মশলা",
    photo: PHOTOS.promise.spices,
    body: "Aged basmati, pure ghee, whole spices",
    d: "M12 21c-4-2-7-6-7-11 3 0 5 1 7 3 2-2 4-3 7-3 0 5-3 9-7 11ZM12 13V3",
  },
  {
    title: "ফ্রি ডেলিভারি",
    photo: PHOTOS.promise.delivery,
    body: "Free, hot delivery to DIU campus, hostels & Ashulia",
    d: "M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  },
]

function PromiseStrip() {
  return (
    <section aria-label="Our promise" className="bg-jali relative mt-6 text-white">
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
              <p className="mt-1 text-xs leading-relaxed text-white/75 sm:text-sm">{p.body}</p>
            </div>
          </li>
        ))}
      </ul>
      <TornEdge side="bottom" className="text-brand" />
    </section>
  )
}

function AnnouncementBar() {
  return (
    <div className="bg-charcoal text-white">
      <p className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2 text-center text-xs sm:px-6 lg:px-8">
        <span className="font-bn font-semibold text-saffron">গরম গরম বিরিয়ানি</span>
        <span className="text-white/40">•</span>
        <span>
          <span className="hidden sm:inline">Delivering hot around Daffodil Smart City, Savar. </span>
          <span className="font-semibold text-saffron">Order online now</span>
        </span>
      </p>
    </div>
  )
}

const STEPS = [
  { n: "০১", title: "Pick your dish", body: "Browse the menu and add your favourites to the cart." },
  { n: "০২", title: "Place the order", body: "Enter your address and pay cash or online at checkout." },
  { n: "০৩", title: "Enjoy it hot", body: "We pack it straight from the handi and ride it to you." },
]

type ZoneView = { name: string; note: string; time: string }

// Shown until the delivery points set in the admin panel load
const FALLBACK_ZONES: ZoneView[] = [
  { name: "Daffodil Smart City", note: "Campus & hostels", time: "15–20 min" },
  { name: "Khagan", note: "Student mess area", time: "15–20 min" },
  { name: "Birulia", note: "Bazar & around", time: "20–25 min" },
  { name: "Ashulia", note: "Zirabo, Baipail", time: "30–40 min" },
  { name: "Savar", note: "Nabinagar, Savar Bazar", time: "35–45 min" },
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
              time: `${z.etaMinutes.replace("-", "–")} min`,
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
  if (offers.length === 0) return null
  return (
    <section id="offers" aria-label="Current offers" className="mx-auto w-full max-w-7xl scroll-mt-[var(--header-h,120px)] px-4 pt-14 sm:px-6 lg:px-8">
      <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
        {offers.map((o) => (
          <article
            key={o.code}
            className="relative w-[85%] shrink-0 snap-center overflow-hidden rounded-2xl bg-saffron p-5 text-charcoal shadow-card sm:w-auto"
          >
            <span className="absolute -right-6 -top-6 size-24 rounded-full bg-white/25" aria-hidden />
            <p className="text-display text-3xl">
              {o.discountType === "PERCENT" ? `${o.discountValue}% OFF` : `৳${o.discountValue} OFF`}
            </p>
            <p className="mt-1 font-bold">{o.title}</p>
            {o.description && <p className="mt-1 text-sm text-charcoal/75">{o.description}</p>}
            <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm">
              Code <strong className="font-mono tracking-wider text-brand">{o.code}</strong>
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
  return (
    <section id="location" className="bg-jali relative scroll-mt-[var(--header-h,120px)] text-white">
      <TornEdge side="top" className="text-brand" />
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:gap-12 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:px-8 lg:py-24">
        <div>
          <p className="text-eyebrow text-saffron">Find us</p>
          <h2 className="text-display mt-3 text-[2rem] sm:text-5xl">
            ড্যাফোডিল স্মার্ট সিটির পাশেই
          </h2>
          <p className="mt-3 text-lg font-semibold text-white/85">
            Your biriyani spot next to DIU, Savar
          </p>
          <p className="mt-5 max-w-xl leading-relaxed text-white/80">
            Between classes, late-night study sessions or a hostel party, we deliver hot
            biriyani straight to the DIU campus, hostels and messes, and all around Birulia,
            Ashulia and Savar.
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
              Open in Google Maps
            </a>
            <a
              href="#menu"
              className="inline-flex h-12 items-center rounded-full border-2 border-white/70 px-7 text-sm font-bold text-white transition hover:bg-white hover:text-brand"
            >
              Order Now
            </a>
          </div>
        </div>

        <div className="rounded-[1.75rem] bg-white p-5 text-charcoal shadow-[0_30px_60px_-30px_rgba(60,0,4,0.9)] sm:p-7">
          <div className="flex items-center justify-between">
            <p className="text-display text-2xl">Delivery zones</p>
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
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{z.name}</p>
                  <p className="text-sm text-slate">{z.note}</p>
                </div>
                <span className="shrink-0 text-right">
                  <span className="block rounded-full bg-gold-light px-3 py-1 text-xs font-bold text-gold">
                    {z.time}
                  </span>
                  <span className="mt-1 block text-xs font-semibold text-emerald-700">Free delivery</span>
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
  return (
    <section id="how" className="mx-auto w-full max-w-7xl scroll-mt-[var(--header-h,120px)] px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <SectionTitle eyebrow="How to order" bangla="অর্ডার করুন সহজে" title="Three steps to a plate of biriyani" />
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
              <p className="text-display mt-4 text-xl">{s.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate">{s.body}</p>
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

function AboutSection() {
  const points = [
    { title: "Shahi recipes", body: "Old Dhaka nawabi recipes, made the slow way." },
    { title: "Sealed dum handi", body: "Meat and rice layered, sealed and slow-cooked." },
    { title: "Fiery & fragrant", body: "Whole spices, saffron, kewra and pure ghee." },
  ]
  return (
    <section
      id="about"
      className="bg-halftone relative scroll-mt-[var(--header-h,120px)] overflow-hidden"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:gap-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-28">
        <div className="relative mx-auto w-[85%] max-w-md sm:w-full">
          <div className="bg-jali absolute -inset-3 rotate-[-3deg] rounded-[2rem]" />
          <div className="relative overflow-hidden rounded-[1.75rem] ring-8 ring-white shadow-lift">
            <img
              src={PHOTOS.about}
              alt="A plate of biryani with tender meat"
              loading="lazy"
              className="aspect-[6/7] w-full object-cover"
            />
          </div>
          <img
            src={PHOTOS.aboutInset}
            alt="Whole spices used in our biriyani"
            loading="lazy"
            className="absolute -left-4 -top-4 size-20 rounded-full object-cover shadow-lift ring-4 ring-white sm:-left-10 sm:-top-6 sm:size-36 sm:ring-[6px]"
          />
          <div className="absolute -bottom-6 -right-3 rotate-[4deg] rounded-2xl bg-saffron px-4 py-3 text-charcoal shadow-lift sm:-right-8 sm:px-6 sm:py-4">
            <p className="font-calli text-2xl leading-none sm:text-3xl">ভালোবাসায় রান্না</p>
            <p className="text-eyebrow mt-1.5 text-charcoal/70">Cooked with love</p>
          </div>
        </div>

        <div>
          <p className="text-eyebrow text-brand">Our story</p>
          <h2 className="text-display mt-3 text-4xl text-charcoal sm:text-5xl">
            ঐতিহ্যের স্বাদ, <span className="text-brand">প্রতিটি লোকমায়</span>
          </h2>
          <p className="mt-3 text-lg font-semibold text-slate">A royal feast from the nawab's kitchen</p>
          <p className="mt-6 max-w-xl leading-relaxed text-slate">
            Banglar Biriyani brings the rich, spicy biriyani of Puran Dhaka to Savar, right next
            to Daffodil Smart City. Our meat is marinated overnight, layered with fragrant rice
            and cooked slowly in a sealed handi, just the way it has always been made.
          </p>
          <ul className="mt-9 grid gap-4 sm:grid-cols-3">
            {points.map((pt) => (
              <li key={pt.title} className="rounded-2xl border border-line bg-white p-4 shadow-card">
                <span className="mb-3 block h-1 w-8 rounded-full bg-brand" />
                <p className="font-bold text-charcoal">{pt.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate">{pt.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default function App() {
  const currentPath = useCurrentPath()
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
  const [category, setCategory] = useState("All")
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

  // One flat restaurant menu: every unique dish, no day schedule
  const menu: Product[] = useMemo(() => {
    const seen = new Set<number>()
    const items: ApiMenuItem[] = []
    Object.values(menuDays).forEach((dayList) =>
      dayList.forEach((item) => {
        if (seen.has(item.id) || HIDDEN_CATEGORIES.has(item.categorySlug)) return
        if (item.isAvailable === false) return
        seen.add(item.id)
        items.push(item)
      }),
    )
    if (items.length === 0) return INITIAL_MENU

    return items.map((i) => ({
      id: String(i.id),
      name: i.name,
      description: i.description,
      price: i.priceBdt ?? i.basePriceBdt,
      basePriceBdt: i.basePriceBdt,
      image: i.imageUrl,
      bestseller: i.isFeatured,
      portionSize: i.portionSize,
      category: i.categoryName,
    }))
  }, [menuDays])

  const categories = useMemo(() => {
    const list: string[] = []
    menu.forEach((p) => p.category && !list.includes(p.category) && list.push(p.category))
    return ["All", ...list]
  }, [menu])

  const q = query.toLowerCase()
  const filteredMenu = useMemo(
    () =>
      menu.filter(
        (p) =>
          (category === "All" || p.category === category) &&
          (p.name.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)),
      ),
    [menu, q, category],
  )
  const visibleMenu = showAll || q || category !== "All" ? filteredMenu : filteredMenu.slice(0, 8)

  const allSearchableDishes: SearchableDish[] = useMemo(
    () =>
      menu.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        image: p.image,
        bestseller: p.bestseller,
        categoryName: p.category,
      })),
    [menu],
  )

  const handleSelectDish = (dish: SearchableDish) => {
    setQuery(dish.name)
    setCategory("All")
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
      <AnnouncementBar />
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
        image={PHOTOS.hero}
        alt="A plate of fragrant biriyani with tender mutton"
        kicker="ড্যাফোডিল স্মার্ট সিটির পাশেই, সাভার"
        lineOne="দমে রান্না"
        lineTwo="শাহি বিরিয়ানি"
        english="The royal taste of Bengal"
        body="Old Dhaka style shahi biriyani, tehari, jali kabab and ice-cold borhani. Spicy, smoky and cooked the traditional way, delivered hot to DIU campus, hostels and all around Savar."
        primary={{ label: "Order Now", href: "#menu" }}
        secondary={{ label: "View Menu", href: "#menu" }}
        special={{ name: "Shahi Mutton Kacchi", price: 450 }}
      />

      <PromiseStrip />

      <OffersBand offers={storeOffers} />

      <section
        id="menu"
        className="mx-auto w-full max-w-7xl scroll-mt-[calc(var(--header-h,120px)+16px)] px-4 pb-14 pt-16 sm:px-6 sm:pb-16 sm:pt-20 lg:px-8 lg:pb-24 lg:pt-28"
      >
        <SectionTitle
          eyebrow="Our Menu"
          bangla="আমাদের শাহি মেনু"
          title="Straight from the nawab's handi"
          meta={loading ? "Loading..." : `${filteredMenu.length} dishes`}
        />

        {categories.length > 1 && (
          <div
            role="tablist"
            aria-label="Menu categories"
            className="no-scrollbar -mx-4 mb-10 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0"
          >
            {categories.map((c) => {
              const active = c === category
              return (
                <button
                  key={c}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setCategory(c)
                    setShowAll(false)
                  }}
                  className={`h-10 shrink-0 rounded-full border px-5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/25 ${
                    active
                      ? "border-brand bg-brand text-white shadow-[0_8px_18px_-8px_rgba(214,19,30,0.8)]"
                      : "border-line bg-white text-charcoal hover:border-brand/40 hover:text-brand"
                  }`}
                >
                  {c}
                </button>
              )
            })}
          </div>
        )}

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
          <div className="py-14 text-center">
            <p className="text-display text-2xl">No dishes found</p>
            <p className="mt-2 text-slate">Nothing matches "{query}". Try biriyani, tehari or kabab.</p>
            <button
              type="button"
              onClick={() => {
                setQuery("")
                setCategory("All")
              }}
              className="mt-5 inline-flex h-11 items-center rounded-full bg-brand px-6 text-sm font-bold text-white transition hover:bg-brand-hover"
            >
              Show full menu
            </button>
          </div>
        )}
        {!q && category === "All" && filteredMenu.length > 8 && (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAll((s) => !s)}
              aria-expanded={showAll}
              className="inline-flex h-12 items-center gap-2 rounded-full border border-maroon/80 bg-white px-7 text-sm font-bold text-maroon transition hover:bg-maroon hover:text-white"
            >
              {showAll ? "Show fewer dishes" : "See full menu"}
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
      </section>

      <AboutSection />

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
                {totalItems}
              </span>
              <span className="text-sm font-bold">View cart</span>
            </span>
            <span className="flex items-center gap-1.5 text-base font-extrabold">
              ৳{totalBdt}
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
