// Torn-paper edges used between sections and on red panels.
// Paths are generated once from a fixed seed so they look hand-torn but never change.

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function horizontalPath(seed: number) {
  const r = seeded(seed)
  const pts: string[] = []
  for (let x = 0; x <= 1200; x += 14 + r() * 22) {
    pts.push(`${x.toFixed(1)},${(4 + r() * 16).toFixed(1)}`)
  }
  pts.push("1200,12")
  return `M0,24 L0,12 L${pts.join(" L")} L1200,24 Z`
}

function verticalPath(seed: number) {
  const r = seeded(seed)
  const pts: string[] = []
  for (let y = 0; y <= 100; y += 1.6 + r() * 2.4) {
    pts.push(`${(r() * 45).toFixed(2)},${y.toFixed(2)}`)
  }
  pts.push("20,100")
  return `M100,0 L${pts.join(" L")} L100,100 Z`
}

const H1 = horizontalPath(7)
const H2 = horizontalPath(31)
const V1 = verticalPath(11)
const V2 = verticalPath(53)

/** A torn strip that sits on the top or bottom edge of a section. Colour = currentColor. */
export function TornEdge({
  side = "bottom",
  className = "",
}: {
  side?: "top" | "bottom"
  className?: string
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1200 24"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute inset-x-0 h-4 w-full sm:h-6 ${
        side === "top" ? "top-0 -translate-y-[calc(100%-1px)]" : "bottom-0 translate-y-[calc(100%-1px)] rotate-180"
      } ${className}`}
    >
      <path d={H2} fill="currentColor" opacity="0.35" transform="translate(0 -3)" />
      <path d={H1} fill="currentColor" />
    </svg>
  )
}

/** A full-height panel with a torn left edge (used for the red hero panel). */
export function TornPanel({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className={className}>
      <path d={V2} fill="#f6c3c6" transform="translate(-14 0)" />
      <path d={V1} fill="currentColor" />
    </svg>
  )
}
