/** Line icons for the order tracker. They take their colour from the text colour around them. */
type Kind = "PENDING" | "CONFIRMED" | "PREPARING" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED"

const PATHS: Record<Kind, string[]> = {
  // receipt
  PENDING: ["M6 3h12v18l-3-2-3 2-3-2-3 2z", "M9 8h6", "M9 12h6"],
  // check in a circle
  CONFIRMED: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z", "M8 12.5l2.8 2.8L16 9.6"],
  // cooking pot with steam
  PREPARING: ["M4 11h16v2a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6z", "M2.5 11h19", "M9 7.5c0-1 1-1.2 1-2.2", "M14 7.5c0-1 1-1.2 1-2.2"],
  // scooter with a delivery box
  OUT_FOR_DELIVERY: [
    "M6 20a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8z",
    "M18 20a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8z",
    "M8.4 17.6h5.4l2.4-7.6h-3.2",
    "M16.2 10l-1.1-3.6H13",
    "M3 8.5h6.2v5.2H3z",
  ],
  // gift box
  DELIVERED: ["M4 10h16v10H4z", "M3 7h18v3H3z", "M12 7v13", "M12 7c-2.2 0-4-.9-4-2.3S10.2 3 12 7z", "M12 7c2.2 0 4-.9 4-2.3S13.8 3 12 7z"],
  // x in a circle
  CANCELLED: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z", "M9 9l6 6", "M15 9l-6 6"],
}

export function StatusIcon({ status, className = "h-5 w-5" }: { status: Kind; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {PATHS[status].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}
