import { useEffect, useState } from "react"

type Props = {
  image: string
  /** Optional extra images; when given, the hero slides through [image, ...images]. */
  images?: string[]
  alt: string
  badge: string
  title: string
  highlight: string
  subtitle: string
  body: string
  primary: { label: string; href: string }
  secondary?: { label: string; href: string }
  compact?: boolean
}

export function Hero({
  image,
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
}: Props) {
  const slides = images?.length ? [image, ...images] : [image]
  const count = slides.length
  // A clone of the first slide sits at the end so the loop keeps sliding forward.
  const track = count > 1 ? [...slides, slides[0]] : slides
  const [index, setIndex] = useState(0)
  const [animate, setAnimate] = useState(true)

  useEffect(() => {
    if (count < 2) return
    const t = window.setInterval(() => {
      setAnimate(true)
      setIndex((i) => (i >= count ? i : i + 1))
    }, 3500)
    return () => window.clearInterval(t)
  }, [count])

  // After sliding onto the clone, jump back to the real first slide without animation.
  const handleTransitionEnd = () => {
    if (index === count) {
      setAnimate(false)
      setIndex(0)
    }
  }

  const active = index % count

  return (
    <section className="relative isolate overflow-hidden bg-charcoal">
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
            decoding="async"
            className="size-full shrink-0 object-cover"
          />
        ))}
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-charcoal via-charcoal/80 to-charcoal/10" />
      <div
        className={`mx-auto flex max-w-7xl flex-col justify-center px-4 py-14 sm:px-6 lg:px-8 ${
          compact
            ? "min-h-[340px] lg:min-h-[400px]"
            : "min-h-[420px] md:min-h-[480px] lg:min-h-[520px]"
        }`}
      >
        <span className="text-display w-fit rounded-full bg-saffron px-3 py-1.5 text-xs text-charcoal">
          {badge}
        </span>
        <h2
          className={`text-display mt-5 max-w-2xl text-white ${
            compact ? "text-4xl sm:text-5xl lg:text-6xl" : "text-5xl sm:text-6xl lg:text-7xl"
          }`}
        >
          {title} <span className="text-saffron">{highlight}</span>
        </h2>
        <p className="text-display mt-4 text-xl text-white/80 sm:text-2xl">
          <span className="text-[#E4002B]">—</span> {subtitle}
        </p>
        <p className="mt-4 max-w-md text-white/70">{body}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={primary.href}
            className="inline-flex h-12 items-center rounded-full bg-[#E4002B] px-7 text-sm font-semibold text-white transition hover:bg-[#B80022]"
          >
            {primary.label}
          </a>
          {secondary && (
            <a
              href={secondary.href}
              className="inline-flex h-12 items-center rounded-full border border-white/30 px-7 text-sm font-semibold text-white transition hover:bg-white hover:text-charcoal"
            >
              {secondary.label}
            </a>
          )}
        </div>
      </div>
      {count > 1 && (
        <div className="absolute bottom-4 right-4 flex gap-2 sm:bottom-6 sm:right-8">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setAnimate(true)
                setIndex(i)
              }}
              aria-label={`স্লাইড ${i + 1}`}
              aria-current={i === active}
              className={`h-2.5 rounded-full transition-all ${
                i === active ? "w-7 bg-saffron" : "w-2.5 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
