import { useEffect, type ReactNode } from "react"
import { useAuth } from "../../context/AuthContext"
import { useLang } from "../../context/LanguageContext"
import { navigateTo, useCurrentPath } from "../../utils/navigation"
import { dg, taka } from "./adminApi"
import { PushAlertsCard } from "./PushAlertsCard"
import { useOrderAlerts } from "./useOrderAlerts"

const TABS = [
  { en: "Orders", bn: "অর্ডার", path: "/admin/orders", icon: "M6 4h12l1 5H5l1-5ZM5 9v10h14V9M9 13h6" },
  { en: "Menu", bn: "মেনু", path: "/admin/menu", icon: "M4 6h16M4 12h16M4 18h10" },
  { en: "Daily meals", bn: "দৈনিক মিল", path: "/admin/meals", icon: "M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 2-3 5-3 8h3v10" },
  { en: "Offers", bn: "অফার", path: "/admin/offers", icon: "M20 12 12 20 4 12V4h8l8 8ZM8.5 8.5h.01" },
  { en: "Delivery", bn: "ডেলিভারি", path: "/admin/delivery", icon: "M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11ZM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" },
]

export function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const { lang, setLang, tr } = useLang()
  const path = useCurrentPath()
  const { enabled, enable, alert, dismiss } = useOrderAlerts()
  // /admin opens the Orders tab
  const active = TABS.find((t) => path.startsWith(t.path))?.path ?? TABS[0].path

  // "Add to Home Screen" on an admin page installs the Admin app (customers never see this)
  useEffect(() => {
    const link = document.createElement("link")
    link.rel = "manifest"
    link.href = "/admin.webmanifest"
    document.head.appendChild(link)
    return () => link.remove()
  }, [])

  const tabLink = (t: (typeof TABS)[number], isActive: boolean, className: string, withIcon: boolean) => (
    <a
      href={t.path}
      onClick={(e) => {
        e.preventDefault()
        navigateTo(t.path)
      }}
      aria-current={isActive ? "page" : undefined}
      className={className}
    >
      {withIcon && (
        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={isActive ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d={t.icon} />
        </svg>
      )}
      <span>{tr(t.en, t.bn)}</span>
    </a>
  )

  return (
    <div className="min-h-screen bg-alabaster text-charcoal">
      <header className="sticky top-0 z-30 bg-maroon text-white shadow-[0_6px_20px_-12px_rgba(60,0,0,0.6)]">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-4">
          <a
            href="/admin"
            onClick={(e) => {
              e.preventDefault()
              navigateTo("/admin")
            }}
            className="flex min-w-0 items-center gap-2.5"
          >
            <img src="/logo-mark.png" alt="" className="size-8 shrink-0 rounded-full bg-white ring-2 ring-saffron/70" />
            <span className="truncate font-bold">{tr("Banglar Biriyani", "বাংলার বিরিয়ানি")}</span>
            <span className="shrink-0 rounded-full bg-saffron px-2 py-0.5 text-xs font-bold tracking-wide text-maroon">
              {tr("ADMIN", "অ্যাডমিন")}
            </span>
          </a>
          <div className="ml-auto flex shrink-0 items-center gap-1">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault()
                navigateTo("/")
              }}
              className="hidden h-9 items-center rounded-lg px-3 text-sm text-white/80 hover:bg-white/10 hover:text-white sm:inline-flex"
            >
              {tr("View site", "সাইট দেখুন")}
            </a>
            <span className="hidden max-w-48 truncate px-2 text-sm text-white/70 md:inline" title={user?.email ?? undefined}>
              {user?.email ?? user?.phone}
            </span>
            <button
              type="button"
              onClick={() => setLang(lang === "bn" ? "en" : "bn")}
              aria-label={tr("Switch language", "ভাষা বদলান")}
              className="inline-flex h-10 min-w-10 items-center justify-center rounded-lg border border-white/25 px-2 text-sm font-semibold text-white hover:bg-white/10"
            >
              {lang === "bn" ? "EN" : "বাং"}
            </button>
            <button
              type="button"
              onClick={() => logout().then(() => navigateTo("/admin"))}
              className="inline-flex h-10 items-center rounded-lg px-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              {tr("Sign out", "সাইন আউট")}
            </button>
          </div>
        </div>
        {/* Tabs at the top on larger screens */}
        <nav aria-label={tr("Admin sections", "অ্যাডমিন বিভাগ")} className="mx-auto hidden max-w-5xl px-2 sm:block">
          <ul className="flex">
            {TABS.map((t) => (
              <li key={t.path}>
                {tabLink(
                  t,
                  t.path === active,
                  `flex h-11 items-center justify-center border-b-[3px] px-3 text-sm font-semibold transition ${
                    t.path === active ? "border-saffron text-white" : "border-transparent text-white/65 hover:text-white"
                  }`,
                  false,
                )}
              </li>
            ))}
          </ul>
        </nav>

        {alert && (
          <div role="alert" className="bg-brand text-white">
            <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2.5">
              <span className="text-xl" aria-hidden>
                🔔
              </span>
              <p className="min-w-0 flex-1 text-sm font-semibold leading-snug">
                {alert.count === 1
                  ? tr("New order!", "নতুন অর্ডার!")
                  : tr(`${alert.count} new orders!`, `${dg(alert.count)}টি নতুন অর্ডার!`)}{" "}
                <span className="font-normal text-white/90">
                  {alert.name} · {taka(alert.total)}
                </span>
              </p>
              <button
                type="button"
                onClick={() => {
                  dismiss()
                  navigateTo("/admin/orders")
                }}
                className="h-10 shrink-0 rounded-lg bg-white px-4 text-sm font-bold text-brand"
              >
                {tr("View", "দেখুন")}
              </button>
              <button
                type="button"
                onClick={dismiss}
                aria-label={tr("Dismiss", "বন্ধ করুন")}
                className="grid size-10 shrink-0 place-items-center rounded-lg text-white/80 hover:bg-white/10"
              >
                ✕
              </button>
            </div>
          </div>
        )}
        {!enabled && (
          <button
            type="button"
            onClick={enable}
            className="block w-full bg-saffron px-4 py-2.5 text-center text-sm font-bold text-maroon"
          >
            {tr("🔔 Turn on order sound & alerts", "🔔 অর্ডারের সাউন্ড ও অ্যালার্ট চালু করুন")}
          </button>
        )}
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-28 pt-5 sm:pb-10 sm:pt-6">
        {active === TABS[0].path && <PushAlertsCard />}
        {children}
      </main>

      {/* Phone: fixed bottom tab bar, easy to reach with a thumb */}
      <nav
        aria-label={tr("Admin sections", "অ্যাডমিন বিভাগ")}
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white shadow-[0_-8px_24px_-16px_rgba(60,0,0,0.5)] sm:hidden"
      >
        <ul className="grid grid-cols-5 pb-[env(safe-area-inset-bottom)]">
          {TABS.map((t) => {
            const isActive = t.path === active
            return (
              <li key={t.path}>
                {tabLink(
                  t,
                  isActive,
                  `flex h-16 flex-col items-center justify-center gap-0.5 text-xs font-semibold transition ${
                    isActive ? "text-brand" : "text-slate"
                  }`,
                  true,
                )}
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
