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

      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[1.1fr_1fr] lg:gap-10 lg:px-8 lg:py-14">
        <div className="order-2 flex flex-col items-center text-center lg:order-1 lg:items-start lg:text-left">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-brand/10 px-3.5 py-1.5 text-xs font-bold text-brand">
            <span className="size-1.5 rounded-full bg-brand" aria-hidden />
            {badge}
          </span>
          <Heading className="text-display mt-4 text-[2.1rem] leading-[1.12] text-charcoal sm:text-5xl lg:text-[3.5rem]">
            {title} <span className="text-brand">{highlight}</span>
          </Heading>
          <p className="text-display mt-3 text-lg text-maroon sm:text-xl">{subtitle}</p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-slate sm:text-base">{body}</p>

          <div className="mt-6 flex flex-wrap justify-center gap-3 lg:justify-start">
            <a
              href={primary.href}
              className="inline-flex h-12 items-center rounded-full bg-brand px-8 text-sm font-bold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30"
            >
              {primary.label}
            </a>
            {secondary && (
              <a
                href={secondary.href}
                className="inline-flex h-12 items-center rounded-full border-2 border-charcoal/80 px-7 text-sm font-bold text-charcoal transition hover:bg-charcoal hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-charcoal/20"
              >
                {secondary.label}
              </a>
            )}
          </div>

          <ul className="mt-7 grid w-full max-w-md grid-cols-3 divide-x divide-line rounded-2xl border border-line bg-white/80 py-3 text-center shadow-sm lg:max-w-lg">
            {[
              [tr("7 days", "৭ দিন"), tr("7 menus", "৭ রকম মেনু")],
              [tr("Free", "ফ্রি"), tr("delivery", "ডেলিভারি")],
              [tr("Fresh", "তাজা"), tr("every day", "প্রতিদিন")],
            ].map(([top, bottom]) => (
              <li key={top} className="px-2">
                <p className="text-display text-lg text-brand sm:text-xl">{top}</p>
                <p className="text-[11px] font-semibold text-slate sm:text-xs">{bottom}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Round "plate" photo with a ring and two small chips */}
        <div className="order-1 flex flex-col items-center lg:order-2">
          <div className="relative mx-3 my-3 w-[min(66vw,300px)] sm:w-[380px] lg:w-[430px]">
            <div className="absolute -inset-3 rounded-full border-2 border-dashed border-saffron/70" aria-hidden />
            <div className="absolute -inset-6 -z-10 rounded-full bg-brand/10" aria-hidden />
            <div className="relative aspect-square overflow-hidden rounded-full bg-charcoal shadow-2xl ring-8 ring-white">
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

            <div className="absolute -left-3 top-[14%] flex items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-xl ring-1 ring-line sm:-left-8">
              <span className="grid size-8 place-items-center rounded-full bg-saffron text-sm" aria-hidden>
                🔥
              </span>
              <span className="text-left leading-tight">
                <span className="block text-xs font-bold text-charcoal">{tr("Served hot", "গরম গরম")}</span>
                <span className="block text-[10px] text-slate">{tr("dum cooked", "দমে রান্না")}</span>
              </span>
            </div>
            <div className="absolute -right-3 bottom-[14%] flex items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-xl ring-1 ring-line sm:-right-8">
              <span className="grid size-8 place-items-center rounded-full bg-brand text-sm text-white" aria-hidden>
                ✓
              </span>
              <span className="text-left leading-tight">
                <span className="block text-xs font-bold text-charcoal">{tr("Free delivery", "ফ্রি ডেলিভারি")}</span>
                <span className="block text-[10px] text-slate">{tr("to your door", "দরজা পর্যন্ত")}</span>
              </span>
            </div>
          </div>

          {count > 1 && (
            <div className="mt-6 flex justify-center gap-1">
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
                  className="grid h-6 place-items-center px-0.5"
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
