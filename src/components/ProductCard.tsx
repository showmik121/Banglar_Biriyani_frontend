import { useState } from "react"
import { useCart } from "../context/CartContext"
import { useLang } from "../context/LanguageContext"
import { dishDescription, dishName, portionName } from "../i18n/dishes"

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
      className={`group relative flex gap-3 rounded-card border border-line/70 bg-white p-2.5 shadow-card transition-all duration-300 min-[560px]:flex-col min-[560px]:gap-0 min-[560px]:hover:-translate-y-1 hover:border-gold/40 hover:shadow-lift scroll-mt-[calc(var(--header-h,120px)+32px)] ${
        isHighlighted ? "scale-[1.02] ring-4 ring-gold shadow-gold" : ""
      } ${isSoldOut ? "opacity-80" : ""}`}
    >
      <div className="relative aspect-square w-28 shrink-0 self-start overflow-hidden rounded-[0.9rem] bg-gradient-to-br from-gold-light via-cream to-brand-light min-[380px]:w-32 min-[560px]:aspect-[4/3] min-[560px]:w-auto min-[560px]:self-auto">
        {product.image ? (
          <img
            src={product.image}
            alt={name}
            loading="lazy"
            className={`size-full object-cover transition duration-700 group-hover:scale-[1.06] ${
              isSoldOut ? "grayscale" : ""
            }`}
          />
        ) : (
          <div className="grid size-full place-items-center">
            <img src="/logo-mark.png" alt="" className="size-14 opacity-40 min-[560px]:size-20" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/25 to-transparent" />

        {product.bestseller && (
          <span className="text-eyebrow absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-maroon/90 px-2 py-1 text-[11px] tracking-[0.12em] text-saffron backdrop-blur min-[560px]:left-2.5 min-[560px]:top-2.5 min-[560px]:px-2.5 min-[560px]:py-1.5 min-[560px]:text-[11px]">
            ★ <span className="hidden min-[560px]:inline">{tr("Bestseller", "বেস্টসেলার")}</span>
            <span className="min-[560px]:hidden">{tr("Top", "সেরা")}</span>
          </span>
        )}
        {isSoldOut && (
          <span className="text-eyebrow absolute inset-x-1.5 bottom-1.5 rounded-full bg-charcoal/85 px-2 py-1 text-center text-[10px] text-white backdrop-blur min-[560px]:inset-x-auto min-[560px]:bottom-auto min-[560px]:right-2.5 min-[560px]:top-2.5 min-[560px]:px-2.5 min-[560px]:py-1.5 min-[560px]:text-[11px]">
            {tr("Sold Out", "শেষ")}
          </span>
        )}
        {product.portionSize && !isSoldOut && (
          <span className="absolute bottom-2.5 left-2.5 hidden rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-charcoal backdrop-blur min-[560px]:inline">
            {portionName(product.portionSize, lang)}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col py-0.5 pr-0.5 min-[560px]:px-2 min-[560px]:pb-1.5 min-[560px]:pt-4">
        <h3 className="text-display line-clamp-2 text-[1.05rem] leading-snug min-[560px]:text-[1.2rem]">{name}</h3>
        <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-slate min-[560px]:mt-1.5 min-[560px]:text-sm">
          {dishDescription(product.name, product.description, lang)}
        </p>

        {isLowStock && (
          <p className="mt-2 flex items-center gap-2 rounded-lg bg-chili-light px-2.5 py-1.5 text-xs font-semibold text-chili min-[560px]:mt-3">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-chili opacity-75"></span>
              <span className="relative inline-flex size-2 rounded-full bg-chili"></span>
            </span>
            {tr(`Only ${product.remainingPortions} left today`, `আজ মাত্র ${num(product.remainingPortions ?? 0)}টি বাকি`)}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-2.5 min-[560px]:gap-3 min-[560px]:pt-4">
          <div className="leading-none">
            {product.basePriceBdt !== undefined && product.basePriceBdt > product.price && (
              <span className="mb-1 block text-xs text-slate line-through">
                ৳{num(product.basePriceBdt)}
              </span>
            )}
            <span className="text-display text-xl text-brand min-[560px]:text-2xl">
              <span className="mr-0.5 text-lg">৳</span>
              {num(product.price)}
            </span>
          </div>
          <button
            type="button"
            disabled={isSoldOut}
            onClick={handleAdd}
            aria-label={
              isSoldOut
                ? tr(`${product.name} is sold out`, `${name} শেষ হয়ে গেছে`)
                : tr(`Add ${product.name} to cart`, `${name} কার্টে যোগ করুন`)
            }
            className={`inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full px-3.5 text-sm font-bold min-[560px]:h-11 min-[560px]:px-4 transition active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30 ${
              isSoldOut
                ? "cursor-not-allowed bg-cream text-slate"
                : justAdded
                  ? "bg-gold-light text-gold ring-1 ring-gold/50"
                  : "bg-brand text-white hover:bg-brand-hover hover:shadow-[0_10px_22px_-10px_rgba(168,20,31,0.9)]"
            }`}
          >
            {isSoldOut ? (
              tr("Sold Out", "শেষ")
            ) : justAdded ? (
              tr("Added ✓", "যোগ হয়েছে ✓")
            ) : (
              <>
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden>
                  <path d="M12 5v14M5 12h14" />
                </svg>
                {tr("Add", "যোগ করুন")}
                <span className="hidden min-[560px]:inline">{tr(" to Cart", "")}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  )
}
