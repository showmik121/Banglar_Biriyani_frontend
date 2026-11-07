import { TornEdge } from "./TornEdge"
import { PHOTOS } from "../data/photos"
import { useLang } from "../context/LanguageContext"

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

type Ico = { label: string; href: string; fill?: boolean; paths: string[] }

const P = {
  pin: ["M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z", "M12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"],
  phone: ["M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"],
  mail: ["M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M3.5 7.5 12 13.5l8.5-6"],
  clock: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M12 7v5l3 2"],
  whatsapp: ["M3 21l1.6-4.8A8.5 8.5 0 1 1 8 19.5L3 21z", "M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.5-2-1-1 .8c-1-.4-2-1.4-2.4-2.4l.8-1-1-2z"],
  facebook: ["M13.5 21v-8h2.7l.4-3.2h-3.1V7.9c0-.9.3-1.5 1.6-1.5h1.7V3.5c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H7.3V13h2.8v8z"],
  instagram: ["M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4z", "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z", "M17.5 6.5h.01"],
  youtube: ["M3 8a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3z", "M10 9.5v5l4.5-2.5z"],
  linkedin: ["M4.5 9h3.6v11H4.5z", "M6.3 3.5a2.1 2.1 0 1 1 0 4.2 2.1 2.1 0 0 1 0-4.2z", "M10 9h3.4v1.5c.5-.9 1.7-1.8 3.5-1.8 3.6 0 4.1 2.3 4.1 5.3V20h-3.6v-5.2c0-1.3 0-2.8-1.8-2.8s-2 1.3-2 2.7V20H10z"],
}

