import { useEffect, useRef, useState, type ReactNode } from "react"
import { useAuth } from "../../context/AuthContext"
import { useLang } from "../../context/LanguageContext"
import { navigateTo } from "../../utils/navigation"
import { PushAlertsCard } from "./PushAlertsCard"

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  )
}

const rowClass =
  "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold text-charcoal hover:bg-cream"

function Row({ icon, children, onClick, trailing }: { icon: string; children: ReactNode; onClick: () => void; trailing?: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={rowClass}>
      <span className="text-brand">
        <Icon d={icon} />
      </span>
      <span className="min-w-0 flex-1">{children}</span>
      {trailing}
    </button>
  )
}

/** The admin's hamburger menu: account, site link, language, notification settings and sign out. */
export function AdminNavMenu({ soundOn, enableSound }: { soundOn: boolean; enableSound: () => void }) {
  const { user, logout } = useAuth()
  const { lang, setLang, tr } = useLang()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    document.addEventListener("mousedown", onDown)
    document.addEventListener("touchstart", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("touchstart", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="admin-menu"
        aria-label={tr("Menu", "মেনু")}
        className="relative inline-flex size-10 items-center justify-center rounded-lg text-white hover:bg-white/10"
      >
        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
        {!soundOn && !open && <span className="absolute right-1.5 top-1.5 size-2.5 rounded-full bg-saffron ring-2 ring-maroon" aria-hidden />}
      </button>

      {open && (
        <div
          id="admin-menu"
          className="absolute right-0 top-12 z-40 max-h-[calc(100vh-5rem)] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl bg-white p-2 text-charcoal shadow-2xl ring-1 ring-line"
        >
          <div className="px-3 pb-2 pt-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate">{tr("Signed in as", "সাইন ইন করা আছে")}</p>
            <p className="truncate text-sm font-bold" title={user?.email ?? undefined}>
              {user?.email ?? user?.phone}
            </p>
          </div>

          <div className="border-t border-line pt-1">
            <Row
              icon="M3 12 12 4l9 8M5 10v10h14V10"
              onClick={() => {
                setOpen(false)
                navigateTo("/")
              }}
            >
              {tr("View site", "সাইট দেখুন")}
            </Row>
            <Row
              icon="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z"
              onClick={() => setLang(lang === "bn" ? "en" : "bn")}
              trailing={
                <span className="rounded-full bg-cream px-2.5 py-0.5 text-xs font-bold text-brand ring-1 ring-line">
                  {lang === "bn" ? "বাংলা → English" : "English → বাংলা"}
                </span>
              }
            >
              {tr("Language", "ভাষা")}
            </Row>
          </div>

          <div className="mt-1 border-t border-line px-1 pt-3">
            <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-slate">{tr("Notifications", "নোটিফিকেশন")}</p>
            <PushAlertsCard embedded />
            <div className="mt-2 flex items-center gap-3 rounded-xl bg-alabaster p-3 ring-1 ring-line">
              <p className="min-w-0 flex-1 text-sm">
                {soundOn
                  ? tr("Order sound & alerts on this screen are on.", "এই স্ক্রিনে অর্ডারের সাউন্ড ও অ্যালার্ট চালু আছে।")
                  : tr("Play a sound when a new order comes in while this page is open.", "পেজ খোলা থাকলে নতুন অর্ডারে সাউন্ড বাজবে।")}
              </p>
              {!soundOn && (
                <button
                  type="button"
                  onClick={enableSound}
                  className="h-10 shrink-0 rounded-lg bg-brand px-3 text-sm font-bold text-white hover:bg-brand-hover"
                >
                  {tr("Turn on", "চালু করুন")}
                </button>
              )}
            </div>
          </div>

          <div className="mt-2 border-t border-line pt-1">
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                void logout().then(() => navigateTo("/admin"))
              }}
              className={`${rowClass} text-brand`}
            >
              <Icon d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" />
              {tr("Sign out", "সাইন আউট")}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
