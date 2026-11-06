import { useState, useEffect, useRef } from "react"
import { useCart } from "../context/CartContext"
import { useAddress } from "../context/AddressContext"
import { useAuth } from "../context/AuthContext"
import { useLang } from "../context/LanguageContext"
import { addressLabel } from "../i18n/dishes"
import { navigateTo } from "../utils/navigation"
import { AddressRecommendationPopup } from "./AddressRecommendationPopup"
import { SearchRecommendationPopup, type SearchableDish } from "./SearchRecommendationPopup"

// Receipt icon for "My orders"
const RECEIPT_ICON = "M6 3h12v18l-3-2-3 2-3-2-3 2V3ZM9 8h6M9 12h6M9 16h3"

type Props = {
  cartCount?: number
  query: string
  onQuery: (q: string) => void
  onOpenCart?: () => void
  dishes?: SearchableDish[]
  onSelectDish?: (dish: SearchableDish) => void
  onExecuteSearch?: (q: string) => void
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
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9a8 8 0 0 1 16 0",
  globe:
    "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-9-9h18M12 3c2.5 2.7 3.5 5.7 3.5 9s-1 6.3-3.5 9c-2.5-2.7-3.5-5.7-3.5-9s1-6.3 3.5-9Z",
  heart:
    "M12 20s-7.5-4.6-9-9.2C2 7.6 4.2 5 7 5c2 0 3.2 1.1 5 3 1.8-1.9 3-3 5-3 2.8 0 5 2.6 4 5.8-1.5 4.6-9 9.2-9 9.2Z",
  bag: "M6 7h12l-1.2 11.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 7Zm3 0V6a3 3 0 0 1 6 0v1",
  chevron: "m6 9 6 6 6-6",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm9 2-3.5-3.5",
}

const NAV = [
  { en: "Our menu", bn: "আমাদের মেনু", href: "#menu" },
  { en: "Daily meals", bn: "দৈনিক মিল", href: "#meal" },
  { en: "Delivery area", bn: "ডেলিভারি এলাকা", href: "#location" },
]

