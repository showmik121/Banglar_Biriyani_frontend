import { useState, type FormEvent, type ReactNode } from "react"
import { useAuth } from "../context/AuthContext"
import { useLang } from "../context/LanguageContext"
import { navigateTo } from "../utils/navigation"
import { btnPrimary, btnSecondary, inputClass, labelClass } from "./admin/adminApi"

/** Shows the sign-in form until an ADMIN or STAFF user is signed in. */
export function AdminGuard({ children }: { children: ReactNode }) {
  const { user, isLoading, login, logout } = useAuth()
  const { tr, lang, setLang } = useLang()
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-alabaster" role="status" aria-live="polite">
        <div className="size-8 animate-spin rounded-full border-2 border-line border-t-brand" />
        <span className="sr-only">{tr("Loading", "লোড হচ্ছে")}</span>
      </div>
    )
  }

  if (!user) {
    const submit = async (e: FormEvent) => {
      e.preventDefault()
      setError(null)
      setSubmitting(true)
      const result = await login(identifier, password)
      if (!result.ok) setError(result.error || tr("Wrong email or password.", "ইমেইল/ফোন বা পাসওয়ার্ড ভুল।"))
      setSubmitting(false)
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-alabaster px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-6 text-center">
            <img src="/logo-mark.png" alt="" className="mx-auto size-14 rounded-full" />
            <h1 className="mt-3 text-xl font-semibold text-charcoal">{tr("Banglar Biriyani Admin", "বাংলার বিরিয়ানি অ্যাডমিন")}</h1>
          </div>
          <form onSubmit={submit} className="space-y-4 rounded-2xl border border-line bg-white p-6">
            {error && (
              <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}
            <label className="block">
              <span className={labelClass}>{tr("Email or phone", "ইমেইল অথবা ফোন")}</span>
              <input
                className={inputClass}
                type="text"
                autoComplete="username"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </label>
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="admin-password" className={labelClass}>
                  {tr("Password", "পাসওয়ার্ড")}
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="-mt-1.5 px-1 text-sm text-slate hover:text-charcoal"
                >
                  {showPassword ? tr("Hide", "লুকান") : tr("Show", "দেখুন")}
                </button>
              </div>
              <input
                id="admin-password"
                className={inputClass}
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" disabled={submitting} className={`${btnPrimary} h-11 w-full`}>
              {submitting ? tr("Signing in…", "সাইন ইন হচ্ছে…") : tr("Sign in", "সাইন ইন")}
            </button>
          </form>
          <p className="mt-4 flex items-center justify-center gap-4">
            <button type="button" onClick={() => setLang(lang === "bn" ? "en" : "bn")} className="text-sm text-slate hover:text-charcoal">
              {lang === "bn" ? "English" : "বাংলা"}
            </button>
            <button type="button" onClick={() => navigateTo("/")} className="text-sm text-slate hover:text-charcoal">
              {tr("← Back to the website", "← ওয়েবসাইটে ফিরুন")}
            </button>
          </p>
        </div>
      </div>
    )
  }

  if (user.role === "CUSTOMER") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-alabaster px-4" role="alert">
        <div className="max-w-sm text-center">
          <h1 className="text-xl font-semibold text-charcoal">{tr("This account can't open the admin panel", "এই অ্যাকাউন্ট দিয়ে অ্যাডমিন প্যানেল খোলা যাবে না")}</h1>
          <p className="mt-2 text-sm text-slate">
            <strong>{user.email ?? user.phone}</strong>{" "}
            {tr(
              "is a customer account. Sign out and sign in with an admin or staff account.",
              "একটি কাস্টমার অ্যাকাউন্ট। সাইন আউট করে অ্যাডমিন বা স্টাফ অ্যাকাউন্টে সাইন ইন করুন।",
            )}
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <button type="button" onClick={() => logout()} className={btnPrimary}>
              {tr("Sign out", "সাইন আউট")}
            </button>
            <button type="button" onClick={() => navigateTo("/")} className={btnSecondary}>
              {tr("Back to the website", "ওয়েবসাইটে ফিরুন")}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
