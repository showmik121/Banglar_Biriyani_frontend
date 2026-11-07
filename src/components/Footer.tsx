import { TornEdge } from "./TornEdge"
import { PHOTOS } from "../data/photos"
import { useLang } from "../context/LanguageContext"

const SOCIALS = [
  ["Facebook", "ফেসবুক"],
  ["Instagram", "ইনস্টাগ্রাম"],
  ["YouTube", "ইউটিউব"],
] as const

const LINKS = [
  { en: "Our menu", bn: "আমাদের মেনু", href: "#menu" },
  { en: "Daily meals", bn: "দৈনিক মিল", href: "#meal" },
  { en: "How to order", bn: "কীভাবে অর্ডার করবেন", href: "#how" },
  { en: "Delivery area", bn: "ডেলিভারি এলাকা", href: "#location" },
  { en: "Contact", bn: "যোগাযোগ", href: "#contact" },
]

const HOURS = [
  { day: ["Saturday – Thursday", "শনিবার – বৃহস্পতিবার"], time: ["11:00 am – 11:00 pm", "সকাল ১১টা – রাত ১১টা"] },
  { day: ["Friday", "শুক্রবার"], time: ["2:00 pm – 11:00 pm", "দুপুর ২টা – রাত ১১টা"] },
] as const

/** Developer credit links. Leave href empty to hide a link until the profile URL is known. */
const CREDIT_LINKS: { label: string; href: string; fill?: boolean; paths: string[] }[] = [
  {
    label: "WhatsApp",
    href: "https://wa.me/8801828255113",
    paths: ["M3 21l1.6-4.8A8.5 8.5 0 1 1 8 19.5L3 21z", "M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.5-2-1-1 .8c-1-.4-2-1.4-2.4-2.4l.8-1-1-2z"],
  },
  {
    label: "Email",
    href: "mailto:elorislabs444@gmail.com",
    paths: ["M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M3.5 7.5 12 13.5l8.5-6"],
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/19p2Yd2HA6/",
    fill: true,
    paths: ["M13.5 21v-8h2.7l.4-3.2h-3.1V7.9c0-.9.3-1.5 1.6-1.5h1.7V3.5c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H7.3V13h2.8v8z"],
  },
  {
    label: "Instagram",
    href: "", // add the profile link here
    paths: ["M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4z", "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z", "M17.5 6.5h.01"],
  },
  {
    label: "LinkedIn",
    href: "", // add the profile link here
    fill: true,
    paths: ["M4.5 9h3.6v11H4.5z", "M6.3 3.5a2.1 2.1 0 1 1 0 4.2 2.1 2.1 0 0 1 0-4.2z", "M10 9h3.4v1.5c.5-.9 1.7-1.8 3.5-1.8 3.6 0 4.1 2.300 4.1 5.300V20h-3.600v-5.200c0-1.300 0-2.800-1.800-2.800s-2 1.300-2 2.700V20H10z"],
  },
]

