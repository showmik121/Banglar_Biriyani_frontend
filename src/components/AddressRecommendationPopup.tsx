import { addressLabelBn, toBengaliNumber } from "../utils/bengali"
import React, { useState, useEffect, useRef } from "react"
import { useAddress } from "../context/AddressContext"
import { searchRecommendations, type RecommendationItem } from "../data/dhakaRecommendations"

type Props = {
  isOpen: boolean
  onClose: () => void
  onOpenDetailedModal: () => void
}

const Icon = ({ d, className = "size-5" }: { d: string; className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d={d} />
  </svg>
)

const ICONS = {
  pin: "M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12Zm0-9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm9 2-3.5-3.5",
  close: "M18 6 6 18M6 6l12 12",
  sparkles:
    "m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z",
  edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  home: "m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  briefcase:
    "M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16 M2 7h20v13a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7Z",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-14v6l4 2",
}

export function AddressRecommendationPopup({ isOpen, onClose, onOpenDetailedModal }: Props) {
  const { addresses, selectedAddress, selectAddress, setFreeformAddress } = useAddress()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<RecommendationItem[]>(() => searchRecommendations(""))
  const popupRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus search input when popup opens
  useEffect(() => {
    if (isOpen) {
      setQuery("")
      setResults(searchRecommendations(""))
      setTimeout(() => inputRef.current?.focus(), 60)
    }
  }, [isOpen])

  // Handle outside click & escape
  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
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

  // Handle live search
  const handleQueryChange = (val: string) => {
    setQuery(val)
    setResults(searchRecommendations(val))
  }

  const handleSelectRecommendation = (item: RecommendationItem) => {
    setFreeformAddress(item.details, item.zone)
    onClose()
  }

  const handleSelectCustomQuery = () => {
    if (query.trim()) {
      setFreeformAddress(query.trim(), "Delivery")
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Subtle backdrop overlay for focus on mobile/tablet */}
      <div
        className="fixed inset-0 z-40 bg-black/25 backdrop-blur-xs md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={popupRef}
        className="absolute left-1/2 top-full z-50 mt-2 w-[calc(100vw-32px)] max-w-md -translate-x-1/2 overflow-hidden rounded-2xl border border-line bg-white shadow-2xl transition-all animate-in fade-in duration-150 sm:w-[440px]"
        role="dialog"
        aria-label="ঠিকানার পরামর্শ"
      >
        {/* Header / Search Input */}
        <div className="border-b border-line p-3.5 bg-alabaster/40">
          <div className="relative flex items-center">
            <Icon
              d={ICONS.search}
              className="pointer-events-none absolute left-3 size-4 text-slate"
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  if (results.length > 0) {
                    handleSelectRecommendation(results[0])
                  } else {
                    handleSelectCustomQuery()
                  }
                }
              }}
              placeholder="এলাকা, রোড খুঁজুন বা যেকোনো ঠিকানা লিখুন..."
              className="w-full rounded-xl border border-line bg-white py-2.5 pl-9 pr-8 text-sm text-charcoal outline-none transition focus:border-[#E4002B] focus:ring-2 focus:ring-[#E4002B]/20"
            />
            {query && (
              <button
                type="button"
                onClick={() => handleQueryChange("")}
                className="absolute right-2.5 text-slate/60 hover:text-charcoal p-1"
                aria-label="খোঁজা মুছে ফেলুন"
              >
                <Icon d={ICONS.close} className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Recommendations Body */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-3">
          {/* If query has text, show instant "Deliver to exact custom text" option */}
          {query.trim().length > 0 && (
            <button
              type="button"
              onClick={handleSelectCustomQuery}
              className="flex w-full items-center gap-3 rounded-xl border border-[#E4002B]/30 bg-[#E4002B]/5 p-3 text-left transition hover:bg-[#E4002B]/10 cursor-pointer"
            >
              <div className="grid size-8 shrink-0 place-items-center rounded-full bg-[#E4002B] text-white">
                <Icon d={ICONS.pin} className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-[#E4002B]">
                  হুবহু এই ঠিকানা ব্যবহার করুন
                </span>
                <p className="truncate text-sm font-medium text-charcoal">"{query}"</p>
              </div>
              <span className="rounded-full bg-[#E4002B] px-2.5 py-1 text-[11px] font-bold text-white">
                এখানে ডেলিভারি দিন
              </span>
            </button>
          )}

          {/* Saved Addresses Section (if available & query is empty) */}
          {!query && addresses.length > 0 && (
            <div>
              <div className="px-2 pb-1.5 pt-1 text-[11px] font-bold uppercase tracking-wider text-slate">
                আপনার সংরক্ষিত ঠিকানা
              </div>
              <div className="space-y-1">
                {addresses.map((addr) => {
                  const isSelected = selectedAddress?.id === addr.id
                  return (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => {
                        selectAddress(addr.id)
                        onClose()
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition cursor-pointer ${
                        isSelected
                          ? "bg-[#E4002B]/10 border border-[#E4002B]/30"
                          : "hover:bg-alabaster"
                      }`}
                    >
                      <div
                        className={`grid size-7 shrink-0 place-items-center rounded-full text-xs ${
                          isSelected ? "bg-[#E4002B] text-white" : "bg-slate/10 text-slate"
                        }`}
                      >
                        {addr.label === "Work" ? (
                          <Icon d={ICONS.briefcase} className="size-3.5" />
                        ) : (
                          <Icon d={ICONS.home} className="size-3.5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-charcoal">
                            {addressLabelBn(addr.label)}
                          </span>
                          <span className="text-[10px] text-slate font-medium">{addr.area}</span>
                          {isSelected && (
                            <span className="text-[10px] font-bold text-[#E4002B]">• সক্রিয়</span>
                          )}
                        </div>
                        <p className="truncate text-xs text-slate">{addr.details}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Recommendations List */}
          <div>
            <div className="flex items-center justify-between px-2 pb-1.5 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate">
                {query ? `প্রস্তাবিত ঠিকানা (${toBengaliNumber(results.length)})` : "জনপ্রিয় ডেলিভারি এলাকা"}
              </span>
              <span className="flex items-center gap-1 text-[10px] font-semibold text-[#E4002B]">
                <Icon d={ICONS.sparkles} className="size-3" />
                ঢাকা
              </span>
            </div>

            {results.length > 0 ? (
              <div className="space-y-1">
                {results.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectRecommendation(item)}
                    className="flex w-full items-start gap-3 rounded-xl p-2.5 text-left transition hover:bg-alabaster group cursor-pointer"
                  >
                    <div className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-[#E4002B]/10 text-[#E4002B] group-hover:bg-[#E4002B] group-hover:text-white transition-colors">
                      <Icon d={ICONS.pin} className="size-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-charcoal group-hover:text-[#E4002B] transition-colors">
                          {item.name}
                        </span>
                        {item.tag && (
                          <span className="rounded-full bg-slate/10 px-1.5 py-0.2 text-[9px] font-medium text-slate">
                            {item.tag}
                          </span>
                        )}
                      </div>
                      <p className="truncate text-xs text-slate">{item.details}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center">
                <p className="text-xs text-slate">
                  মিলে এমন কোনো ঠিকানা পাওয়া যায়নি। আপনার ঠিকানা সেট করতে উপরের "হুবহু এই ঠিকানা ব্যবহার করুন" এ
                  ক্লিক করুন!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer / Detailed Form Trigger */}
        <div className="border-t border-line bg-alabaster/60 p-2.5 text-center">
          <button
            type="button"
            onClick={() => {
              onClose()
              onOpenDetailedModal()
            }}
            className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[#E4002B] hover:underline cursor-pointer"
          >
            <Icon d={ICONS.edit} className="size-3.5" />+ ফ্ল্যাট, তলা ও ডেলিভারি নির্দেশনাসহ পুরো ঠিকানা লিখুন
          </button>
        </div>
      </div>
    </>
  )
}
