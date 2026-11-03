import { dayLabelBn, formatBdt, matchesSearch, toBengaliNumber } from "../utils/bengali"
import React, { useEffect, useRef } from "react"

export type SearchableDish = {
  id: string | number
  name: string
  description?: string
  price: number
  image?: string
  day?: string
  categoryName?: string
  bestseller?: boolean
}

type Props = {
  isOpen: boolean
  onClose: () => void
  query: string
  dishes: SearchableDish[]
  onSelectDish: (dish: SearchableDish) => void
  onExecuteSearch: (query: string) => void
  containerRef?: React.RefObject<HTMLElement | null>
}

const POPULAR_SEARCH_PILLS = [
  "কাচ্চি বিরিয়ানি",
  "বিফ তেহারি",
  "মোরগ পোলাও",
  "বোরহানি",
  "চিকেন রোস্ট",
  "জালি কাবাব",
  "খিচুড়ি",
  "ফিরনি",
]

export function SearchRecommendationPopup({
  isOpen,
  onClose,
  query,
  dishes,
  onSelectDish,
  onExecuteSearch,
  containerRef,
}: Props) {
  const popupRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node
      if (
        popupRef.current &&
        !popupRef.current.contains(target) &&
        (!containerRef?.current || !containerRef.current.contains(target))
      ) {
        onClose()
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const cleanQuery = query.trim().toLowerCase()

  // Filter dishes
  const filteredDishes = cleanQuery
    ? dishes.filter(
        (d) =>
          matchesSearch(d.name, cleanQuery) ||
          matchesSearch(d.description, cleanQuery) ||
          matchesSearch(d.categoryName, cleanQuery),
      )
    : dishes.slice(0, 5) // Top 5 recommended when empty

  return (
    <div
      ref={popupRef}
      className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[420px] overflow-hidden rounded-2xl border border-line bg-white shadow-2xl transition-all animate-in fade-in duration-150"
      role="dialog"
      aria-label="খোঁজার পরামর্শ"
    >
      <div className="max-h-[410px] overflow-y-auto p-3 space-y-3">
        {/* If query has text, show "Search for exact query" action at top */}
        {cleanQuery.length > 0 && (
          <button
            type="button"
            onClick={() => {
              onExecuteSearch(query)
              onClose()
            }}
            className="flex w-full items-center justify-between rounded-xl bg-[#D7232B]/5 border border-[#D7232B]/30 p-2.5 text-left text-xs font-semibold text-[#D7232B] transition hover:bg-[#D7232B]/10 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="grid size-6 place-items-center rounded-full bg-[#D7232B] text-white">
                <svg
                  className="size-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm9 2-3.5-3.5" />
                </svg>
              </span>
              <span>
                মেনুতে "<span className="underline font-bold">{query}</span>" খুঁজুন
              </span>
            </div>
            <span className="text-[11px] font-bold">ফলাফলে যান →</span>
          </button>
        )}

        {/* Quick search pills when query is empty */}
        {!cleanQuery && (
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate mb-1.5 px-1">
              🔥 জনপ্রিয় খাবার ও খোঁজ
            </span>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_SEARCH_PILLS.map((pill) => (
                <button
                  key={pill}
                  type="button"
                  onClick={() => {
                    onExecuteSearch(pill)
                    onClose()
                  }}
                  className="rounded-full border border-line bg-alabaster px-2.5 py-1 text-xs text-charcoal transition hover:border-[#D7232B] hover:bg-[#D7232B]/10 hover:text-[#D7232B] cursor-pointer"
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Dishes List */}
        <div>
          <div className="flex items-center justify-between px-1 pb-1.5 pt-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate">
              {cleanQuery
                ? `প্রস্তাবিত খাবার (${toBengaliNumber(filteredDishes.length)})`
                : "জনপ্রিয় খাবার"}
            </span>
            <span className="text-[10px] font-semibold text-[#D7232B]">বাংলার বিরিয়ানি</span>
          </div>

          {filteredDishes.length > 0 ? (
            <div className="space-y-1">
              {filteredDishes.map((dish) => (
                <button
                  key={dish.id}
                  type="button"
                  onClick={() => {
                    onSelectDish(dish)
                    onClose()
                  }}
                  className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-alabaster group cursor-pointer"
                >
                  {/* Dish Thumbnail */}
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-slate/10">
                    {dish.image ? (
                      <img
                        src={dish.image}
                        alt={dish.name}
                        className="size-full object-cover transition group-hover:scale-105"
                      />
                    ) : (
                      <div className="grid size-full place-items-center text-xs font-bold text-[#D7232B]">
                        BB
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-xs font-bold text-charcoal group-hover:text-[#D7232B] transition-colors">
                        {dish.name}
                      </span>
                      {dish.day && (
                        <span className="rounded-full bg-slate/10 px-1.5 py-0.2 text-[9px] font-semibold text-slate">
                          {dayLabelBn(dish.day)}
                        </span>
                      )}
                    </div>
                    {dish.description && (
                      <p className="truncate text-[11px] text-slate">{dish.description}</p>
                    )}
                  </div>

                  {/* Price & Action */}
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-[#D7232B]">
                      {formatBdt(dish.price)}
                    </span>
                    <span className="block text-[10px] text-slate group-hover:text-charcoal transition-colors">
                      দেখুন →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center">
              <p className="text-xs text-slate">
                "{query}" এর সাথে মিলে এমন খাবার নেই। "কাচ্চি", "তেহারি" বা "বোরহানি" লিখে দেখুন।
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
