import { TornEdge } from "./TornEdge"
import { PHOTOS } from "../data/photos"

const SOCIALS = ["Facebook", "Instagram", "YouTube"]

const LINKS = [
  { label: "Menu", href: "#menu" },
  { label: "Our Story", href: "#about" },
  { label: "How to Order", href: "#how" },
  { label: "Location", href: "#location" },
  { label: "Contact", href: "#contact" },
]

const HOURS = [
  { day: "Saturday – Thursday", time: "11:00 am – 11:00 pm" },
  { day: "Friday", time: "2:00 pm – 11:00 pm" },
]

export function Footer() {
  const year = new Date().getFullYear()

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
            alt="A bowl of biryani"
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
              Craving something shahi tonight?
            </p>
            </div>
          </div>
          <a
            href="#menu"
            className="inline-flex h-12 shrink-0 items-center rounded-full bg-brand px-8 text-sm font-extrabold text-white transition hover:bg-charcoal"
          >
            Order Now
          </a>
        </div>

        <div className="grid gap-10 pb-12 pt-2 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid size-16 place-items-center rounded-full bg-alabaster p-1 ring-4 ring-white/30">
                <img src="/logo-mark.png" alt="" className="size-full rounded-full object-contain" />
              </span>
              <div>
                <p className="text-display text-2xl">Banglar Biriyani</p>
                <p className="font-bn text-sm text-saffron">বাংলার বিরিয়ানি</p>
              </div>
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/80">
              Old Dhaka style biriyani, slow-cooked in sealed handi and delivered hot around
              Daffodil Smart City, Savar.
            </p>
          </div>

          <div>
            <p className="text-eyebrow text-saffron">Explore</p>
            <ul className="mt-4 space-y-2.5 text-sm text-white/85">
              {LINKS.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="transition hover:text-saffron">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-eyebrow text-saffron">Contact</p>
            <ul className="mt-4 space-y-2.5 text-sm text-white/85">
              <li>Near Daffodil Smart City, Birulia, Savar, Dhaka-1216</li>
              <li>
                <a href="tel:+8809612000000" className="transition hover:text-saffron">
                  +880 9612-000000
                </a>
              </li>
              <li>
                <a href="mailto:hello@banglarbiriyani.com" className="transition hover:text-saffron">
                  hello@banglarbiriyani.com
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-eyebrow text-saffron">Opening hours</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {HOURS.map((h) => (
                <li key={h.day} className="flex flex-col">
                  <span className="text-white/85">{h.day}</span>
                  <span className="text-white/85">{h.time}</span>
                </li>
              ))}
            </ul>
            <ul className="mt-6 flex flex-wrap gap-2">
              {SOCIALS.map((s) => (
                <li key={s}>
                  <a
                    href="#"
                    className="inline-flex h-9 items-center rounded-full border border-white/15 px-4 text-xs font-semibold transition hover:border-saffron hover:text-saffron"
                  >
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/20">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-white/70 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {year} Banglar Biriyani. All rights reserved.</p>
          <p className="font-bn">ভালোবাসা দিয়ে রান্না, সাভার থেকে</p>
        </div>
      </div>
    </footer>
  )
}
