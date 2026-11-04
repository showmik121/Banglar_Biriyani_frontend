import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react"
import { useAuth } from "../context/AuthContext"
import { useBodyScrollLock } from "../hooks/useBodyScrollLock"
import { useFocusTrap } from "../hooks/useFocusTrap"

type Tab = "login" | "signup"
type SignupField = "fullName" | "phone" | "email" | "password"

/** "+880 1711-000001" -> "01711000001" */
const normalizePhone = (v: string) => {
  const digits = v.replace(/\D/g, "")
  return digits.startsWith("880") ? digits.slice(2) : digits
}

function validateSignup(name: string, phone: string, email: string, password: string): Partial<Record<SignupField, string>> {
  const errors: Partial<Record<SignupField, string>> = {}
  if (name.trim().length < 2) errors.fullName = "Enter your name"
  if (!/^01[3-9]\d{8}$/.test(normalizePhone(phone))) errors.phone = "Enter an 11-digit mobile number starting with 01"
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = "Enter a valid email, e.g. name@gmail.com"
  if (password.length < 8) errors.password = "Use at least 8 characters"
  return errors
}

const inputClass = (invalid?: boolean) =>
  `mt-1.5 block h-12 w-full rounded-xl border bg-white px-3.5 text-base text-charcoal outline-none transition placeholder:text-slate/50 focus:ring-2 sm:text-sm ${
    invalid ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200" : "border-line focus:border-brand focus:ring-brand/15"
  }`

