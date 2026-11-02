import type { ReactNode } from "react"
import { useAuth } from "../../context/AuthContext"
import { navigateTo, useCurrentPath } from "../../utils/navigation"

const TABS = [
  { label: "Orders", path: "/admin/orders" },
  { label: "Menu", path: "/admin/menu" },
  { label: "Offers", path: "/admin/offers" },
  { label: "Delivery points", path: "/admin/delivery" },
]

export function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const path = useCurrentPath()
  // /admin opens the Orders tab
  const active = TABS.find((t) => path.startsWith(t.path))?.path ?? TABS[0].path

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
          <a
            href="/admin"
            onClick={(e) => {
              e.preventDefault()
              navigateTo("/admin")
            }}
            className="flex items-center gap-2 font-semibold text-slate-900"
          >
            <img src="/logo-mark.png" alt="" className="size-7 rounded-full" />
            <span className="hidden sm:inline">Banglar Biriyani</span>
            <span className="text-sm font-normal text-slate-500">Admin</span>
          </a>
          <div className="ml-auto flex items-center gap-1">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault()
                navigateTo("/")
              }}
              className="hidden h-9 items-center rounded-lg px-3 text-sm text-slate-600 hover:bg-slate-100 sm:inline-flex"
            >
              View site
            </a>
            <span className="hidden max-w-48 truncate px-2 text-sm text-slate-500 md:inline" title={user?.email}>
              {user?.email}
            </span>
            <button
              type="button"
              onClick={() => logout().then(() => navigateTo("/admin"))}
              className="inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Sign out
            </button>
          </div>
        </div>
        <nav aria-label="Admin sections" className="mx-auto max-w-5xl overflow-x-auto px-2">
          <ul className="flex min-w-max">
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
                    className={`inline-flex h-11 items-center border-b-2 px-3 text-sm font-medium transition ${
                      isActive
                        ? "border-slate-900 text-slate-900"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {t.label}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  )
}
