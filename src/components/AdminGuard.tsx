import { useState, type ReactNode, type FormEvent } from "react"
import { useAuth } from "../context/AuthContext"
import { navigateTo } from "../utils/navigation"

interface AdminGuardProps {
  children: ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { user, isLoading, login } = useAuth()
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  // 1. Loading state with brand-colored spinner
  if (isLoading) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-slate-900"
        role="status"
        aria-live="polite"
      >
        <div className="relative mb-4">
          <div className="size-14 animate-spin rounded-full border-4 border-slate-200 border-t-[#E4002B]" />
        </div>
        <p className="font-display text-lg tracking-wide text-slate-900">বাংলার বিরিয়ানি অপারেশন</p>
        <p className="mt-1 text-xs text-slate-500">অনুমোদিত প্রবেশাধিকার যাচাই করা হচ্ছে...</p>
      </div>
    )
  }

  // 2. Unauthenticated: Prompt for Staff or Admin Credentials
  if (!user) {
    const handleLogin = async (e: FormEvent) => {
      e.preventDefault()
      setLoginError(null)
      setIsSubmitting(true)

      const result = await login(identifier, password)
      if (!result.ok) {
        setLoginError(result.error || "ভুল তথ্য অথবা অনুমোদন নেই।")
      }
      setIsSubmitting(false)
    }

    const fillDemo = (demoEmail: string, demoPass: string) => {
      setIdentifier(demoEmail)
      setPassword(demoPass)
      setLoginError(null)
    }

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#E4002B] shadow-lg shadow-[#E4002B]/30">
              <svg
                className="size-7 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M9 3v18" />
                <path d="m14 9 3 3-3 3" />
              </svg>
            </div>
            <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              বাংলার বিরিয়ানি
            </h1>
            <p className="mt-1 text-sm font-semibold text-[#E4002B]">সুরক্ষিত অপারেশন ও কিচেন পোর্টাল</p>
            <p className="mt-1 text-xs text-slate-500">
              এগিয়ে যেতে আপনার অনুমোদিত স্টাফ বা অ্যাডমিন লগইন তথ্য দিন।
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            {loginError && (
              <div
                role="alert"
                className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-600"
              >
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="admin-identifier"
                  className="block text-xs font-semibold text-slate-700"
                >
                  অফিসের ইমেইল বা মোবাইল (০১XXXXXXXXX)
                </label>
                <input
                  id="admin-identifier"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@banglarbiriyani.com"
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition focus:border-[#E4002B] focus:outline-none focus:ring-2 focus:ring-[#E4002B]/20"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="admin-password"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    পাসওয়ার্ড
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="text-[11px] font-medium text-[#E4002B] hover:underline cursor-pointer"
                  >
                    {showPassword ? "লুকান" : "দেখান"}
                  </button>
                </div>
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition focus:border-[#E4002B] focus:outline-none focus:ring-2 focus:ring-[#E4002B]/20"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#E4002B] py-3 text-sm font-semibold text-white shadow-lg shadow-[#E4002B]/25 transition hover:bg-[#B80022] active:scale-[0.99] disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4002B]"
              >
                {isSubmitting ? (
                  <>
                    <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>লগইন হচ্ছে...</span>
                  </>
                ) : (
                  <span>অ্যাডমিন পোর্টালে প্রবেশ করুন</span>
                )}
              </button>
            </form>

            {/* Quick Demo Access Buttons */}
            <div className="mt-6 border-t border-slate-200 pt-4">
              <p className="text-center text-[11px] font-medium text-slate-500">
                ডেমো স্টাফ তথ্য দিয়ে দ্রুত পূরণ
              </p>
              <div className="mt-2.5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillDemo("admin@banglarbiriyani.com", "Admin@1234")}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-center text-xs font-medium text-slate-700 transition hover:border-[#E4002B] hover:bg-[#FFF0F3] hover:text-[#E4002B] cursor-pointer"
                >
                  অ্যাডমিন পোর্টাল
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo("kitchen@banglarbiriyani.com", "Staff@1234")}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-center text-xs font-medium text-slate-700 transition hover:border-[#E4002B] hover:bg-[#FFF0F3] hover:text-[#E4002B] cursor-pointer"
                >
                  প্রধান শেফ (স্টাফ)
                </button>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigateTo("/")}
              className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 transition hover:text-slate-900 cursor-pointer"
            >
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              ওয়েবসাইটে ফিরে যান
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 3. Authenticated but unauthorized (Role is CUSTOMER) -> HTTP 403 Forbidden Screen
  if (user.role === "CUSTOMER") {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8"
        role="alert"
        aria-labelledby="forbidden-title"
      >
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-rose-200">
            <svg
              className="size-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <span className="mt-4 inline-block rounded-full bg-rose-50 px-3 py-1 font-mono text-xs font-bold text-rose-600 ring-1 ring-rose-200">
            HTTP 403 নিষিদ্ধ
          </span>

          <h1
            id="forbidden-title"
            className="mt-3 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
          >
            প্রবেশাধিকার নেই
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            <strong>{user.email}</strong> অ্যাকাউন্টটি গ্রাহক হিসেবে নিবন্ধিত। অপারেশন পোর্টাল শুধু বাংলার
            বিরিয়ানির প্রধান শেফ, স্টাফ ও ব্যবস্থাপনা দলের জন্য।
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => navigateTo("/")}
              className="rounded-xl bg-[#E4002B] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#E4002B]/25 transition hover:bg-[#B80022] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4002B] cursor-pointer"
            >
              ওয়েবসাইটে ফিরে যান
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 4. Authorized: ADMIN or STAFF role confirmed
  return <>{children}</>
}