export function AuthModal() {
  const { isAuthModalOpen, authModalDefaultTab, closeAuthModal, login, signup } = useAuth()
  const modalRef = useRef<HTMLDivElement>(null)
  const firstInputRef = useRef<HTMLInputElement>(null)
  useBodyScrollLock(isAuthModalOpen)
  useFocusTrap(modalRef, isAuthModalOpen)

  const [tab, setTab] = useState<Tab>("login")
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  // Sign in
  const [identifier, setIdentifier] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  // Sign up: name, mobile number, email, password
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [touched, setTouched] = useState<Partial<Record<SignupField, boolean>>>({})
  const [serverErrors, setServerErrors] = useState<Partial<Record<SignupField, string>>>({})

  const switchTo = (next: Tab) => {
    setTab(next)
    setFormError(null)
    setShowPassword(false)
    setTimeout(() => firstInputRef.current?.focus(), 30)
  }

  useEffect(() => {
    if (!isAuthModalOpen) return
    setTab(authModalDefaultTab)
    setFormError(null)
    setTouched({})
    setServerErrors({})
    setTimeout(() => firstInputRef.current?.focus(), 50)
  }, [isAuthModalOpen, authModalDefaultTab])

  useEffect(() => {
    if (!isAuthModalOpen) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeAuthModal()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isAuthModalOpen, closeAuthModal])

  if (!isAuthModalOpen) return null

  const clientErrors = validateSignup(fullName, phone, email, password)
  // Show a field's problem after the customer leaves it (or presses the button)
  const fieldError = (f: SignupField) => serverErrors[f] || (touched[f] ? clientErrors[f] : undefined)

  const submitLogin = async (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    setFormError(null)
    setBusy(true)
    const result = await login(identifier.trim(), loginPassword)
    setBusy(false)
    if (!result.ok) setFormError(result.error || "Wrong mobile number, email or password.")
  }

  const submitSignup = async (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    setFormError(null)
    setServerErrors({})
    setTouched({ fullName: true, phone: true, email: true, password: true })
    if (Object.keys(clientErrors).length > 0) return

    setBusy(true)
    const result = await signup({
      fullName: fullName.trim(),
      phone: normalizePhone(phone),
      email: email.trim().toLowerCase(),
      password,
    })
    setBusy(false)
    if (!result.ok) {
      const fe = result.fieldErrors || {}
      const mapped: Partial<Record<SignupField, string>> = {}
      for (const f of ["fullName", "phone", "email", "password"] as SignupField[]) if (fe[f]?.[0]) mapped[f] = fe[f]![0]
      setServerErrors(mapped)
      if (Object.keys(mapped).length === 0) setFormError(result.error || "Couldn't create your account. Please try again.")
    }
  }

  const isSignup = tab === "signup"

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="fixed inset-0 bg-charcoal/60" onClick={closeAuthModal} aria-hidden="true" />

      <div
        ref={modalRef}
        className="relative flex max-h-[94dvh] w-full max-w-sm flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl"
      >
        {/* Brand header, same look as the admin panel */}
        <div className="flex shrink-0 items-center gap-2.5 bg-maroon px-5 py-3.5 text-white">
          <img src="/logo-mark.png" alt="" className="size-9 shrink-0 rounded-full bg-white ring-2 ring-saffron/70" />
          <span className="min-w-0 flex-1 truncate font-bold">Banglar Biriyani</span>
          <button
            type="button"
            onClick={closeAuthModal}
            aria-label="Close"
            className="-mr-2 grid size-10 shrink-0 place-items-center rounded-full text-white/80 hover:bg-white/10 hover:text-white"
          >
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto overscroll-contain px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-5 sm:pb-6">
          {/* Sign in / Create account switch */}
          <div role="tablist" aria-label="Account" className="grid grid-cols-2 rounded-xl bg-cream p-1">
            {(["login", "signup"] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => tab !== t && switchTo(t)}
                className={`h-10 rounded-lg text-sm font-semibold transition ${
                  tab === t ? "bg-white text-brand shadow-sm" : "text-slate hover:text-charcoal"
                }`}
              >
                {t === "login" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <h2 id="auth-modal-title" className="mt-5 text-xl font-bold text-charcoal">
            {isSignup ? "Create your account" : "Welcome back"}
          </h2>
          <p className="mt-1 text-sm text-slate">
            {isSignup ? "Takes a minute. Order faster and get updates by email." : "Sign in to order faster and see your orders."}
          </p>

          {formError && (
            <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">
              {formError}
            </p>
          )}

          {isSignup ? (
            <form onSubmit={submitSignup} noValidate className="mt-5 space-y-4">
              <Field id="signup-name" label="Your name" error={fieldError("fullName")}>
                <input
                  ref={firstInputRef}
                  id="signup-name"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value)
                    setServerErrors((s) => ({ ...s, fullName: undefined }))
                  }}
                  onBlur={() => setTouched((t) => ({ ...t, fullName: true }))}
                  aria-invalid={!!fieldError("fullName")}
                  aria-describedby={fieldError("fullName") ? "signup-name-error" : undefined}
                  className={inputClass(!!fieldError("fullName"))}
                />
              </Field>

              <Field id="signup-phone" label="Mobile number" error={fieldError("phone")}>
                <input
                  id="signup-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="01XXXXXXXXX"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value)
                    setServerErrors((s) => ({ ...s, phone: undefined }))
                  }}
                  onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                  aria-invalid={!!fieldError("phone")}
                  aria-describedby={fieldError("phone") ? "signup-phone-error" : undefined}
                  className={inputClass(!!fieldError("phone"))}
                />
              </Field>

              <Field id="signup-email" label="Email" error={fieldError("email")} hint="We'll email your order updates here">
                <input
                  id="signup-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="name@gmail.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setServerErrors((s) => ({ ...s, email: undefined }))
                  }}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  aria-invalid={!!fieldError("email")}
                  aria-describedby={fieldError("email") ? "signup-email-error" : undefined}
                  className={inputClass(!!fieldError("email"))}
                />
              </Field>

              <Field id="signup-password" label="Password" error={fieldError("password")} hint="At least 8 characters">
                <PasswordInput
                  id="signup-password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(v) => {
                    setPassword(v)
                    setServerErrors((s) => ({ ...s, password: undefined }))
                  }}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  shown={showPassword}
                  onToggle={() => setShowPassword((v) => !v)}
                  invalid={!!fieldError("password")}
                />
              </Field>

              <SubmitButton busy={busy} label="Create account" busyLabel="Creating account…" />
              <p className="text-center text-xs text-slate">We use your number and email only for your orders.</p>
            </form>
          ) : (
            <form onSubmit={submitLogin} className="mt-5 space-y-4">
              <Field id="login-identifier" label="Mobile number or email">
                <input
                  ref={firstInputRef}
                  id="login-identifier"
                  type="text"
                  autoComplete="username"
                  placeholder="01XXXXXXXXX or name@gmail.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className={inputClass()}
                />
              </Field>
              <Field id="login-password" label="Password">
                <PasswordInput
                  id="login-password"
                  autoComplete="current-password"
                  value={loginPassword}
                  onChange={setLoginPassword}
                  shown={showPassword}
                  onToggle={() => setShowPassword((v) => !v)}
                  required
                />
              </Field>
              <SubmitButton busy={busy} label="Sign in" busyLabel="Signing in…" />
              <p className="text-center text-sm text-slate">
                New here?{" "}
                <button
                  type="button"
                  onClick={() => switchTo("signup")}
                  className="font-semibold text-brand underline-offset-2 hover:underline"
                >
                  Create an account
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string
  label: string
  error?: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-charcoal">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-rose-600">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-slate">{hint}</p>
      )}
    </div>
  )
}

function PasswordInput({
  id,
  value,
  onChange,
  onBlur,
  shown,
  onToggle,
  autoComplete,
  invalid,
  required,
}: {
  id: string
  value: string
  onChange: (v: string) => void
  onBlur?: () => void
  shown: boolean
  onToggle: () => void
  autoComplete: string
  invalid?: boolean
  required?: boolean
}) {
  return (
    <div className="relative">
      <input
        id={id}
        type={shown ? "text" : "password"}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        required={required}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `${id}-error` : undefined}
        className={`${inputClass(invalid)} pr-16`}
      />
      <button
        type="button"
        onClick={onToggle}
        aria-label={shown ? "Hide password" : "Show password"}
        className="absolute right-1.5 top-[calc(50%+3px)] h-9 -translate-y-1/2 rounded-lg px-2.5 text-xs font-semibold text-slate hover:bg-cream hover:text-charcoal"
      >
        {shown ? "Hide" : "Show"}
      </button>
    </div>
  )
}

function SubmitButton({ busy, label, busyLabel }: { busy: boolean; label: string; busyLabel: string }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="flex h-12 w-full items-center justify-center rounded-xl bg-brand text-sm font-bold text-white transition hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30 disabled:opacity-70"
    >
      {busy ? busyLabel : label}
    </button>
  )
}
