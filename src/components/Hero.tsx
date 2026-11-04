import { TornEdge, TornPanel } from "./TornEdge"
import { useLang } from "../context/LanguageContext"

type Props = {
  image: string
  alt: string
  kicker: string
  lineOne: string
  lineTwo: string
  english: string
  body: string
  primary: { label: string; href: string }
  secondary?: { label: string; href: string }
  special?: { name: string; price: number }
}

function Arrow() {
  return (
    <svg
      className="size-4 transition group-hover:translate-x-0.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      aria-hidden
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export function Hero({
  image,
  alt,
  kicker,
  lineOne,
  lineTwo,
  english,
  body,
  primary,
  secondary,
  special,
}: Props) {
  const { tr, num } = useLang()
  return (
    <section className="bg-halftone relative isolate overflow-hidden">
      {/* Red torn-paper panel: right side on desktop */}
      <div className="absolute inset-y-0 right-0 -z-10 hidden w-[44%] lg:block">
        <div className="bg-jali absolute inset-0" />
        <TornPanel className="absolute inset-y-0 -left-14 h-full w-16 text-brand" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 pt-10 sm:px-6 lg:min-h-[600px] lg:grid-cols-[1.1fr_1fr] lg:gap-10 lg:px-8 lg:py-16">
        <div className="animate-rise-in pb-4 lg:pb-0">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-white py-1 pl-1 pr-4 shadow-card">
            <img src="/logo-mark.png" alt="" className="size-7 rounded-full object-contain" />
            <span className="font-bn text-sm font-semibold text-brand">{kicker}</span>
          </span>

          <h1 className="mt-6">
            <span className="text-display block text-5xl text-charcoal sm:text-6xl lg:text-7xl">
              {lineOne}
            </span>
            <span className="font-calli mt-1 block text-6xl leading-[1.15] text-brand sm:text-7xl lg:text-[6.5rem]">
              {lineTwo}
            </span>
            <span className="text-eyebrow mt-4 block text-sm tracking-[0.3em] text-charcoal/70">
              {english}
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-slate sm:text-lg">{body}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={primary.href}
              className="group inline-flex h-13 items-center gap-2 rounded-full bg-brand px-8 text-sm font-extrabold text-white shadow-gold transition hover:bg-brand-hover"
            >
              {primary.label}
              <Arrow />
            </a>
            {secondary && (
              <a
                href={secondary.href}
                className="inline-flex h-13 items-center rounded-full border-2 border-charcoal/80 px-8 text-sm font-bold text-charcoal transition hover:bg-charcoal hover:text-white"
              >
                {secondary.label}
              </a>
            )}
          </div>

          <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-charcoal/80">
            <li className="flex items-center gap-2">
              <span className="text-saffron">★★★★★</span> {tr("Loved by DIU students", "ডিআইইউ শিক্ষার্থীদের প্রিয়")}
            </li>
            <li className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-brand" />{" "}
              {tr("Free delivery in Savar & Ashulia", "সাভার ও আশুলিয়ায় ফ্রি ডেলিভারি")}
            </li>
          </ul>
        </div>

        {/* Plate */}
        <div className="relative -mx-4 px-4 pb-14 pt-16 sm:-mx-6 sm:px-6 lg:mx-0 lg:p-0">
          {/* red panel on mobile */}
          <div className="bg-jali absolute inset-0 -z-10 lg:hidden">
            <TornEdge side="top" className="text-brand" />
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-[300px] sm:max-w-[400px] lg:max-w-[460px]">
            <div className="absolute -inset-4 rounded-full border-2 border-dashed border-white/50" />
            <div className="animate-rise-in relative size-full overflow-hidden rounded-full bg-brand-hover shadow-[0_40px_80px_-30px_rgba(60,0,4,0.8)] ring-[10px] ring-white [animation-delay:120ms]">
              <img src={image} alt={alt} className="size-full object-cover" />
            </div>

            <div
              className="pointer-events-none absolute left-1/2 top-[8%] flex -translate-x-1/2 gap-3"
              aria-hidden
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="animate-steam block h-10 w-2 rounded-full bg-white/70 blur-[3px]"
                  style={{ animationDelay: `${i * 0.8}s` }}
                />
              ))}
            </div>

            {special && (
              <div className="animate-float-slow absolute -left-2 bottom-2 grid size-32 rotate-[-10deg] place-items-center rounded-full bg-saffron text-center text-charcoal shadow-lift ring-4 ring-white sm:-left-8 sm:size-36">
                <div>
                  <p className="text-xs font-semibold">{tr("Only", "মাত্র")}</p>
                  <p className="text-display text-3xl leading-none sm:text-4xl">৳{num(special.price)}</p>
                  <p className="mt-1 px-3 text-[11px] font-bold leading-tight">{special.name}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
