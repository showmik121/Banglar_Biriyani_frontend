import { TornEdge } from "./TornEdge"
import { PHOTOS } from "../data/photos"
import { useLang } from "../context/LanguageContext"

const SOCIALS = [
  ["Facebook", "ফেসবুক"],
  ["Instagram", "ইনস্টাগ্রাম"],
  ["YouTube", "ইউটিউব"],
] as const

const LINKS = [
  { en: "Menu", bn: "মেনু", href: "#menu" },
  { en: "Our Story", bn: "আমাদের গল্প", href: "#about" },
  { en: "How to Order", bn: "কীভাবে অর্ডার করবেন", href: "#how" },
  { en: "Location", bn: "লোকেশন", href: "#location" },
  { en: "Contact", bn: "যোগাযোগ", href: "#contact" },
]

const HOURS = [
  { day: ["Saturday – Thursday", "শনিবার – বৃহস্পতিবার"], time: ["11:00 am – 11:00 pm", "সকাল ১১টা – রাত ১১টা"] },
  { day: ["Friday", "শুক্রবার"], time: ["2:00 pm – 11:00 pm", "দুপুর ২টা – রাত ১১টা"] },
] as const

export function Footer() {
  const year = new Date().getFullYear()
  const { tr, num } = useLang()

  return (
    <footer
      id="contact"
      className="bg-jali relative mt-24 scroll-mt-[var(--header-h,120px)] text-white"
    >
      <TornEdge side="top" className="text-brand" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Order CTA band */}
        <div className="relative -mt-12 mb-10 flex flex-col items-start justify-between gap-6 rounded-[1.75rem] bg-saffron px-6 py-8 text-charcoal shadow-[0_24px_50px_-24px_rgba(0,0,0,0.6)] ring-4 ring-white sm:flex-row sm:items-center sm:px-10">
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
              className="size-20 shrink-0 rounded-full object-cover ring-4 ring-white md:hidden"
            />
            <div>
            <p className="font-bn text-base font-semibold text-charcoal/70">খিদে পেয়েছে?</p>
            <p className="text-display mt-2 text-3xl sm:text-4xl">
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

        <div className="grid gap-10 pb-12 pt-2 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid size-16 place-items-center rounded-full bg-alabaster p-1 ring-4 ring-white/30">
                <img src="/logo-mark.png" alt="" className="size-full rounded-full object-contain" />
              </span>
              <div>
                <p className="text-display text-2xl">{tr("Banglar Biriyani", "বাংলার বিরিয়ানি")}</p>
                <p className="font-bn text-sm text-saffron">{tr("বাংলার বিরিয়ানি", "Banglar Biriyani")}</p>
              </div>
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/80">
              {tr(
                "Old Dhaka style biriyani, slow-cooked in sealed handi and delivered hot around Daffodil Smart City, Savar.",
                "মুখ বন্ধ হাঁড়িতে ধীরে রান্না পুরান ঢাকার বিরিয়ানি, ড্যাফোডিল স্মার্ট সিটি, সাভারের আশেপাশে গরম গরম ডেলিভারি।",
              )}
            </p>
          </div>

          <div>
            <p className="text-eyebrow text-saffron">{tr("Explore", "ঘুরে দেখুন")}</p>
            <ul className="mt-3 space-y-1 text-sm text-white/85">
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
            <ul className="mt-3 space-y-1 text-sm text-white/85">
              <li>
                {tr(
                  "Near Daffodil Smart City, Birulia, Savar, Dhaka-1216",
                  "ড্যাফোডিল স্মার্ট সিটির পাশে, বিরুলিয়া, সাভার, ঢাকা-১২১৬",
                )}
              </li>
              <li>
                <a href="tel:+8809612000000" className="inline-block py-2 transition hover:text-saffron">
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
            <ul className="mt-4 space-y-2.5 text-sm">
              {HOURS.map((h) => (
                <li key={h.day[0]} className="flex flex-col">
                  <span className="text-white/85">{tr(h.day[0], h.day[1])}</span>
                  <span className="text-white/85">{tr(h.time[0], h.time[1])}</span>
                </li>
              ))}
            </ul>
            <ul className="mt-6 flex flex-wrap gap-2">
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
      </div>
    </footer>
  )
}
