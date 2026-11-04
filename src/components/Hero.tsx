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
  /** Shorter banner for the second section */
  compact?: boolean
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
  compact,
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
      <div
        className="absolute inset-0 -z-10 flex will-change-transform"
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
      {/* Dark fade on the text side so the words stay readable on any photo */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-charcoal/95 via-charcoal/75 to-charcoal/20" />

      <div
        className={`mx-auto flex max-w-7xl flex-col justify-center px-4 sm:px-6 lg:px-8 ${
          compact
            ? "min-h-[320px] py-12 lg:min-h-[380px]"
            : "min-h-[440px] py-14 md:min-h-[480px] lg:min-h-[520px]"
        }`}
      >
        <span className="w-fit rounded-full bg-saffron px-3 py-1.5 text-xs font-bold text-charcoal">{badge}</span>
        <Heading
          className={`text-display mt-5 max-w-2xl leading-[1.15] text-white ${
            compact ? "text-4xl sm:text-5xl lg:text-6xl" : "text-[2.6rem] sm:text-6xl lg:text-7xl"
          }`}
        >
          {title} <span className="text-saffron">{highlight}</span>
        </Heading>
        <p className="text-display mt-4 text-xl text-white/85 sm:text-2xl">
          <span className="text-brand">—</span> {subtitle}
        </p>
        <p className="mt-4 max-w-md leading-relaxed text-white/75">{body}</p>
        <div className="mt-8 flex flex-wrap gap-3">
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

      {count > 1 && (
        <div className="absolute bottom-4 right-4 flex gap-1 sm:bottom-6 sm:right-8">
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
                className={`block h-2.5 rounded-full transition-all ${
                  i === active ? "w-7 bg-saffron" : "w-2.5 bg-white/50 hover:bg-white/80"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
