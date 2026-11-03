import { toBengaliNumber } from "../utils/bengali"
import { useState } from "react"
import { useAddress } from "../context/AddressContext"

type DeliveryZone = {
  id: number
  name: string
  subtitle: string
  time: string
  delivery: string
  active?: boolean
}

const DELIVERY_ZONES: DeliveryZone[] = [
  {
    id: 1,
    name: "ড্যাফোডিল স্মার্ট সিটি",
    subtitle: "ক্যাম্পাস ও হোস্টেল",
    time: "১৫-২০ মিনিট",
    delivery: "ফ্রি ডেলিভারি",
    active: true,
  },
  {
    id: 2,
    name: "খাগান",
    subtitle: "শিক্ষার্থীদের মেস এলাকা",
    time: "১৫-২০ মিনিট",
    delivery: "ফ্রি ডেলিভারি",
  },
  {
    id: 3,
    name: "বিরুলিয়া",
    subtitle: "বাজার ও আশেপাশে",
    time: "২০-২৫ মিনিট",
    delivery: "ফ্রি ডেলিভারি",
  },
  {
    id: 4,
    name: "আশুলিয়া",
    subtitle: "জিরাবো, বাইপাইল",
    time: "৩০-৪০ মিনিট",
    delivery: "ফ্রি ডেলিভারি",
  },
  {
    id: 5,
    name: "সাভার",
    subtitle: "নবীনগর, সাভার বাজার",
    time: "৩৫-৪৫ মিনিট",
    delivery: "ফ্রি ডেলিভারি",
  },
]

type Props = {
  onOrderNow?: () => void
}

