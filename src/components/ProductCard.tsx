import { useState } from "react"
import { useCart } from "../context/CartContext"
import { useLang } from "../context/LanguageContext"
import { dishDescription, dishName, portionName } from "../i18n/dishes"

export type Product = {
  id: string | number
  name: string
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
  const { lang, tr, num } = useLang()
  const name = dishName(product.name, lang)

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
      className={`group flex flex-col overflow-hidden rounded-card bg-white shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift scroll-mt-[calc(var(--header-h,120px)+32px)] ${
        isHighlighted ? "scale-[1.02] ring-4 ring-brand shadow-[0_0_35px_rgba(215,35,43,0.35)]" : ""
      } ${isSoldOut ? "opacity-85" : ""}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-saffron/40 via-alabaster to-brand/15">
        {product.image ? (
          <img
            src={product.image}
            alt={name}
            loading="lazy"
            className={`size-full object-cover transition duration-500 group-hover:scale-105 ${isSoldOut ? "grayscale" : ""}`}
          />
        ) : (
          <div className="grid size-full place-items-center">
            <img src="/logo-mark.png" alt="" className="size-20 opacity-40" />
          </div>
        )}
        {product.bestseller && (
          <span className="absolute left-3 top-3 rounded-full bg-saffron px-3 py-1 text-xs font-bold text-charcoal">
            {tr("Bestseller", "বেস্টসেলার")}
          </span>
        )}
        {isSoldOut && (
          <span className="absolute right-3 top-3 rounded-full bg-charcoal/85 px-3 py-1 text-xs font-bold text-white backdrop-blur-xs">
            {tr("Sold Out", "শেষ")}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="text-display text-lg leading-snug">{name}</h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-slate">
          {dishDescription(product.name, product.description, lang)}
        </p>
        {product.portionSize && (
          <p className="text-xs font-semibold text-slate/80">{portionName(product.portionSize, lang)}</p>
        )}

        {isLowStock && (
          <p className="flex items-center gap-2 text-xs font-semibold text-brand">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-brand" />
            </span>
            {tr(`Only ${product.remainingPortions} left today`, `আজ মাত্র ${num(product.remainingPortions ?? 0)}টি বাকি`)}
          </p>
        )}

        <p className="text-display mt-auto pt-2 text-2xl text-brand">
          {product.basePriceBdt !== undefined && product.basePriceBdt > product.price && (
            <span className="mr-2 text-sm font-normal text-slate line-through">৳{num(product.basePriceBdt)}</span>
          )}
          ৳{num(product.price)}
        </p>
        <button
          type="button"
          disabled={isSoldOut}
          onClick={handleAdd}
          aria-label={
            isSoldOut
              ? tr(`${product.name} is sold out`, `${name} শেষ হয়ে গেছে`)
              : tr(`Add ${product.name} to cart`, `${name} কার্টে যোগ করুন`)
          }
          className={`mt-1 h-11 w-full rounded-full text-sm font-bold transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30 ${
            isSoldOut
              ? "cursor-not-allowed bg-cream text-slate"
              : justAdded
                ? "border-2 border-brand bg-brand-light text-brand"
                : "bg-brand text-white hover:bg-brand-hover"
          }`}
        >
          {isSoldOut ? tr("Sold Out", "শেষ") : justAdded ? tr("Added ✓", "যোগ হয়েছে ✓") : tr("+ Add to cart", "+ কার্টে যোগ করুন")}
        </button>
      </div>
    </article>
  )
}
