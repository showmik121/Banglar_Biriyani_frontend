import { addressLabelBn } from "../utils/bengali"
import React, { useState, useEffect, useMemo, type FormEvent } from "react"
import { useAddress, POPULAR_DHAKA_AREAS } from "../context/AddressContext"
import { searchRecommendations } from "../data/dhakaRecommendations"
import { useBodyScrollLock } from "../hooks/useBodyScrollLock"

type Props = {
  isOpen: boolean
  onClose: () => void
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
  home: "m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  briefcase:
    "M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16 M2 7h20v13a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7Z",
  close: "M18 6 6 18M6 6l12 12",
  plus: "M12 5v14M5 12h14",
  check: "M20 6 9 17l-5-5",
  trash: "M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",
  edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  sparkles:
    "m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z",
}

export function AddressModal({ isOpen, onClose }: Props) {
  const {
    addresses,
    selectedAddress,
    selectAddress,
    addAddress,
    setFreeformAddress,
    deleteAddress,
  } = useAddress()

  // Free-form address text state
  const [addressInput, setAddressInput] = useState("")
  const [tag, setTag] = useState<"Home" | "Work" | "Other">("Home")
  const [showDetailedFields, setShowDetailedFields] = useState(false)
  const [phone, setPhone] = useState("01711234567")
  const [instructions, setInstructions] = useState("")
  const [error, setError] = useState<string | null>(null)

  useBodyScrollLock(isOpen)

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [isOpen, onClose])

  // Live recommendations matching what the user is typing
  const liveRecommendations = useMemo(() => {
    if (!addressInput.trim() || addressInput.trim().length < 2) return []
    return searchRecommendations(addressInput).slice(0, 3)
  }, [addressInput])

  // Sync current active address when modal opens
  useEffect(() => {
    if (isOpen) {
      if (selectedAddress) {
        setAddressInput(selectedAddress.details)
        setTag(
          selectedAddress.label === "Home" || selectedAddress.label === "Work"
            ? selectedAddress.label
            : "Other",
        )
        if (selectedAddress.contactPhone) setPhone(selectedAddress.contactPhone)
        if (selectedAddress.instructions) setInstructions(selectedAddress.instructions)
      } else {
        setAddressInput("")
      }
      setError(null)
    }
  }, [isOpen, selectedAddress])

  if (!isOpen) return null

  const handleAppendArea = (area: string) => {
    setError(null)
    if (!addressInput.trim()) {
      setAddressInput(`${area}, ঢাকা`)
    } else if (!addressInput.toLowerCase().includes(area.toLowerCase())) {
      setAddressInput(`${addressInput.trim()}, ${area}`)
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmed = addressInput.trim()
    if (!trimmed) {
      setError("আপনার ডেলিভারি ঠিকানা লিখুন।")
      return
    }

    if (trimmed.length < 5) {
      setError("আরও বিস্তারিত ঠিকানা দিন (কমপক্ষে ৫ অক্ষর)।")
      return
    }

    if (showDetailedFields) {
      // Save with full detailed parameters
      addAddress({
        label: tag,
        area:
          POPULAR_DHAKA_AREAS.find((a) => trimmed.toLowerCase().includes(a.toLowerCase())) || "ঢাকা",
        details: trimmed,
        contactPhone: phone.trim() || undefined,
        instructions: instructions.trim() || undefined,
        isDefault: true,
      })
    } else {
      // Direct freeform save
      setFreeformAddress(trimmed, tag)
    }

    onClose()
  }

  const handleEditAddress = (addr: any) => {
    setAddressInput(addr.details)
    setTag(addr.label === "Home" || addr.label === "Work" ? addr.label : "Other")
    if (addr.contactPhone) setPhone(addr.contactPhone)
    if (addr.instructions) {
      setInstructions(addr.instructions)
      setShowDetailedFields(true)
    }
  }

  const getTagIcon = (t: string) => {
    if (t === "Home") return <Icon d={ICONS.home} className="size-4" />
    if (t === "Work") return <Icon d={ICONS.briefcase} className="size-4" />
    return <Icon d={ICONS.pin} className="size-4" />
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs transition-opacity duration-200"
      aria-modal="true"
      role="dialog"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-full bg-[#E4002B]/10 text-[#E4002B]">
              <Icon d={ICONS.pin} className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-charcoal sm:text-lg">ডেলিভারি ঠিকানা</h2>
              <p className="text-xs text-slate">
                নিজের মতো ঠিকানা লিখুন অথবা সংরক্ষিত ঠিকানা থেকে বেছে নিন
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-full text-slate transition hover:bg-alabaster hover:text-charcoal cursor-pointer"
            aria-label="বন্ধ করুন"
          >
            <Icon d={ICONS.close} className="size-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Main Free-Form Address Input Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal">
                  আপনার ঠিকানা লিখুন *
                </label>
                <span className="text-[11px] text-slate">যেকোনো ঠিকানা লিখতে পারেন</span>
              </div>

              <div className="relative">
                <textarea
                  rows={2}
                  value={addressInput}
                  onChange={(e) => {
                    setAddressInput(e.target.value)
                    if (error) setError(null)
                  }}
                  placeholder="যেমন: রোড ২৭, বাসা ৪৫, ফ্ল্যাট ৪বি, ধানমন্ডি, ঢাকা (বা অন্য যেকোনো ঠিকানা)..."
                  className="w-full rounded-xl border border-line bg-white p-3.5 text-sm text-charcoal placeholder:text-slate/60 shadow-xs transition focus:border-[#E4002B] focus:outline-none focus:ring-2 focus:ring-[#E4002B]/20"
                  autoFocus
                />
                {addressInput && (
                  <button
                    type="button"
                    onClick={() => setAddressInput("")}
                    className="absolute right-3 top-3 text-slate/50 hover:text-charcoal p-1"
                    title="ঠিকানা মুছে ফেলুন"
                  >
                    <Icon d={ICONS.close} className="size-3.5" />
                  </button>
                )}
              </div>

              {/* Live matching recommendations popup */}
              {liveRecommendations.length > 0 && (
                <div className="mt-2 rounded-xl border border-[#E4002B]/30 bg-[#FFF0F3] p-2.5 space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#E4002B]">
                      ✨ "{addressInput}" এর জন্য প্রস্তাবিত ঠিকানা:
                    </span>
                    <span className="text-[10px] text-slate">বেছে নিতে ক্লিক করুন</span>
                  </div>
                  <div className="space-y-1">
                    {liveRecommendations.map((rec) => (
                      <button
                        key={rec.id}
                        type="button"
                        onClick={() => setAddressInput(rec.details)}
                        className="flex w-full items-center justify-between rounded-lg bg-white p-2 text-left text-xs transition hover:border-[#E4002B] hover:shadow-xs border border-transparent cursor-pointer"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-charcoal">{rec.name}</span>
                          <span className="block truncate text-[11px] text-slate">
                            {rec.details}
                          </span>
                        </div>
                        <span className="ml-2 rounded-full bg-[#E4002B]/10 px-2 py-0.5 text-[10px] font-bold text-[#E4002B] shrink-0">
                          এটি ব্যবহার করুন
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {error && <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
            </div>

            {/* Quick-Click Area Chips to append with 1 tap */}
            <div>
              <span className="block text-[11px] font-semibold text-slate mb-1.5">
                দ্রুত এলাকা যোগ করুন (ক্লিক করুন):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_DHAKA_AREAS.slice(0, 10).map((areaName) => (
                  <button
                    key={areaName}
                    type="button"
                    onClick={() => handleAppendArea(areaName)}
                    className="rounded-full border border-line/80 bg-alabaster px-2.5 py-1 text-xs text-charcoal transition hover:border-[#E4002B] hover:bg-[#E4002B]/10 hover:text-[#E4002B] cursor-pointer"
                  >
                    + {areaName}
                  </button>
                ))}
              </div>
            </div>

            {/* Address Tag Selector */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs font-semibold text-slate">ট্যাগ:</span>
              {(["Home", "Work", "Other"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTag(t)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                    tag === t
                      ? "bg-[#E4002B] text-white"
                      : "bg-alabaster text-charcoal hover:bg-slate/15"
                  }`}
                >
                  {getTagIcon(t)}
                  {addressLabelBn(t)}
                </button>
              ))}
            </div>

            {/* Expandable Detailed Options Toggle */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowDetailedFields((prev) => !prev)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E4002B] hover:underline cursor-pointer"
              >
                <Icon d={showDetailedFields ? ICONS.close : ICONS.plus} className="size-3.5" />
                {showDetailedFields ? "অতিরিক্ত তথ্য লুকান" : "ফোন ও ডেলিভারি নির্দেশনা যোগ করুন (ঐচ্ছিক)"}
              </button>

              {showDetailedFields && (
                <div className="mt-3 space-y-3 rounded-xl border border-line/70 bg-alabaster/50 p-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-charcoal mb-1">
                      যোগাযোগের ফোন
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full rounded-lg border border-line bg-white px-3 py-2 text-xs text-charcoal outline-none focus:border-[#E4002B]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-charcoal mb-1">
                      ডেলিভারি নির্দেশনা
                    </label>
                    <input
                      type="text"
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      placeholder="যেমন: সিকিউরিটি গার্ডের কাছে রাখবেন, আসার আগে ফোন করবেন..."
                      className="w-full rounded-lg border border-line bg-white px-3 py-2 text-xs text-charcoal outline-none focus:border-[#E4002B]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              className="w-full rounded-full bg-[#E4002B] py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#B80022] active:scale-[0.99] cursor-pointer"
            >
              ✓ আমার ডেলিভারি ঠিকানা হিসেবে সেট করুন
            </button>
          </form>

          {/* Saved Addresses Section */}
          {addresses.length > 0 && (
            <div className="border-t border-line pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate">
                  সংরক্ষিত ঠিকানা ({addresses.length})
                </span>
                <span className="text-[11px] text-slate">বেছে নিতে ক্লিক করুন</span>
              </div>

              <div className="space-y-2.5">
                {addresses.map((addr) => {
                  const isSelected = selectedAddress?.id === addr.id
                  return (
                    <div
                      key={addr.id}
                      onClick={() => selectAddress(addr.id)}
                      className={`group relative flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition ${
                        isSelected
                          ? "border-[#E4002B] bg-[#E4002B]/5 ring-2 ring-[#E4002B]/20"
                          : "border-line bg-white hover:border-slate/40 hover:bg-alabaster/40"
                      }`}
                    >
                      <div
                        className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-full ${
                          isSelected
                            ? "bg-[#E4002B] text-white"
                            : "bg-alabaster text-slate group-hover:text-charcoal"
                        }`}
                      >
                        {getTagIcon(addr.label)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-charcoal">
                            {addressLabelBn(addr.label)}
                          </span>
                          <span className="rounded-full bg-slate/10 px-2 py-0.5 text-[10px] font-medium text-slate">
                            {addr.area}
                          </span>
                          {isSelected && (
                            <span className="rounded-full bg-[#E4002B] px-2 py-0.2 text-[10px] font-bold text-white">
                              সক্রিয়
                            </span>
                          )}
                        </div>

                        <p className="mt-0.5 text-xs leading-relaxed text-charcoal">
                          {addr.details}
                        </p>

                        {addr.instructions && (
                          <p className="mt-0.5 text-[11px] text-slate italic">
                            নোট: {addr.instructions}
                          </p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 self-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditAddress(addr)
                          }}
                          className="rounded-lg p-1.5 text-slate transition hover:bg-slate/10 hover:text-charcoal cursor-pointer"
                          title="এই ঠিকানা সম্পাদনা করুন"
                        >
                          <Icon d={ICONS.edit} className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteAddress(addr.id)
                          }}
                          className="rounded-lg p-1.5 text-slate transition hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                          title="এই ঠিকানা মুছে ফেলুন"
                        >
                          <Icon d={ICONS.trash} className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
