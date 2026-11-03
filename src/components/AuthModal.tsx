import { useState, useEffect, useRef, type FormEvent } from "react"
import { useAuth } from "../context/AuthContext"
import { useBodyScrollLock } from "../hooks/useBodyScrollLock"
import { useFocusTrap } from "../hooks/useFocusTrap"

export function AuthModal() {
  const { isAuthModalOpen, authModalDefaultTab, closeAuthModal, login, signup } = useAuth()
  const modalRef = useRef<HTMLDivElement>(null)

  useBodyScrollLock(isAuthModalOpen)
  useFocusTrap(modalRef, isAuthModalOpen)

  const [activeTab, setActiveTab] = useState<"login" | "signup">("login")

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [showLoginPassword, setShowLoginPassword] = useState(false)

  // Signup form state
  const [signupFullName, setSignupFullName] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPhone, setSignupPhone] = useState("")
  const [signupAddress, setSignupAddress] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [showSignupPassword, setShowSignupPassword] = useState(false)

  // Status & error state
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const firstInputRef = useRef<HTMLInputElement>(null)

  // Synchronize active tab with context default tab when opened
  useEffect(() => {
    if (isAuthModalOpen) {
      setActiveTab(authModalDefaultTab)
      setErrorMessage(null)
      setTimeout(() => firstInputRef.current?.focus(), 50)
    }
  }, [isAuthModalOpen, authModalDefaultTab])

  // Close on Escape key
  useEffect(() => {
    if (!isAuthModalOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeAuthModal()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isAuthModalOpen, closeAuthModal])

  if (!isAuthModalOpen) return null

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (isLoading) return
    setErrorMessage(null)

    if (!loginIdentifier.trim()) {
      setErrorMessage("আপনার ইমেইল বা মোবাইল নম্বর দিন")
      return
    }
    if (!loginPassword) {
      setErrorMessage("আপনার পাসওয়ার্ড দিন")
      return
    }

    setIsLoading(true)
    const result = await login(loginIdentifier.trim(), loginPassword)
    setIsLoading(false)

    if (!result.ok) {
      setErrorMessage(result.error || "লগইন ব্যর্থ হয়েছে")
    }
  }

  const handleSignupSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (isLoading) return
    setErrorMessage(null)

    if (!signupFullName.trim()) {
      setErrorMessage("পুরো নাম দিতে হবে")
      return
    }
    if (!signupEmail.trim() || !signupEmail.includes("@")) {
      setErrorMessage("সঠিক ইমেইল ঠিকানা দিতে হবে")
      return
    }
    if (!signupPhone.trim()) {
      setErrorMessage("মোবাইল নম্বর দিতে হবে")
      return
    }
    if (signupPassword.length < 8) {
      setErrorMessage("পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে")
      return
    }

    setIsLoading(true)
    const result = await signup({
      fullName: signupFullName.trim(),
      email: signupEmail.trim(),
      phone: signupPhone.trim(),
      defaultAddress: signupAddress.trim() || null,
      password: signupPassword,
    })
    setIsLoading(false)

    if (!result.ok) {
      setErrorMessage(result.error || "রেজিস্ট্রেশন ব্যর্থ হয়েছে")
    }
  }

  const fillDemoAccount = (identifier: string, password: string) => {
    setActiveTab("login")
    setLoginIdentifier(identifier)
    setLoginPassword(password)
    setErrorMessage(null)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal/60 backdrop-blur-xs transition-opacity"
        onClick={closeAuthModal}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        ref={modalRef}
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl transition-all"
      >
        {/* Top Header with Brand Badge and Close Button */}
        <div className="relative border-b border-line bg-gradient-to-r from-white via-[#FFF0F3]/50 to-white px-6 pb-4 pt-6">
          <button
            type="button"
            onClick={closeAuthModal}
            className="absolute right-4 top-4 grid size-9 place-items-center rounded-full text-slate transition hover:bg-slate/10 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4002B]"
            aria-label="লগইন উইন্ডো বন্ধ করুন"
          >
            <svg
              className="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-full bg-[#E4002B] text-xs font-bold text-white shadow-xs">
              BB
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#E4002B]">
              বাংলার বিরিয়ানি
            </span>
          </div>

          <h2
            id="auth-modal-title"
            className="mt-2 text-2xl font-bold tracking-tight text-charcoal"
          >
            {activeTab === "login" ? "লগইন করুন" : "অ্যাকাউন্ট তৈরি করুন"}
          </h2>
          <p className="mt-0.5 text-xs text-slate">
            {activeTab === "login"
              ? "অর্ডার পরিচালনা, মিল নির্ধারণ ও দ্রুত চেকআউটের জন্য লগইন করুন।"
              : "রেজিস্ট্রেশন করে রিওয়ার্ড পান এবং ১ ক্লিকে খাঁটি বিরিয়ানি অর্ডার করুন।"}
          </p>

          {/* Tab Selector */}
          <div className="mt-4 flex rounded-xl bg-alabaster p-1 text-sm font-semibold">
            <button
              type="button"
              onClick={() => {
                setActiveTab("login")
                setErrorMessage(null)
              }}
              className={`flex-1 rounded-lg py-1.5 transition ${
                activeTab === "login"
                  ? "bg-white text-[#E4002B] shadow-xs"
                  : "text-slate hover:text-charcoal"
              }`}
            >
              লগইন
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("signup")
                setErrorMessage(null)
              }}
              className={`flex-1 rounded-lg py-1.5 transition ${
                activeTab === "signup"
                  ? "bg-white text-[#E4002B] shadow-xs"
                  : "text-slate hover:text-charcoal"
              }`}
            >
              রেজিস্ট্রেশন
            </button>
          </div>
        </div>

        {/* Error Notification Banner */}
        {errorMessage && (
          <div
            role="alert"
            aria-live="polite"
            className="flex items-start gap-2 border-b border-rose-200 bg-rose-50 px-6 py-2.5 text-xs font-medium text-rose-700"
          >
            <svg
              className="mt-0.5 size-4 shrink-0 text-rose-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6">
          {activeTab === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="login-identifier"
                  className="block text-xs font-semibold text-charcoal"
                >
                  ইমেইল বা মোবাইল নম্বর
                </label>
                <div className="relative mt-1">
                  <input
                    ref={firstInputRef}
                    id="login-identifier"
                    type="text"
                    autoComplete="username"
                    placeholder="যেমন: 01711000003 বা customer@banglarbiriyani.com"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    required
                    className="block w-full rounded-xl border border-line bg-alabaster/40 px-3.5 py-2.5 text-sm text-charcoal transition placeholder:text-slate/60 focus:border-[#E4002B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E4002B]/20"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-charcoal"
                >
                  পাসওয়ার্ড
                </label>
                <div className="relative mt-1">
                  <input
                    id="login-password"
                    type={showLoginPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className="block w-full rounded-xl border border-line bg-alabaster/40 px-3.5 py-2.5 pr-10 text-sm text-charcoal transition placeholder:text-slate/60 focus:border-[#E4002B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E4002B]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate hover:text-charcoal"
                    aria-label={showLoginPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখান"}
                  >
                    <svg
                      className="size-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      {showLoginPassword ? (
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" />
                      ) : (
                        <>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#E4002B] py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#B80022] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#E4002B]/30 disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <svg className="size-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    লগইন হচ্ছে...
                  </>
                ) : (
                  "বাংলার বিরিয়ানিতে লগইন করুন"
                )}
              </button>

              {/* Quick Fill Demo Section */}
              <div className="pt-2">
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-line" />
                  </div>
                  <span className="relative bg-white px-2 text-[11px] font-semibold uppercase tracking-wider text-slate">
                    ডেমো অ্যাকাউন্ট দিয়ে দ্রুত পূরণ
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => fillDemoAccount("customer@banglarbiriyani.com", "Customer@1234")}
                    className="flex flex-col items-center rounded-lg border border-line bg-alabaster/60 p-2 text-center transition hover:border-[#E4002B] hover:bg-[#FFF0F3]"
                  >
                    <span className="text-xs font-bold text-charcoal">গ্রাহক</span>
                    <span className="text-[10px] text-slate">তানভীর আহমেদ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillDemoAccount("kitchen@banglarbiriyani.com", "Staff@1234")}
                    className="flex flex-col items-center rounded-lg border border-line bg-alabaster/60 p-2 text-center transition hover:border-[#E4002B] hover:bg-[#FFF0F3]"
                  >
                    <span className="text-xs font-bold text-charcoal">কিচেন স্টাফ</span>
                    <span className="text-[10px] text-slate">শেফ রহিম</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillDemoAccount("admin@banglarbiriyani.com", "Admin@1234")}
                    className="flex flex-col items-center rounded-lg border border-line bg-alabaster/60 p-2 text-center transition hover:border-[#E4002B] hover:bg-[#FFF0F3]"
                  >
                    <span className="text-xs font-bold text-charcoal">অ্যাডমিন</span>
                    <span className="text-[10px] text-slate">মালিক</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              <div>
                <label
                  htmlFor="signup-fullname"
                  className="block text-xs font-semibold text-charcoal"
                >
                  পুরো নাম
                </label>
                <input
                  ref={firstInputRef}
                  id="signup-fullname"
                  type="text"
                  placeholder="যেমন: তানভীর আহমেদ"
                  value={signupFullName}
                  onChange={(e) => setSignupFullName(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-xl border border-line bg-alabaster/40 px-3.5 py-2 text-sm text-charcoal transition placeholder:text-slate/60 focus:border-[#E4002B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E4002B]/20"
                />
              </div>

              <div>
                <label htmlFor="signup-email" className="block text-xs font-semibold text-charcoal">
                  ইমেইল ঠিকানা
                </label>
                <input
                  id="signup-email"
                  type="email"
                  placeholder="name@example.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-xl border border-line bg-alabaster/40 px-3.5 py-2 text-sm text-charcoal transition placeholder:text-slate/60 focus:border-[#E4002B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E4002B]/20"
                />
              </div>

              <div>
                <label htmlFor="signup-phone" className="block text-xs font-semibold text-charcoal">
                  মোবাইল নম্বর
                </label>
                <input
                  id="signup-phone"
                  type="tel"
                  placeholder="017XXXXXXXX"
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-xl border border-line bg-alabaster/40 px-3.5 py-2 text-sm text-charcoal transition placeholder:text-slate/60 focus:border-[#E4002B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E4002B]/20"
                />
              </div>

              <div>
                <label
                  htmlFor="signup-address"
                  className="block text-xs font-semibold text-charcoal"
                >
                  ডিফল্ট ডেলিভারি ঠিকানা
                </label>
                <input
                  id="signup-address"
                  type="text"
                  placeholder="বাসা, রোড, এলাকা (যেমন: ধানমন্ডি, ঢাকা)"
                  value={signupAddress}
                  onChange={(e) => setSignupAddress(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-line bg-alabaster/40 px-3.5 py-2 text-sm text-charcoal transition placeholder:text-slate/60 focus:border-[#E4002B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E4002B]/20"
                />
              </div>

              <div>
                <label
                  htmlFor="signup-password"
                  className="block text-xs font-semibold text-charcoal"
                >
                  পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)
                </label>
                <div className="relative mt-1">
                  <input
                    id="signup-password"
                    type={showSignupPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    minLength={8}
                    className="block w-full rounded-xl border border-line bg-alabaster/40 px-3.5 py-2 pr-10 text-sm text-charcoal transition placeholder:text-slate/60 focus:border-[#E4002B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E4002B]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate hover:text-charcoal"
                    aria-label={showSignupPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখান"}
                  >
                    <svg
                      className="size-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      {showSignupPassword ? (
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" />
                      ) : (
                        <>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#E4002B] py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#B80022] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#E4002B]/30 disabled:opacity-70"
              >
                {isLoading ? "অ্যাকাউন্ট তৈরি হচ্ছে..." : "অ্যাকাউন্ট তৈরি করুন"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
