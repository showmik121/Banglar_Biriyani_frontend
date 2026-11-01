import { useState } from "react"
import { useCart } from "../context/CartContext"

export type Product = {
  id: string | number
  name: string
  banglaName?: string
  category?: string
  description: string
  price: number
  basePriceBdt?: number
  image?: string
  bestseller?: boolean
  portionSize?: string
  remainingPortions?: number
  dailyQuota?: number
  day?: string
}

export function ProductCard({
  product,
  onAdd,
  isHighlighted = false,
}: {
  product: Product
  onAdd?: (p: Product) => void
  isHighlighted?: boolean
}) {
  const { addItem, activeDay } = useCart()
  const [justAdded, setJustAdded] = useState(false)

  const isSoldOut = product.remainingPortions !== undefined && product.remainingPortions <= 0
  const isLowStock =
    product.remainingPortions !== undefined &&
    product.remainingPortions > 0 &&
    product.remainingPortions <= 15

  const handleAdd = () => {
    if (isSoldOut) return
    if (onAdd) {
      onAdd(product)
    } else {
      addItem(product, activeDay)
    }
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1200)
  }

  return (
    <article
      id={`dish-${product.id}`}
      className={`group relative flex flex-col rounded-card border border-line/70 bg-white p-2.5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-lift scroll-mt-[calc(var(--header-h,120px)+32px)] ${
        isHighlighted ? "scale-[1.02] ring-4 ring-gold shadow-gold" : ""
      } ${isSoldOut ? "opacity-80" : ""}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-[0.9rem] bg-gradient-to-br from-gold-light via-cream to-brand-light">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className={`size-full object-cover transition duration-700 group-hover:scale-[1.06] ${
              isSoldOut ? "grayscale" : ""
            }`}
          />
        ) : (
          <div className="grid size-full place-items-center">
            <img src="/logo-mark.png" alt="" className="size-20 opacity-40" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/25 to-transparent" />

        {product.bestseller && (
          <span className="text-eyebrow absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-maroon/90 px-2.5 py-1.5 text-[10px] text-saffron backdrop-blur">
            ★ Bestseller
          </span>
        )}
        {isSoldOut && (
          <span className="text-eyebrow absolute right-2.5 top-2.5 rounded-full bg-charcoal/85 px-2.5 py-1.5 text-[10px] text-white backdrop-blur">
            Sold Out
          </span>
        )}
        {product.portionSize && !isSoldOut && (
          <span className="absolute bottom-2.5 left-2.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-charcoal backdrop-blur">
            {product.portionSize}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-2 pb-1.5 pt-4">
        <h3 className="text-display text-[1.2rem] leading-snug">{product.name}</h3>
        {product.banglaName && (
          <p className="font-bn mt-0.5 text-sm text-gold">{product.banglaName}</p>
        )}
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate">
          {product.description}
        </p>

        {isLowStock && (
          <p className="mt-3 flex items-center gap-2 rounded-lg bg-chili-light px-2.5 py-1.5 text-xs font-semibold text-chili">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-chili opacity-75"></span>
              <span className="relative inline-flex size-2 rounded-full bg-chili"></span>
            </span>
            Only {product.remainingPortions} left today
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div className="leading-none">
            {product.basePriceBdt !== undefined && product.basePriceBdt > product.price && (
              <span className="mb-1 block text-xs text-slate line-through">
                ৳{product.basePriceBdt}
              </span>
            )}
            <span className="text-display text-2xl text-brand">
              <span className="mr-0.5 text-lg">৳</span>
              {product.price}
            </span>
          </div>
          <button
            type="button"
            disabled={isSoldOut}
            onClick={handleAdd}
            aria-label={isSoldOut ? `${product.name} is sold out` : `Add ${product.name} to cart`}
            className={`inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-bold transition active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30 ${
              isSoldOut
                ? "cursor-not-allowed bg-cream text-slate"
                : justAdded
                  ? "bg-gold-light text-gold ring-1 ring-gold/50"
                  : "bg-brand text-white hover:bg-brand-hover hover:shadow-[0_10px_22px_-10px_rgba(168,20,31,0.9)]"
            }`}
          >
            {isSoldOut ? (
              "Sold Out"
            ) : justAdded ? (
              "Added ✓"
            ) : (
              <>
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden>
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  )
}