function Icon({ paths, fill, className = "size-[18px]" }: { paths: string[]; fill?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={fill ? "currentColor" : "none"} stroke={fill ? "none" : "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}

function SocialLinks({ items, className = "" }: { items: Ico[]; className?: string }) {
  return (
    <ul className={`gap-2 ${className}`}>
      {items.map((x) => (
        <li key={x.label}>
          <a
            href={x.href}
            aria-label={x.label}
            title={x.label}
            className="inline-flex size-9 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white/90 transition hover:border-saffron hover:bg-saffron hover:text-charcoal md:size-10"
          >
            <Icon paths={x.paths} fill={x.fill} />
          </a>
        </li>
      ))}
    </ul>
  )
}

/** The restaurant's own social pages (replace "#" with the real links). */
const SOCIALS: Ico[] = [
  { label: "Facebook", href: "#", fill: true, paths: P.facebook },
  { label: "Instagram", href: "#", paths: P.instagram },
  { label: "YouTube", href: "#", paths: P.youtube },
]

/** Developer credit links. Leave href empty to hide a link until the profile URL is known. */
const CREDIT_LINKS: Ico[] = [
  { label: "WhatsApp", href: "https://wa.me/8801828255113", paths: P.whatsapp },
  { label: "Email", href: "mailto:elorislabs444@gmail.com", paths: P.mail },
  { label: "Facebook", href: "https://www.facebook.com/share/19p2Yd2HA6/", fill: true, paths: P.facebook },
  { label: "Instagram", href: "", paths: P.instagram }, // add the profile link here
  { label: "LinkedIn", href: "", fill: true, paths: P.linkedin }, // add the profile link here
]

const heading = "text-eyebrow text-saffron"
const link = "flex items-center justify-between gap-1.5 py-2.5 text-white/85 transition hover:text-saffron md:inline-flex md:justify-start md:py-1.5 md:hover:translate-x-0.5"

export function Footer() {
  const year = new Date().getFullYear()
  const { tr, num } = useLang()

  return (
    <footer id="contact" className="bg-jali relative mt-16 scroll-mt-[var(--header-h,120px)] text-white">
      <TornEdge side="top" className="text-brand" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Order CTA band */}
        <div className="relative -mt-12 mb-6 flex flex-col items-start justify-between gap-4 rounded-[1.75rem] bg-saffron px-5 py-5 text-charcoal shadow-[0_24px_50px_-24px_rgba(0,0,0,0.6)] ring-4 ring-white sm:mb-10 sm:gap-6 sm:px-6 sm:py-8 sm:flex-row sm:items-center sm:px-10">
          <img
            src={PHOTOS.cta}
            alt={tr("A bowl of biryani", "এক বাটি বিরিয়ানি")}
            loading="lazy"
            className="absolute -top-10 right-6 hidden size-36 rounded-full object-cover shadow-lift ring-[6px] ring-white md:block lg:right-56 lg:size-44"
          />
          <div className="flex items-center gap-4">
            <img src={PHOTOS.cta} alt="" loading="lazy" className="size-14 shrink-0 rounded-full object-cover ring-4 ring-white md:hidden" />
            <div>
              <p className="font-bn text-base font-semibold text-charcoal/70">খিদে পেয়েছে?</p>
              <p className="text-display mt-1 text-xl sm:mt-2 sm:text-4xl">
                {tr("Craving something shahi tonight?", "আজ রাতে শাহি কিছু খেতে মন চাইছে?")}
              </p>
            </div>
          </div>
          <a href="#menu" className="inline-flex h-12 shrink-0 items-center rounded-full bg-brand px-8 text-sm font-extrabold text-white transition hover:bg-charcoal">
            {tr("Order Now", "অর্ডার করুন")}
          </a>
        </div>

        {/* Main columns */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 pb-8 pt-2 text-xs sm:text-sm md:grid-cols-12 md:gap-x-10 md:gap-y-0 md:pb-14 md:pt-6">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4">
            <div className="flex items-center justify-between gap-3 md:block">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-alabaster p-1 ring-4 ring-white/30 md:size-16">
                  <img src="/logo-mark.png" alt="" className="size-full rounded-full object-contain" />
                </span>
                <div className="min-w-0">
                  <p className="text-display text-lg leading-tight md:text-2xl">{tr("Banglar Biriyani", "বাংলার বিরিয়ানি")}</p>
                  <p className="font-bn text-xs text-saffron md:text-sm">{tr("বাংলার বিরিয়ানি", "Banglar Biriyani")}</p>
                </div>
              </div>
              <SocialLinks items={SOCIALS} className="flex shrink-0 md:hidden" />
            </div>
            <p className="mt-3 max-w-sm leading-relaxed text-white/80 md:mt-5">
              {tr(
                "Old Dhaka style biriyani, slow-cooked in sealed handi and delivered hot around Daffodil Smart City, Savar.",
                "মুখ বন্ধ হাঁড়িতে ধীরে রান্না পুরান ঢাকার বিরিয়ানি, ড্যাফোডিল স্মার্ট সিটি, সাভারের আশেপাশে গরম গরম ডেলিভারি।",
              )}
            </p>
            <SocialLinks items={SOCIALS} className="mt-6 hidden md:flex" />
          </div>

          {/* Quick actions (phones) */}
          <div className="col-span-2 grid grid-cols-2 gap-2 md:hidden">
            <a href="tel:+8809612000000" className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 font-semibold text-white transition active:bg-white/20">
              <Icon paths={P.phone} className="size-4 text-saffron" />
              {tr("Call us", "কল করুন")}
            </a>
            <a href="mailto:hello@banglarbiriyani.com" className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 font-semibold text-white transition active:bg-white/20">
              <Icon paths={P.mail} className="size-4 text-saffron" />
              {tr("Email us", "ইমেইল করুন")}
            </a>
          </div>

          {/* Explore */}
          <nav aria-label={tr("Explore", "ঘুরে দেখুন")} className="col-span-2 md:col-span-2">
            <p className={heading}>{tr("Explore", "ঘুরে দেখুন")}</p>
            <ul className="mt-1 grid grid-cols-2 gap-x-6 md:mt-4 md:block md:space-y-0.5">
              {LINKS.map((l) => (
                <li key={l.href} className="border-b border-white/10 md:border-0">
                  <a href={l.href} className={link}>
                    <span className="flex items-center gap-2">
                      <span className="hidden h-px w-3 bg-saffron/70 md:block" aria-hidden />
                      {tr(l.en, l.bn)}
                    </span>
                    <span className="text-saffron/70 md:hidden" aria-hidden>›</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div className="md:col-span-3">
            <p className={heading}>{tr("Contact", "যোগাযোগ")}</p>
            <ul className="mt-2 space-y-3 text-white/85 md:mt-4">
              <li className="flex gap-2.5">
                <Icon paths={P.pin} className="mt-0.5 size-4 shrink-0 text-saffron" />
                <span>
                  {tr(
                    "Near Daffodil Smart City, Birulia, Savar, Dhaka-1216",
                    "ড্যাফোডিল স্মার্ট সিটির পাশে, বিরুলিয়া, সাভার, ঢাকা-১২১৬",
                  )}
                </span>
              </li>
              <li className="hidden md:block">
                <a href="tel:+8809612000000" className="flex items-center gap-2.5 transition hover:text-saffron">
                  <Icon paths={P.phone} className="size-4 shrink-0 text-saffron" />
                  +880 9612-000000
                </a>
              </li>
              <li className="hidden md:block">
                <a href="mailto:hello@banglarbiriyani.com" className="flex items-center gap-2.5 break-all transition hover:text-saffron">
                  <Icon paths={P.mail} className="size-4 shrink-0 text-saffron" />
                  hello@banglarbiriyani.com
                </a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div className="md:col-span-3">
            <p className={heading}>{tr("Opening hours", "খোলার সময়")}</p>
            <div className="mt-2 rounded-2xl border border-white/15 bg-white/5 p-3.5 md:mt-4 md:p-4">
              <p className="flex items-center gap-2 text-xs font-bold text-saffron">
                <Icon paths={P.clock} className="size-4" />
                {tr("We deliver", "ডেলিভারি চলে")}
              </p>
              <ul className="mt-2 divide-y divide-white/10">
                {HOURS.map((h) => (
                  <li key={h.day[0]} className="py-2 first:pt-0 last:pb-0">
                    <span className="block font-semibold text-white">{tr(h.day[0], h.day[1])}</span>
                    <span className="block text-white/75">{tr(h.time[0], h.time[1])}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/20 bg-black/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p className="text-center text-[11px] text-white/70 md:text-left md:text-xs">
            {tr(`© ${year} Banglar Biriyani. All rights reserved.`, `© ${num(year).replace(/,/g, "")} বাংলার বিরিয়ানি। সর্বস্বত্ব সংরক্ষিত।`)}
            <span className="font-bn hidden text-white/50 lg:inline"> · ভালোবাসা দিয়ে রান্না, সাভার থেকে</span>
          </p>

          <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3 md:justify-end md:gap-5 md:border-0 md:pt-0">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="grid h-10 w-8 shrink-0 place-items-center overflow-hidden rounded-md bg-[#f9f6f1] p-0.5 md:h-11 md:w-9">
                <img src="/eloris-labs.png" alt="Eloris Labs" width={240} height={282} loading="lazy" className="size-full object-contain" />
              </span>
              <p className="text-[11px] leading-tight text-white/65 md:text-xs">
                {tr("Developed by", "ডেভেলপ করেছে")}
                <span className="text-display block text-sm text-white md:text-base">Eloris Labs</span>
              </p>
            </div>
            <span className="hidden h-8 w-px bg-white/20 md:block" aria-hidden />
            <ul className="flex items-center gap-1.5">
              {CREDIT_LINKS.filter((c) => c.href).map((c) => (
                <li key={c.label}>
                  <a
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    aria-label={`Eloris Labs on ${c.label}`}
                    title={c.label}
                    className="inline-flex size-9 items-center justify-center rounded-full border border-white/15 text-white/85 transition hover:border-saffron hover:text-saffron"
                  >
                    <Icon paths={c.paths} fill={c.fill} />
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