/** EN | বাংলা switch */
function LanguageSwitch({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLang()
  return (
    <div role="group" aria-label="Language / ভাষা" className={`flex rounded-full bg-cream p-0.5 ${className}`}>
      {(
        [
          ["en", "EN", "English"],
          ["bn", "বাংলা", "বাংলা"],
        ] as const
      ).map(([code, label, full]) => (
        <button
          key={code}
          type="button"
          lang={code}
          aria-pressed={lang === code}
          aria-label={full}
          onClick={() => setLang(code)}
          className={`h-9 rounded-full px-3 text-xs font-bold transition ${
            lang === code ? "bg-white text-brand shadow-sm" : "text-slate hover:text-charcoal"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

const iconBtn =
  "grid size-10 shrink-0 place-items-center rounded-full text-charcoal transition hover:bg-cream hover:text-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/25"

export function Header({
  cartCount: propCartCount,
  query,
  onQuery,
  onOpenCart,
  dishes = [],
  onSelectDish,
  onExecuteSearch,
}: Props) {
  const ref = useRef<HTMLElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const { totalItems, setIsCartOpen } = useCart()
  const { selectedAddress, setIsAddressModalOpen } = useAddress()
  const { user, openAuthModal, openMyOrders, openAdminModal, logout } = useAuth()
  const [isRecommendationOpen, setIsRecommendationOpen] = useState(false)
  const [isSearchRecOpen, setIsSearchRecOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isNavOpen, setIsNavOpen] = useState(false)
  const cartCount = propCartCount ?? totalItems
  const { lang, tr, num } = useLang()

  // Close user dropdown when clicking outside
  useEffect(() => {
    if (!isUserMenuOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isUserMenuOpen])

  const handleOpenCart = () => {
    setIsCartOpen(true)
    if (onOpenCart) onOpenCart()
  }

  // Publish header height so other sticky bars can sit right below it.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() =>
      document.documentElement.style.setProperty("--header-h", `${el.offsetHeight}px`),
    )
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <header
      ref={ref}
      className="sticky top-0 z-40 border-b border-line/80 bg-alabaster/90 backdrop-blur-xl supports-[backdrop-filter]:bg-alabaster/80"
    >
      {/* Row 1: logo, address, account */}
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-6 sm:py-3 lg:px-8">
        <a href="#" className="group flex shrink-0 items-center gap-2.5" aria-label={tr("Banglar Biriyani home", "বাংলার বিরিয়ানি হোম")}>
          <span className="grid size-10 place-items-center rounded-full bg-white p-0.5 shadow-card ring-2 ring-gold/40 transition group-hover:ring-gold sm:size-12">
            <img src="/logo-mark.png" alt="" className="size-full rounded-full object-contain" />
          </span>
          <span className="flex min-w-0 flex-col leading-none">
            <span className="text-display whitespace-nowrap text-[17px] text-maroon min-[400px]:text-lg sm:text-xl">
              {tr("Banglar Biriyani", "বাংলার বিরিয়ানি")}
            </span>
            <span className="font-bn mt-1 hidden text-xs text-gold sm:block">
              {tr("বাংলার বিরিয়ানি", "Banglar Biriyani")}
            </span>
          </span>
        </a>

        {/* Desktop Address Button Container with Floating Recommendation Popup */}
        <div className="relative mx-auto hidden md:block">
          <button
            type="button"
            onClick={() => setIsRecommendationOpen((prev) => !prev)}
            aria-expanded={isRecommendationOpen}
            className="flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm transition hover:border-gold/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 cursor-pointer"
            title={tr("Change delivery address", "ডেলিভারির ঠিকানা বদলান")}
          >
            <Icon d={ICONS.pin} className="size-4 text-brand" />
            <span className="font-semibold text-charcoal">
              {selectedAddress?.label ? tr(`${selectedAddress.label} address`, `${addressLabel(selectedAddress.label, lang)}-এর ঠিকানা`) : tr("New address", "নতুন ঠিকানা")}
            </span>
            <span className="max-w-[110px] truncate text-slate lg:max-w-[200px]">
              {selectedAddress ? selectedAddress.details : tr("Select your address", "আপনার ঠিকানা দিন")}
            </span>
            <Icon
              d={ICONS.chevron}
              className={`size-3.5 text-slate/70 transition-transform duration-200 ${
                isRecommendationOpen ? "rotate-180 text-brand" : ""
              }`}
            />
          </button>

          {/* Floating Recommendation Dropdown Popup */}
          <AddressRecommendationPopup
            isOpen={isRecommendationOpen}
            onClose={() => setIsRecommendationOpen(false)}
            onOpenDetailedModal={() => {
              setIsRecommendationOpen(false)
              setIsAddressModalOpen(true)
            }}
          />
        </div>

        <div ref={userMenuRef} className="relative ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1 md:ml-0">
          {user ? (
            <>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold transition hover:bg-cream lg:flex"
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
              >
                <Icon d={ICONS.user} className="size-4 text-brand" />
                {user.fullName.split(" ")[0]}
                <Icon
                  d={ICONS.chevron}
                  className={`size-4 text-brand transition-transform ${
                    isUserMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-2xl border border-line bg-white p-1.5 shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in-0 zoom-in-95 duration-100"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <div className="border-b border-line px-3 py-2.5">
                    <p className="text-xs font-bold text-charcoal truncate">{user.fullName}</p>
                    <div className="mt-0.5 flex items-center justify-between text-xs text-slate">
                      <span className="truncate">{user.phone}</span>
                      <span className="rounded-full bg-brand/10 px-1.5 py-0.5 text-xs font-bold text-brand">
                        {user.role}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false)
                        openMyOrders()
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-charcoal transition hover:bg-cream hover:text-brand"
                      role="menuitem"
                    >
                      <svg
                        className="size-4 text-slate"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                        <path d="M3 6h18" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                      </svg>
                      {tr("My Orders", "আমার অর্ডার")}
                    </button>

                    {(user.role === "ADMIN" || user.role === "STAFF") && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false)
                          navigateTo("/admin")
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-brand transition hover:bg-brand-light"
                        role="menuitem"
                      >
                        <svg
                          className="size-4 text-brand"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect width="18" height="18" x="3" y="3" rx="2" />
                          <path d="M9 3v18" />
                          <path d="m14 9 3 3-3 3" />
                        </svg>
                        {tr("Admin Panel", "অ্যাডমিন প্যানেল")}
                      </button>
                    )}
                  </div>

                  <div className="border-t border-line pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false)
                        logout()
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                      role="menuitem"
                    >
                      <svg
                        className="size-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      {tr("Sign Out", "সাইন আউট")}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={openMyOrders}
                className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold transition hover:bg-cream lg:flex"
              >
                <Icon d={RECEIPT_ICON} className="size-4" />
                {tr("My orders", "আমার অর্ডার")}
              </button>
              <button
                type="button"
                onClick={() => openAuthModal("login")}
                className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold transition hover:bg-cream lg:flex"
              >
                <Icon d={ICONS.user} className="size-4" />
                {tr("Sign In", "সাইন ইন")}
                <Icon d={ICONS.chevron} className="size-4 text-brand" />
              </button>
            </>
          )}
          <LanguageSwitch className="mx-1 hidden lg:flex" />
          <button
            type="button"
            onClick={handleOpenCart}
            aria-label={tr(`Cart, ${cartCount} items`, `কার্ট, ${num(cartCount)}টি আইটেম`)}
            className={`${iconBtn} relative`}
          >
            <Icon d={ICONS.bag} className="size-[22px]" />
            {cartCount > 0 && (
              <span className="absolute right-0.5 top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-brand px-1 text-xs font-extrabold text-white ring-2 ring-alabaster">
                {num(cartCount)}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setIsNavOpen((o) => !o)}
            aria-expanded={isNavOpen}
            aria-controls="mobile-nav"
            aria-label={isNavOpen ? tr("Close menu", "মেনু বন্ধ করুন") : tr("Open menu", "মেনু খুলুন")}
            className={`${iconBtn} lg:hidden`}
          >
            <Icon d={isNavOpen ? "M6 6l12 12M18 6 6 18" : "M4 7h16M4 12h16M4 17h16"} />
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {isNavOpen && (
        <nav
          id="mobile-nav"
          aria-label={tr("Sections", "সেকশন")}
          className="border-t border-line/70 bg-alabaster px-4 pb-3 pt-2 lg:hidden"
        >
          <ul className="grid grid-cols-2 gap-2">
            {user && (
              <li className="col-span-2 flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-2.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-light text-brand">
                  <Icon d={ICONS.user} className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-charcoal">{user.fullName}</span>
                  <span className="block truncate text-xs text-slate">{user.phone}</span>
                </span>
              </li>
            )}
            {NAV.map((n) => (
              <li key={n.href} className="md:hidden">
                <a
                  href={n.href}
                  onClick={() => setIsNavOpen(false)}
                  className="flex h-12 items-center rounded-xl border border-line bg-white px-4 text-sm font-semibold text-charcoal active:bg-cream"
                >
                  {tr(n.en, n.bn)}
                </a>
              </li>
            ))}
            <li className="col-span-2">
              <button
                type="button"
                onClick={() => {
                  setIsNavOpen(false)
                  openMyOrders()
                }}
                className="flex h-12 w-full items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-charcoal active:bg-cream"
              >
                <Icon d={RECEIPT_ICON} className="size-4 text-brand" />
                {tr("My orders · track your order", "আমার অর্ডার · অর্ডার ট্র্যাক করুন")}
              </button>
            </li>
            {!user && (
              <li className="col-span-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsNavOpen(false)
                    openAuthModal("login")
                  }}
                  className="flex h-12 w-full items-center gap-2 rounded-xl bg-brand px-4 text-sm font-bold text-white active:bg-brand-hover"
                >
                  <Icon d={ICONS.user} className="size-4" />
                  {tr("Sign In", "সাইন ইন")}
                </button>
              </li>
            )}
            {(user?.role === "ADMIN" || user?.role === "STAFF") && (
              <li className="col-span-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsNavOpen(false)
                    navigateTo("/admin")
                  }}
                  className="flex h-12 w-full items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-brand active:bg-cream"
                >
                  <Icon d="M3 3h18v18H3zM9 3v18" className="size-4" />
                  {tr("Admin Panel", "অ্যাডমিন প্যানেল")}
                </button>
              </li>
            )}
            <li className="col-span-2 flex items-center justify-between gap-3 rounded-xl border border-line bg-white px-4 py-1.5">
              <span className="text-sm font-semibold text-charcoal">{tr("Language", "ভাষা")}</span>
              <LanguageSwitch />
            </li>
            {user && (
              <li className="col-span-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsNavOpen(false)
                    logout()
                  }}
                  className="flex h-12 w-full items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-rose-600 active:bg-rose-50"
                >
                  <Icon d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" className="size-4" />
                  {tr("Sign Out", "সাইন আউট")}
                </button>
              </li>
            )}
          </ul>
        </nav>
      )}

      {/* Row 2: section nav + search */}
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-3 pb-3 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <nav aria-label={tr("Sections", "সেকশন")} className="no-scrollbar -mx-1 hidden gap-1 overflow-x-auto md:flex">
          {NAV.map((n, i) => (
            <a
              key={n.href}
              href={n.href}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                i === 0
                  ? "bg-charcoal text-white"
                  : "text-charcoal hover:bg-cream hover:text-brand"
              }`}
            >
              {tr(n.en, n.bn)}
            </a>
          ))}
        </nav>
        <div ref={searchContainerRef} className="relative block w-full md:max-w-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (onExecuteSearch) {
                onExecuteSearch(query)
              }
              setIsSearchRecOpen(false)
            }}
            className="relative block w-full"
          >
            <span className="sr-only">{tr("Search", "খুঁজুন")}</span>
            {/* Left decorative search icon */}
            <Icon
              d={ICONS.search}
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate"
            />
            {/* Search Input field */}
            <input
              type="search"
              value={query}
              onChange={(e) => {
                onQuery(e.target.value)
                setIsSearchRecOpen(true)
              }}
              onFocus={() => setIsSearchRecOpen(true)}
              onClick={() => setIsSearchRecOpen(true)}
              aria-label={tr("Search dishes", "খাবার খুঁজুন")}
              placeholder={tr("Search biriyani, tehari, borhani…", "বিরিয়ানি, তেহারি, বোরহানি খুঁজুন…")}
              className="h-11 w-full rounded-full border border-transparent bg-cream/80 pl-10 pr-11 text-sm sm:border-line sm:bg-white outline-none transition placeholder:text-slate/80 focus:border-brand focus:ring-4 focus:ring-brand/10"
            />
            {/* Small Search Icon Button on the right */}
            <button
              type="submit"
              aria-label={tr("Search", "খুঁজুন")}
              title={tr("Search", "খুঁজুন")}
              className="absolute right-1 top-1/2 -translate-y-1/2 grid size-9 place-items-center rounded-full bg-brand text-white transition hover:bg-brand-hover active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
            >
              <Icon d={ICONS.search} className="size-3.5" />
            </button>
          </form>

          {/* Search Recommendation Popup */}
          <SearchRecommendationPopup
            isOpen={isSearchRecOpen}
            onClose={() => setIsSearchRecOpen(false)}
            query={query}
            dishes={dishes}
            containerRef={searchContainerRef}
            onSelectDish={(dish) => {
              if (onSelectDish) onSelectDish(dish)
              setIsSearchRecOpen(false)
            }}
            onExecuteSearch={(q) => {
              if (onExecuteSearch) onExecuteSearch(q)
              setIsSearchRecOpen(false)
            }}
          />
        </div>
      </div>
    </header>
  )
}