export function DeliveryZonesSection({ onOrderNow }: Props) {
  const { setFreeformAddress } = useAddress()
  const [selectedZoneId, setSelectedZoneId] = useState<number>(1)
  const [selectedNotice, setSelectedNotice] = useState<string | null>(null)

  const handleOrderClick = () => {
    if (onOrderNow) {
      onOrderNow()
    } else {
      const menuEl = document.getElementById("menu")
      if (menuEl) {
        menuEl.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }
  }

  const handleSelectZone = (zone: DeliveryZone) => {
    setSelectedZoneId(zone.id)
    setFreeformAddress(`${zone.name}, ${zone.subtitle}`, zone.name)
    setSelectedNotice(`${zone.name} নির্বাচিত (${zone.time} • ${zone.delivery})`)
    setTimeout(() => {
      setSelectedNotice(null)
    }, 3500)
  }

  const handleOpenGoogleMaps = () => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=Daffodil+Smart+City,+Birulia,+Savar`
    window.open(mapsUrl, "_blank", "noopener,noreferrer")
  }

  return (
    <section id="delivery-zones" className="relative w-full overflow-hidden">
      {/* Top Main Section with Rich Red Textured Background */}
      <div className="relative bg-[#E4002B] px-4 pt-12 pb-16 text-white sm:px-6 lg:px-8 lg:pt-16 lg:pb-20">
        {/* Subtle dot matrix pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-15"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1.5px, transparent 1.5px)",
            backgroundSize: "18px 18px",
          }}
          aria-hidden="true"
        />

        {/* Ambient radial glow */}
        <div
          className="pointer-events-none absolute -top-24 -left-24 size-96 rounded-full bg-white/10 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: FIND US + Content */}
          <div className="lg:col-span-7">
            <span className="inline-block text-xs font-bold tracking-[0.2em] text-[#ffc72c] uppercase">
              আমাদের খুঁজে নিন
            </span>

            <h2 className="font-bengali mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-[44px] lg:leading-[1.15]">
              ড্যাফোডিল স্মার্ট সিটির পাশেই
            </h2>

            <p className="mt-2 text-lg font-semibold text-white/95 sm:text-xl">
              সাভারে ডিআইইউর পাশেই আপনার বিরিয়ানির ঠিকানা
            </p>

            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base">
              ক্লাসের ফাঁকে, রাত জেগে পড়ার সময় বা হোস্টেলের আড্ডায়, আমরা গরম বিরিয়ানি পৌঁছে দিই ডিআইইউ ক্যাম্পাস,
              হোস্টেল, মেস এবং বিরুলিয়া, আশুলিয়া ও সাভারের সব জায়গায়।
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3.5 sm:gap-4">
              <button
                type="button"
                onClick={handleOpenGoogleMaps}
                className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#ffc72c] px-6 text-sm font-bold text-gray-950 shadow-md transition hover:bg-[#F5B800] active:scale-95"
              >
                {/* Location Pin Icon */}
                <svg
                  className="size-4 shrink-0 text-gray-950"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>গুগল ম্যাপে দেখুন</span>
              </button>

              <button
                type="button"
                onClick={handleOrderClick}
                className="inline-flex h-12 cursor-pointer items-center justify-center rounded-full border-2 border-white/80 px-7 text-sm font-semibold text-white transition hover:bg-white hover:text-[#E4002B] active:scale-95"
              >
                অর্ডার করুন
              </button>
            </div>
          </div>

          {/* Right Column: Delivery Zones Card */}
          <div className="lg:col-span-5">
            <div className="rounded-[28px] bg-white p-5 shadow-2xl shadow-black/25 sm:p-7">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-4">
                <h3 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                  ডেলিভারি এলাকা
                </h3>
                <span className="font-bengali rounded-full border border-rose-100 bg-rose-50 px-3 py-0.5 text-xs font-semibold text-[#E4002B]">
                  সাভার
                </span>
              </div>

              {/* Delivery Zone Rows */}
              <div className="divide-y divide-gray-100">
                {DELIVERY_ZONES.map((zone) => {
                  const isSelected = selectedZoneId === zone.id
                  return (
                    <button
                      key={zone.id}
                      type="button"
                      onClick={() => handleSelectZone(zone)}
                      className={`group flex w-full cursor-pointer items-center justify-between py-3 text-left transition sm:py-3.5 ${
                        isSelected
                          ? "bg-rose-50/40 -mx-2 rounded-xl px-2 ring-1 ring-rose-200/50"
                          : "hover:bg-gray-50/70 -mx-2 rounded-xl px-2"
                      }`}
                    >
                      {/* Left: Number circle & Zone Names */}
                      <div className="flex items-center gap-3 sm:gap-3.5">
                        <div
                          className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition sm:size-8 sm:text-sm ${
                            zone.id === 1
                              ? "bg-[#E4002B] text-white shadow-sm"
                              : "border border-rose-100 bg-rose-50/70 text-[#E4002B] group-hover:bg-rose-100/70"
                          }`}
                        >
                          {toBengaliNumber(zone.id)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 sm:text-base">
                            {zone.name}
                          </p>
                          <p className="text-xs text-gray-400">{zone.subtitle}</p>
                        </div>
                      </div>

                      {/* Right: Timing badge & Free Delivery */}
                      <div className="text-right">
                        <span className="inline-block rounded-md bg-[#fff7e6] px-2 py-0.5 text-xs font-semibold text-[#b45309]">
                          {zone.time}
                        </span>
                        <p className="mt-0.5 text-xs font-medium text-emerald-600">
                          {zone.delivery}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>

              {selectedNotice && (
                <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-center text-xs font-medium text-emerald-700 animate-fade-in">
                  ✓ {selectedNotice}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Torn Paper / Ripped Edge Ribbon Divider */}
      <div className="relative w-full overflow-hidden bg-[#E4002B] leading-none select-none">
        {/* Layer 1: Top torn jagged edge with white paper */}
        <svg
          className="relative block h-7 w-full sm:h-9 md:h-11 text-white"
          viewBox="0 0 1440 48"
          preserveAspectRatio="none"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M0,0 L0,18 Q30,30 65,16 Q95,2 130,24 Q170,38 205,18 Q240,4 275,22 Q315,36 350,15 Q390,3 425,26 Q465,39 500,16 Q540,2 575,24 Q615,38 650,18 Q690,4 725,25 Q765,39 800,17 Q840,3 875,23 Q915,37 950,16 Q990,4 1025,25 Q1065,38 1100,18 Q1140,5 1175,24 Q1215,37 1250,17 Q1290,4 1325,23 Q1365,36 1400,18 Q1420,10 1440,20 L1440,48 L0,48 Z" />
        </svg>

        {/* Layer 2: Torn middle layer showing ripped cardboard/red underneath */}
        <div className="h-2 w-full bg-white relative">
          <div className="absolute inset-x-0 -top-1 h-2 bg-gradient-to-b from-black/10 to-transparent" />
        </div>

        {/* Layer 3: Bottom torn jagged edge transitioning to light alabaster background */}
        <svg
          className="relative block h-7 w-full sm:h-9 md:h-11 text-white"
          viewBox="0 0 1440 48"
          preserveAspectRatio="none"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M0,0 L1440,0 L1440,20 Q1410,36 1375,18 Q1335,4 1300,24 Q1260,37 1225,16 Q1185,5 1150,25 Q1110,38 1075,17 Q1035,3 1000,23 Q960,37 925,18 Q885,4 850,24 Q810,39 775,17 Q735,3 700,25 Q660,38 625,18 Q585,4 550,24 Q510,39 475,16 Q435,3 400,26 Q360,38 325,15 Q285,4 250,22 Q210,36 175,18 Q140,2 105,24 Q70,30 35,16 Q15,10 0,18 Z" />
        </svg>
      </div>

      {/* Bottom Section: Craving Something Shahi Tonight? Banner */}
      <div className="bg-alabaster px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-5xl">
          <div className="relative flex flex-col items-center justify-between gap-6 rounded-3xl bg-gradient-to-r from-[#ffc72c] via-[#fbb017] to-[#ffc72c] p-6 shadow-xl sm:flex-row sm:rounded-full sm:px-8 sm:py-5 lg:px-10">
            {/* Left text */}
            <div className="text-center sm:text-left">
              <span className="font-bengali block text-xs font-bold text-amber-950/80 sm:text-sm">
                খিদে পেয়েছে?
              </span>
              <h3 className="mt-0.5 text-xl font-extrabold tracking-tight text-gray-950 sm:text-2xl lg:text-3xl">
                আজ রাতে শাহী কিছু খেতে মন চাইছে?
              </h3>
            </div>

            {/* Biriyani Photo & Order Now Button */}
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Circular Biriyani dish photo with white border */}
              <div className="relative size-20 shrink-0 overflow-hidden rounded-full border-4 border-white shadow-xl sm:size-24 md:size-28">
                <img
                  src="https://images.unsplash.com/photo-1589302168068-964664d93dc0?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=400&h=400"
                  alt="সুগন্ধি শাহী বিরিয়ানি"
                  className="size-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Red Order Now pill button */}
              <button
                type="button"
                onClick={handleOrderClick}
                className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full bg-[#E4002B] px-6 text-sm font-bold text-white shadow-lg transition hover:bg-[#b80c14] active:scale-95 sm:h-12 sm:px-8 sm:text-base"
              >
                অর্ডার করুন
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
