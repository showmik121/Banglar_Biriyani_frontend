import type { ReactNode } from "react"
import { useAuth } from "../../context/AuthContext"
import { navigateTo, useCurrentPath } from "../../utils/navigation"

const TABS = [
  { label: "Orders", short: "Orders", path: "/admin/orders" },
  { label: "Menu", short: "Menu", path: "/admin/menu" },
  { label: "Daily meals", short: "Meals", path: "/admin/meals" },
  { label: "Offers", short: "Offers", path: "/admin/offers" },
  { label: "Delivery points", short: "Delivery", path: "/admin/delivery" },
]

export function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const path = useCurrentPath()
  // /admin opens the Orders tab
  const active = TABS.find((t) => path.startsWith(t.path))?.path ?? TABS[0].path

  return (
    <div className="min-h-screen bg-alabaster text-charcoal">
      <header className="sticky top-0 z-30 bg-maroon text-white shadow-[0_6px_20px_-12px_rgba(60,0,0,0.6)]">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
          <a
            href="/admin"
            onClick={(e) => {
              e.preventDefault()
              navigateTo("/admin")
            }}
            className="flex min-w-0 items-center gap-2.5"
          >
            <img src="/logo-mark.png" alt="" className="size-8 shrink-0 rounded-full bg-white ring-2 ring-saffron/70" />
            <span className="truncate font-bold">Banglar Biriyani</span>
            <span className="shrink-0 rounded-full bg-saffron px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-maroon">
              Admin
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
              View site
            </a>
            <span className="hidden max-w-48 truncate px-2 text-sm text-white/70 md:inline" title={user?.email ?? undefined}>
              {user?.email ?? user?.phone}
            </span>
            <button
              type="button"
              onClick={() => logout().then(() => navigateTo("/admin"))}
              className="inline-flex h-9 items-center rounded-lg px-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Sign out
            </button>
          </div>
        </div>
        <nav aria-label="Admin sections" className="mx-auto max-w-5xl px-1 sm:px-2">
          <ul className="grid grid-cols-5 sm:flex">
            {TABS.map((t) => {
              const isActive = t.path === active
              return (
                <li key={t.path}>
                  <a
                    href={t.path}
                    onClick={(e) => {
                      e.preventDefault()
                      navigateTo(t.path)
                    }}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex h-11 items-center justify-center border-b-[3px] px-1 text-[13px] font-semibold transition sm:px-3 sm:text-sm ${
                      isActive
                        ? "border-saffron text-white"
                        : "border-transparent text-white/65 hover:text-white"
                    }`}
                  >
                    <span className="sm:hidden">{t.short}</span>
                    <span className="hidden sm:inline">{t.label}</span>
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 pb-10 pt-5 sm:pt-6">{children}</main>
    </div>
  )
}
