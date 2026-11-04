import { useEffect, useState } from "react"
import { useLang } from "../context/LanguageContext"

type Props = {
  /** Photos that slide one after another */
  images: string[]
  alt: string
  badge: string
  title: string
  highlight: string
  subtitle: string
  body: string
  primary: { label: string; href: string }
  secondary?: { label: string; href: string }
  /** The page's main heading (only the first hero) */
  as?: "h1" | "h2"
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

/** Full-width photo slider with the headline on a dark fade. */
export function Hero({
  images,
  alt,
  badge,
  title,
  highlight,
  subtitle,
  body,
  primary,
  secondary,
  as: Heading = "h1",
}: Props) {
  const { tr, num } = useLang()
  const count = images.length
  // A copy of the first photo sits at the end so the loop keeps sliding forward.
  const track = count > 1 ? [...images, images[0]] : images
  const [index, setIndex] = useState(0)
  const [animate, setAnimate] = useState(true)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (count < 2 || paused || prefersReducedMotion()) return
    const t = window.setInterval(() => {
      setAnimate(true)
      setIndex((i) => (i >= count ? i : i + 1))
    }, 4500)
    return () => window.clearInterval(t)
  }, [count, paused])

  // After sliding onto the copy, jump back to the real first photo without animation.
  const handleTransitionEnd = () => {
    if (index === count) {
      setAnimate(false)
      setIndex(0)
    }
  }
  const active = count ? index % count : 0

  return (
    <section
      className="relative isolate overflow-hidden bg-gradient-to-b from-cream via-alabaster to-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* soft background shapes */}
      <div className="pointer-events-none absolute -right-32 -top-32 -z-10 size-[28rem] rounded-full bg-saffron/20 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -left-32 bottom-0 -z-10 size-96 rounded-full bg-brand/10 blur-3xl" aria-hidden />

      <div className="mx-auto grid max-w-7xl items-center gap-5 px-5 pb-8 pt-3 sm:px-6 sm:py-10 lg:grid-cols-[1.1fr_1fr] lg:gap-10 lg:px-8 lg:py-14">
        <div className="order-2 flex flex-col items-start text-left sm:items-center sm:text-center lg:order-1 lg:items-start lg:text-left">
          <span className="inline-flex w-fit items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-brand sm:rounded-full sm:bg-brand/10 sm:px-3.5 sm:py-1.5 sm:text-xs sm:normal-case sm:tracking-normal">
            <span className="hidden size-1.5 rounded-full bg-brand sm:block" aria-hidden />
            {badge}
          </span>
          <Heading className="text-display mt-2 text-[1.75rem] leading-[1.15] tracking-tight sm:mt-4 text-charcoal sm:text-5xl lg:text-[3.5rem]">
            {title} <span className="text-brand">{highlight}</span>
          </Heading>
          <p className="text-display mt-1 text-sm font-semibold text-slate sm:mt-3 sm:text-xl sm:text-maroon">{subtitle}</p>
          <p className="mt-1.5 hidden max-w-md text-[13px] leading-relaxed text-slate/90 sm:mt-3 sm:block sm:text-base">{body}</p>

          <div className="mt-4 grid w-full grid-cols-2 gap-3 sm:mt-6 sm:flex sm:w-auto sm:flex-wrap sm:justify-center lg:justify-start">
            <a
              href={primary.href}
              className="inline-flex h-12 items-center justify-center rounded-full bg-brand px-6 sm:px-8 text-sm font-bold text-white shadow-md shadow-brand/25 sm:shadow-lg sm:shadow-brand/30 transition hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30"
            >
              {primary.label}
            </a>
            {secondary && (
              <a
                href={secondary.href}
                className="inline-flex h-12 items-center justify-center rounded-full border border-line bg-white px-5 sm:border-2 sm:border-charcoal/80 sm:bg-transparent sm:px-7 text-sm font-bold text-charcoal transition hover:bg-charcoal hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-charcoal/20"
              >
                {secondary.label}
              </a>
            )}
          </div>

          <ul className="mt-5 hidden w-full max-w-md sm:mt-7 sm:grid grid-cols-3 divide-x divide-line py-1 text-center max-sm:border-t max-sm:border-line max-sm:pt-4 sm:rounded-2xl sm:border sm:border-line sm:bg-white/80 sm:py-3 sm:shadow-sm lg:max-w-lg">
            {[
              [tr("7 days", "৭ দিন"), tr("7 menus", "৭ রকম মেনু")],
              [tr("Free", "ফ্রি"), tr("delivery", "ডেলিভারি")],
              [tr("Fresh", "তাজা"), tr("every day", "প্রতিদিন")],
            ].map(([top, bottom]) => (
              <li key={top} className="px-2">
                <p className="text-display text-base text-charcoal sm:text-xl sm:text-brand">{top}</p>
                <p className="text-[11px] font-semibold text-slate sm:text-xs">{bottom}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Round "plate" photo with a ring and two small chips */}
        <div className="order-1 flex flex-col items-center lg:order-2">
          <div className="relative w-full sm:mx-3 sm:my-3 sm:w-[380px] lg:w-[430px]">
            <div className="absolute -inset-3 hidden rounded-full border-2 border-dashed border-saffron/70 sm:block" aria-hidden />
            <div className="absolute -inset-6 -z-10 hidden rounded-full bg-brand/10 sm:block" aria-hidden />
            <div className="relative aspect-[16/10] overflow-hidden rounded-[28px] bg-charcoal sm:aspect-square sm:rounded-full sm:shadow-2xl sm:ring-8 sm:ring-white">
              <div
                className="absolute inset-0 flex will-change-transform"
                style={{
                  transform: `translate3d(-${index * 100}%, 0, 0)`,
                  transition: animate ? "transform 900ms cubic-bezier(0.65, 0, 0.35, 1)" : "none",
                }}
                onTransitionEnd={handleTransitionEnd}
              >
                {track.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={i === active ? alt : ""}
                    aria-hidden={i !== active}
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
                    className="size-full shrink-0 object-cover"
                  />
                ))}
              </div>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 rounded-b-3xl bg-gradient-to-t from-black/55 to-transparent sm:hidden" aria-hidden />
            <div className="absolute bottom-3 left-3 hidden items-center gap-2 rounded-full bg-white/95 py-1.5 pl-1.5 pr-3 shadow-md sm:-left-8 sm:flex sm:bottom-auto sm:top-[14%] sm:rounded-2xl sm:px-3 sm:py-2 sm:shadow-xl sm:ring-1 sm:ring-line">
              <span className="grid size-7 place-items-center rounded-full bg-saffron text-sm sm:size-8" aria-hidden>
                🔥
              </span>
              <span className="text-left leading-tight">
                <span className="block text-xs font-bold text-charcoal">{tr("Served hot", "গরম গরম")}</span>
                <span className="hidden text-[10px] text-slate sm:block">{tr("dum cooked", "দমে রান্না")}</span>
              </span>
            </div>
            <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-white/95 py-1.5 pl-1.5 pr-3 shadow-md sm:left-auto sm:-right-8 sm:bottom-[14%] sm:rounded-2xl sm:px-3 sm:py-2 sm:shadow-xl sm:ring-1 sm:ring-line">
              <span className="grid size-7 place-items-center rounded-full bg-brand text-sm text-white sm:size-8" aria-hidden>
                ✓
              </span>
              <span className="text-left leading-tight">
                <span className="block text-xs font-bold text-charcoal">{tr("Free delivery", "ফ্রি ডেলিভারি")}</span>
                <span className="hidden text-[10px] text-slate sm:block">{tr("to your door", "দরজা পর্যন্ত")}</span>
              </span>
            </div>
          </div>

          {count > 1 && (
            <div className="mt-2 flex justify-center gap-1 sm:mt-6">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setAnimate(true)
                    setIndex(i)
                  }}
                  aria-label={tr(`Photo ${i + 1}`, `ছবি ${num(i + 1)}`)}
                  aria-current={i === active}
                  className="grid h-6 min-w-6 place-items-center"
                >
                  <span
                    className={`block h-2 rounded-full transition-all ${
                      i === active ? "w-6 bg-brand" : "w-2 bg-charcoal/25 hover:bg-charcoal/50"
                    }`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