export function Footer() {
  const year = new Date().getFullYear()
  const { tr, num } = useLang()

  return (
    <footer
      id="contact"
      className="bg-jali relative mt-16 scroll-mt-[var(--header-h,120px)] text-white"
    >
      <TornEdge side="top" className="text-brand" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Order CTA band */}
        <div className="relative -mt-12 mb-6 flex flex-col items-start justify-between gap-4 rounded-[1.75rem] bg-saffron px-5 py-5 sm:mb-10 sm:gap-6 sm:px-6 sm:py-8 text-charcoal shadow-[0_24px_50px_-24px_rgba(0,0,0,0.6)] ring-4 ring-white sm:flex-row sm:items-center sm:px-10">
          <img
            src={PHOTOS.cta}
            alt={tr("A bowl of biryani", "এক বাটি বিরিয়ানি")}
            loading="lazy"
            className="absolute -top-10 right-6 hidden size-36 rounded-full object-cover shadow-lift ring-[6px] ring-white md:block lg:right-56 lg:size-44"
          />
          <div className="flex items-center gap-4">
            <img
              src={PHOTOS.cta}
              alt=""
              loading="lazy"
              className="size-14 shrink-0 rounded-full object-cover ring-4 ring-white md:hidden"
            />
            <div>
            <p className="font-bn text-base font-semibold text-charcoal/70">খিদে পেয়েছে?</p>
            <p className="text-display mt-1 text-xl sm:mt-2 sm:text-4xl">
              {tr("Craving something shahi tonight?", "আজ রাতে শাহি কিছু খেতে মন চাইছে?")}
            </p>
            </div>
          </div>
          <a
            href="#menu"
            className="inline-flex h-12 shrink-0 items-center rounded-full bg-brand px-8 text-sm font-extrabold text-white transition hover:bg-charcoal"
          >
            {tr("Order Now", "অর্ডার করুন")}
          </a>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-5 pb-6 pt-2 md:grid-cols-[1.4fr_1fr_1fr_1.2fr] md:gap-10 md:pb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3">
              <span className="grid size-12 md:size-16 place-items-center rounded-full bg-alabaster p-1 ring-4 ring-white/30">
                <img src="/logo-mark.png" alt="" className="size-full rounded-full object-contain" />
              </span>
              <div>
                <p className="text-display text-2xl">{tr("Banglar Biriyani", "বাংলার বিরিয়ানি")}</p>
                <p className="font-bn text-sm text-saffron">{tr("বাংলার বিরিয়ানি", "Banglar Biriyani")}</p>
              </div>
            </div>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-white/80 sm:text-sm md:mt-5">
              {tr(
                "Old Dhaka style biriyani, slow-cooked in sealed handi and delivered hot around Daffodil Smart City, Savar.",
                "মুখ বন্ধ হাঁড়িতে ধীরে রান্না পুরান ঢাকার বিরিয়ানি, ড্যাফোডিল স্মার্ট সিটি, সাভারের আশেপাশে গরম গরম ডেলিভারি।",
              )}
            </p>
          </div>

          <div className="col-span-2 md:col-span-1">
            <p className="text-eyebrow text-saffron">{tr("Explore", "ঘুরে দেখুন")}</p>
            <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-0 text-sm text-white/85 md:mt-3 md:block md:space-y-1">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="inline-block py-2 transition hover:text-saffron">
                    {tr(l.en, l.bn)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-eyebrow text-saffron">{tr("Contact", "যোগাযোগ")}</p>
            <ul className="mt-2 space-y-0.5 text-xs text-white/85 sm:text-sm md:mt-3 md:space-y-1">
              <li>
                {tr(
                  "Near Daffodil Smart City, Birulia, Savar, Dhaka-1216",
                  "ড্যাফোডিল স্মার্ট সিটির পাশে, বিরুলিয়া, সাভার, ঢাকা-১২১৬",
                )}
              </li>
              <li>
                <a href="tel:+8809612000000" className="inline-block py-1.5 transition hover:text-saffron">
                  +880 9612-000000
                </a>
              </li>
              <li>
                <a href="mailto:hello@banglarbiriyani.com" className="inline-block py-2 transition hover:text-saffron">
                  hello@banglarbiriyani.com
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-eyebrow text-saffron">{tr("Opening hours", "খোলার সময়")}</p>
            <ul className="mt-2 space-y-2 text-xs sm:text-sm md:mt-4 md:space-y-2.5">
              {HOURS.map((h) => (
                <li key={h.day[0]} className="flex flex-col">
                  <span className="text-white/85">{tr(h.day[0], h.day[1])}</span>
                  <span className="text-white/85">{tr(h.time[0], h.time[1])}</span>
                </li>
              ))}
            </ul>
            <ul className="mt-3 flex flex-wrap gap-2 md:mt-6">
              {SOCIALS.map((s) => (
                <li key={s[0]}>
                  <a
                    href="#"
                    className="inline-flex h-9 items-center rounded-full border border-white/15 px-4 text-xs font-semibold transition hover:border-saffron hover:text-saffron"
                  >
                    {tr(s[0], s[1])}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/20">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-white/70 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>{tr(`© ${year} Banglar Biriyani. All rights reserved.`, `© ${num(year).replace(/,/g, "")} বাংলার বিরিয়ানি। সর্বস্বত্ব সংরক্ষিত।`)}</p>
          <p className="font-bn">ভালোবাসা দিয়ে রান্না, সাভার থেকে</p>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 md:py-4 lg:px-8">
            <div className="flex min-w-0 items-center gap-2.5 md:gap-3.5">
              <span className="grid h-10 w-8 shrink-0 place-items-center overflow-hidden rounded-md bg-[#f9f6f1] p-0.5 md:h-12 md:w-10 md:rounded-lg">
                <img src="/eloris-labs.png" alt="Eloris Labs" width={240} height={282} loading="lazy" className="size-full object-contain" />
              </span>
              <p className="text-[11px] leading-tight text-white/65 md:text-xs">
                {tr("Developed by", "ডেভেলপ করেছে")}
                <span className="text-display block text-sm text-white md:text-base">Eloris Labs</span>
              </p>
            </div>
            <ul className="flex items-center gap-1.5 md:gap-2">
              {CREDIT_LINKS.filter((c) => c.href).map((c) => (
                <li key={c.label}>
                  <a
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    aria-label={c.label}
                    title={c.label}
                    className="inline-flex size-9 items-center justify-center gap-2 rounded-full border border-white/15 text-white/85 transition hover:border-saffron hover:text-saffron md:h-10 md:w-auto md:px-4 md:text-xs md:font-semibold"
                  >
                    <svg viewBox="0 0 24 24" className="size-[18px]" fill={c.fill ? "currentColor" : "none"} stroke={c.fill ? "none" : "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      {c.paths.map((d) => (
                        <path key={d} d={d} />
                      ))}
                    </svg>
                    <span className="hidden lg:inline">{c.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
