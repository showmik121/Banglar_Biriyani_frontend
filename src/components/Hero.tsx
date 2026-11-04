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
      className="relative isolate overflow-hidden bg-charcoal"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* soft brand glow behind the text */}
      <div className="pointer-events-none absolute -left-24 top-0 -z-10 size-80 rounded-full bg-brand/25 blur-3xl" aria-hidden />

      <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[1fr_1.05fr] lg:gap-12 lg:px-8 lg:py-10">
        {/* Photo: clear and uncovered, always shown first on phones */}
        <div className="relative order-1 overflow-hidden rounded-3xl bg-charcoal shadow-2xl ring-1 ring-white/15 lg:order-2">
          <div className="relative aspect-[16/10] w-full sm:aspect-[2/1] lg:aspect-[4/3] lg:max-h-[400px]">
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
            {/* only a thin fade at the bottom so the dots stay visible */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/45 to-transparent" />
            {count > 1 && (
              <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1">
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
                        i === active ? "w-6 bg-saffron" : "w-2 bg-white/70 hover:bg-white"
                      }`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="order-2 flex flex-col pb-2 lg:order-1 lg:pb-0">
          <span className="w-fit rounded-full bg-saffron px-3 py-1.5 text-xs font-bold text-charcoal">{badge}</span>
          <Heading className="text-display mt-4 text-[2rem] leading-[1.15] text-white sm:text-5xl lg:text-[3.4rem]">
            {title} <span className="text-saffron">{highlight}</span>
          </Heading>
          <p className="text-display mt-3 text-lg text-white/85 sm:text-xl">
            <span className="text-brand">—</span> {subtitle}
          </p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/75 sm:text-base">{body}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={primary.href}
              className="inline-flex h-12 items-center rounded-full bg-brand px-7 text-sm font-bold text-white transition hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
            >
              {primary.label}
            </a>
            {secondary && (
              <a
                href={secondary.href}
                className="inline-flex h-12 items-center rounded-full border border-white/40 px-7 text-sm font-bold text-white transition hover:bg-white hover:text-charcoal focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
              >
                {secondary.label}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
