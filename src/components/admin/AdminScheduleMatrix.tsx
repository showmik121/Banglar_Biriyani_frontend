import { dayLabelBn, formatBdt, toBengaliNumber } from "../../utils/bengali"
import { useState, useEffect, useCallback, useMemo } from "react"

const DAYS_OF_WEEK = [
  "SATURDAY",
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
] as const

type DayOfWeek = (typeof DAYS_OF_WEEK)[number]

interface CatalogItem {
  id: number
  name: string
  description: string
  basePriceBdt: number
  imageUrl: string
  portionSize: string
  spiceLevel: string
  rating: string
  isEveryday: boolean
  isAvailable: boolean
  categoryId: number
  categoryName: string
}

interface ScheduleEntry {
  id?: number
  menuItemId: number
  dayOfWeek?: string
  specialPriceBdt: number | null
  dailyQuota: number
  soldCount: number
  isFeatured: boolean
  item: CatalogItem
}

export function AdminScheduleMatrix() {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>("SATURDAY")
  const [scheduleDays, setScheduleDays] = useState<Record<string, ScheduleEntry[]>>({})
  const [menuCatalog, setMenuCatalog] = useState<CatalogItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [notification, setNotification] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  // Local editable working copy for the active day
  const [currentDayItems, setCurrentDayItems] = useState<ScheduleEntry[]>([])

  // Modal for adding dishes from catalog
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [catalogSearch, setCatalogSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL")

  // Fetch full schedule & catalog from backend
  const fetchSchedule = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/admin/schedule", { credentials: "include" })
      if (!res.ok) throw new Error("৭ দিনের শিডিউল লোড করা যায়নি")
      const json = await res.json()
      const data = json.data
      setScheduleDays(data.days || {})
      setMenuCatalog(data.menuCatalog || [])

      // Set initial editable items for current selected day
      if (data.days && data.days[selectedDay]) {
        setCurrentDayItems([...data.days[selectedDay]])
      }
    } catch (err) {
      console.error("Error fetching schedule:", err)
      setNotification({
        type: "error",
        message: err instanceof Error ? err.message : "শিডিউল লোড করা যায়নি",
      })
    } finally {
      setIsLoading(false)
    }
  }, [selectedDay])

  useEffect(() => {
    fetchSchedule()
  }, [])

  // When switching days, update currentDayItems from scheduleDays
  const handleSelectDay = (day: DayOfWeek) => {
    setSelectedDay(day)
    if (scheduleDays[day]) {
      setCurrentDayItems([...scheduleDays[day]])
    } else {
      setCurrentDayItems([])
    }
  }

  // Update specific item in currentDayItems
  const updateItem = (index: number, updates: Partial<ScheduleEntry>) => {
    setCurrentDayItems((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], ...updates }
      return copy
    })
  }

  // Remove item from currentDayItems
  const removeItem = (index: number) => {
    setCurrentDayItems((prev) => prev.filter((_, i) => i !== index))
  }

  // Add item from catalog to current day
  const handleAddItemFromCatalog = (item: CatalogItem) => {
    // Check if item already exists on this day
    if (currentDayItems.some((e) => e.menuItemId === item.id)) {
      setNotification({
        type: "error",
        message: `"${item.name}" ইতিমধ্যে ${dayLabelBn(selectedDay)} এ যুক্ত আছে।`,
      })
      setTimeout(() => setNotification(null), 3000)
      return
    }

    const newEntry: ScheduleEntry = {
      menuItemId: item.id,
      specialPriceBdt: null,
      dailyQuota: 50,
      soldCount: 0,
      isFeatured: false,
      item,
    }

    setCurrentDayItems((prev) => [...prev, newEntry])
    setIsAddModalOpen(false)
    setNotification({
      type: "success",
      message: `"${item.name}" ${dayLabelBn(selectedDay)} এ যুক্ত হয়েছে। পরিবর্তন সংরক্ষণ করতে ভুলবেন না!`,
    })
    setTimeout(() => setNotification(null), 3500)
  }

  // Save currentDayItems to backend (PUT /api/admin/schedule/:day)
  const handleSaveSchedule = async () => {
    try {
      setIsSaving(true)
      const payload = {
        assignments: currentDayItems.map((e) => ({
          menuItemId: e.menuItemId,
          specialPriceBdt:
            e.specialPriceBdt && e.specialPriceBdt > 0 ? Number(e.specialPriceBdt) : null,
          dailyQuota: Number(e.dailyQuota) || 50,
          isFeatured: Boolean(e.isFeatured),
        })),
      }

      const res = await fetch(`/api/admin/schedule/${selectedDay}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(
          body?.error?.message || `${dayLabelBn(selectedDay)} এর শিডিউল সংরক্ষণ করা যায়নি`,
        )
      }

      // Update scheduleDays in cache
      setScheduleDays((prev) => ({
        ...prev,
        [selectedDay]: [...currentDayItems],
      }))

      // Notify other views (including storefront menu listeners)
      window.dispatchEvent(
        new CustomEvent("banglar-biriyani:schedule-updated", {
          detail: { day: selectedDay },
        }),
      )

      setNotification({
        type: "success",
        message: `${dayLabelBn(selectedDay)} এর শিডিউল সফলভাবে সংরক্ষিত হয়েছে!`,
      })
      setTimeout(() => setNotification(null), 4000)
    } catch (err) {
      console.error("Save schedule error:", err)
      setNotification({
        type: "error",
        message: err instanceof Error ? err.message : "শিডিউল সংরক্ষণে সমস্যা হয়েছে",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Categories list for modal filter
  const categoriesList = useMemo(() => {
    const set = new Set<string>()
    menuCatalog.forEach((item) => {
      if (item.categoryName) set.add(item.categoryName)
    })
    return Array.from(set)
  }, [menuCatalog])

  // Filtered catalog in modal
  const filteredCatalog = useMemo(() => {
    const q = catalogSearch.toLowerCase().trim()
    return menuCatalog.filter((item) => {
      const matchesSearch =
        !q || item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
      const matchesCategory = selectedCategory === "ALL" || item.categoryName === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [menuCatalog, catalogSearch, selectedCategory])

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-3">
        <div className="size-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#E4002B]" />
        <p className="text-xs font-semibold text-slate-500">৭ দিনের মিল শিডিউল লোড হচ্ছে...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          role="alert"
          className={`flex items-center justify-between rounded-xl p-4 text-xs font-semibold shadow-lg transition ${
            notification.type === "success"
              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border border-rose-500/30 bg-rose-500/10 text-rose-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <svg
                className="size-4 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            ) : (
              <svg
                className="size-4 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Flagship Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#FFF0F3] px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#E4002B] border border-[#E4002B]/20">
                প্রধান নিয়ন্ত্রণ
              </span>
              <span className="text-xs text-slate-500">রিয়েল-টাইম কিচেন সিঙ্ক</span>
            </div>
            <h2 className="mt-1 font-display text-xl font-bold text-slate-900 sm:text-2xl">
              ৭ দিনের বিরিয়ানি ও দৈনিক মিল শিডিউল
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              সপ্তাহের প্রতিটি দিনের স্পেশাল, কোটা ও প্রমোশনাল মূল্য নিয়ন্ত্রণ করুন।
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 shadow-xs transition hover:border-[#E4002B] hover:bg-[#FFF0F3] hover:text-[#E4002B] cursor-pointer"
            >
              <svg
                className="size-4 text-[#E4002B]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>{dayLabelBn(selectedDay)} এ খাবার যুক্ত করুন</span>
            </button>

            <button
              type="button"
              onClick={handleSaveSchedule}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#E4002B] px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-[#E4002B]/25 transition hover:bg-[#B80022] active:scale-[0.98] disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4002B]"
            >
              {isSaving ? (
                <>
                  <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>সংরক্ষণ হচ্ছে...</span>
                </>
              ) : (
                <>
                  <svg
                    className="size-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  <span>{dayLabelBn(selectedDay)} এর শিডিউল সংরক্ষণ করুন</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 7-Day Pill Bar */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-200 pt-4">
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = selectedDay === day
            const itemCount = scheduleDays[day]?.length || 0

            return (
              <button
                key={day}
                type="button"
                onClick={() => handleSelectDay(day)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#E4002B] text-white shadow-md shadow-[#E4002B]/30"
                    : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                }`}
              >
                <span>{dayLabelBn(day)}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  {toBengaliNumber(itemCount)}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Schedule Items for Selected Day */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-white">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900">
              {dayLabelBn(selectedDay)} এর নির্ধারিত খাবার ({toBengaliNumber(currentDayItems.length)}টি
              আইটেম)
            </h3>
            <p className="text-xs text-slate-500">
              দৈনিক কোটা, স্পেশাল প্রমো মূল্য ও বেস্টসেলার ব্যাজ ঠিক করুন।
            </p>
          </div>
          <span className="text-xs text-slate-500">স্পেশাল মূল্য খালি থাকলে মূল মূল্য প্রযোজ্য হবে।</span>
        </div>

        {currentDayItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50">
            <div className="grid size-12 place-items-center rounded-2xl bg-white border border-slate-200 text-slate-400 shadow-xs">
              <svg
                className="size-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect width="18" height="18" x="3" y="4" rx="2" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
              </svg>
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-800">
              {dayLabelBn(selectedDay)} এ এখনো কোনো খাবার যুক্ত হয়নি
            </p>
            <p className="mt-1 text-xs text-slate-500">
              নিচে ক্লিক করে মেনু ক্যাটালগ থেকে খাবার বেছে {dayLabelBn(selectedDay)} এর শিডিউলে যুক্ত করুন।
            </p>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 rounded-xl bg-[#E4002B] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#B80022] cursor-pointer"
            >
              + ক্যাটালগ থেকে খাবার যুক্ত করুন
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 uppercase tracking-wider text-slate-600">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    খাবারের নাম
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    ক্যাটাগরি
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    মূল মূল্য
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    স্পেশাল মূল্য (৳)
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    দৈনিক কোটা
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    কোটার অগ্রগতি
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold text-center">
                    ফিচার্ড
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold text-right">
                    অ্যাকশন
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {currentDayItems.map((entry, index) => {
                  const sold = entry.soldCount || 0
                  const quota = entry.dailyQuota || 50
                  const percentSold = Math.min(Math.round((sold / quota) * 100), 100)

                  return (
                    <tr
                      key={`${entry.menuItemId}-${index}`}
                      className="transition hover:bg-slate-50/80"
                    >
                      {/* Dish Name & Image */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={entry.item.imageUrl}
                            alt=""
                            className="size-10 rounded-lg object-cover bg-slate-100 border border-slate-200"
                            loading="lazy"
                          />
                          <div>
                            <p className="font-semibold text-slate-900">{entry.item.name}</p>
                            <p className="text-[11px] text-slate-500">
                              পোর্শন: {entry.item.portionSize || "1:1"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-3.5">
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700 border border-slate-200">
                          {entry.item.categoryName}
                        </span>
                      </td>

                      {/* Base Price */}
                      <td className="px-5 py-3.5 font-mono text-slate-500">
                        {formatBdt(entry.item.basePriceBdt)}
                      </td>

                      {/* Special Price Inline Input */}
                      <td className="px-5 py-3.5">
                        <div className="relative w-28">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono">
                            ৳
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={entry.specialPriceBdt ?? ""}
                            onChange={(e) => {
                              const val = e.target.value === "" ? null : Number(e.target.value)
                              updateItem(index, { specialPriceBdt: val })
                            }}
                            placeholder={String(entry.item.basePriceBdt)}
                            className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-6 pr-2 font-mono text-xs text-slate-900 placeholder-slate-400 transition focus:border-[#E4002B] focus:ring-1 focus:ring-[#E4002B]/20 focus:outline-none"
                          />
                        </div>
                      </td>

                      {/* Daily Quota Inline Input */}
                      <td className="px-5 py-3.5">
                        <input
                          type="number"
                          min="1"
                          value={entry.dailyQuota}
                          onChange={(e) =>
                            updateItem(index, {
                              dailyQuota: Number(e.target.value) || 1,
                            })
                          }
                          className="w-20 rounded-lg border border-slate-300 bg-white py-1.5 px-2.5 font-mono text-xs text-slate-900 transition focus:border-[#E4002B] focus:ring-1 focus:ring-[#E4002B]/20 focus:outline-none"
                        />
                      </td>

                      {/* Progress Bar (soldCount / dailyQuota) */}
                      <td className="px-5 py-3.5 w-40">
                        <div>
                          <div className="flex justify-between text-[11px] font-mono text-slate-500 mb-1">
                            <span>{toBengaliNumber(sold)}টি বিক্রি</span>
                            <span>সীমা {toBengaliNumber(quota)}</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                            <div
                              style={{ width: `${percentSold}%` }}
                              className={`h-full rounded-full transition-all ${
                                percentSold >= 90
                                  ? "bg-rose-500"
                                  : percentSold >= 60
                                    ? "bg-amber-500"
                                    : "bg-[#E4002B]"
                              }`}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Toggle Featured Star */}
                      <td className="px-5 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => updateItem(index, { isFeatured: !entry.isFeatured })}
                          title={entry.isFeatured ? "ফিচার্ড খাবার" : "ফিচার করতে ক্লিক করুন"}
                          className={`p-1.5 rounded-lg transition cursor-pointer ${
                            entry.isFeatured
                              ? "bg-amber-50 text-amber-500 ring-1 ring-amber-300"
                              : "text-slate-400 hover:text-slate-600"
                          }`}
                        >
                          <svg className="size-5 fill-current" viewBox="0 0 24 24">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        </button>
                      </td>

                      {/* Remove from day */}
                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                          title="এই দিন থেকে সরান"
                        >
                          <svg
                            className="size-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M3 6h18" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Catalog Selector Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="catalog-modal-title"
        >
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setIsAddModalOpen(false)}
            aria-hidden="true"
          />

          <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-5 bg-white">
              <div>
                <h3
                  id="catalog-modal-title"
                  className="font-display text-lg font-bold text-slate-900"
                >
                  {dayLabelBn(selectedDay)} এ খাবার যুক্ত করুন
                </h3>
                <p className="text-xs text-slate-500">বাংলার বিরিয়ানির পুরো ক্যাটালগ থেকে খাবার বেছে নিন।</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Filter controls */}
            <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 p-4 sm:flex-row">
              <input
                type="search"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                placeholder="খাবারের নাম বা বিবরণ খুঁজুন..."
                className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-[#E4002B] focus:ring-1 focus:ring-[#E4002B]/20 focus:outline-none"
              />

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#E4002B] focus:outline-none"
              >
                <option value="ALL">সব ক্যাটাগরি</option>
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Dishes list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50">
              {filteredCatalog.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-500">
                  ক্যাটালগে মিলে এমন কোনো খাবার নেই।
                </p>
              ) : (
                filteredCatalog.map((item) => {
                  const isAlreadyAdded = currentDayItems.some((e) => e.menuItemId === item.id)

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-xs transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.imageUrl}
                          alt=""
                          className="size-12 rounded-lg object-cover bg-slate-100 border border-slate-200"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900">{item.name}</p>
                          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500">
                            <span className="font-mono font-semibold text-[#E4002B]">
                              {formatBdt(item.basePriceBdt)}
                            </span>
                            <span>•</span>
                            <span>{item.categoryName}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isAlreadyAdded}
                        onClick={() => handleAddItemFromCatalog(item)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                          isAlreadyAdded
                            ? "border border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
                            : "bg-[#E4002B] text-white hover:bg-[#B80022] cursor-pointer"
                        }`}
                      >
                        {isAlreadyAdded
                          ? dayLabelBn(selectedDay) + " এ যুক্ত আছে"
                          : "+ " + dayLabelBn(selectedDay) + " এ যুক্ত করুন"}
                      </button>
                    </div>
                  )
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-200 bg-white p-4 text-right">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
