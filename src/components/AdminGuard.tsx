import { useState, type FormEvent, type ReactNode } from "react"
import { useAuth } from "../context/AuthContext"
import { navigateTo } from "../utils/navigation"
import { btnPrimary, btnSecondary, inputClass, labelClass } from "./admin/adminApi"

/** Shows the sign-in form until an ADMIN or STAFF user is signed in. */
export function AdminGuard({ children }: { children: ReactNode }) {
  const { user, isLoading, login, logout } = useAuth()
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50" role="status" aria-live="polite">
        <div className="size-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
        <span className="sr-only">Loading</span>
      </div>
    )
  }

  if (!user) {
    const submit = async (e: FormEvent) => {
      e.preventDefault()
      setError(null)
      setSubmitting(true)
      const result = await login(identifier, password)
      if (!result.ok) setError(result.error || "Wrong email or password.")
      setSubmitting(false)
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-6 text-center">
            <img src="/logo-mark.png" alt="" className="mx-auto size-14 rounded-full" />
            <h1 className="mt-3 text-xl font-semibold text-slate-900">Banglar Biriyani Admin</h1>
          </div>
          <form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
            {error && (
              <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}
            <label className="block">
              <span className={labelClass}>Email or phone</span>
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
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="-mt-1.5 px-1 text-sm text-slate-500 hover:text-slate-900"
                >
                  {showPassword ? "Hide" : "Show"}
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
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <p className="mt-4 text-center">
            <button type="button" onClick={() => navigateTo("/")} className="text-sm text-slate-500 hover:text-slate-900">
              ← Back to the website
            </button>
          </p>
        </div>
      </div>
    )
  }

  if (user.role === "CUSTOMER") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4" role="alert">
        <div className="max-w-sm text-center">
          <h1 className="text-xl font-semibold text-slate-900">This account can't open the admin panel</h1>
          <p className="mt-2 text-sm text-slate-600">
            <strong>{user.email ?? user.phone}</strong> is a customer account. Sign out and sign in with an admin or staff account.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <button type="button" onClick={() => logout()} className={btnPrimary}>
              Sign out
            </button>
            <button type="button" onClick={() => navigateTo("/")} className={btnSecondary}>
              Back to the website
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
