import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"

export interface AuthUser {
  id: number
  fullName: string
  email: string
  phone: string
  role: "CUSTOMER" | "STAFF" | "ADMIN"
  defaultAddress: string | null
  isActive: boolean
}

export interface SignupInput {
  fullName: string
  email: string
  phone: string
  password: string
  defaultAddress?: string | null
}

export interface UpdateProfileInput {
  fullName?: string
  phone?: string
  defaultAddress?: string | null
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isAuthModalOpen: boolean
  authModalDefaultTab: "login" | "signup"
  isMyOrdersOpen: boolean
  isAdminModalOpen: boolean
  openAuthModal: (tab?: "login" | "signup") => void
  closeAuthModal: () => void
  openMyOrders: () => void
  closeMyOrders: () => void
  setIsMyOrdersOpen: (open: boolean) => void
  openAdminModal: () => void
  closeAdminModal: () => void
  login: (identifier: string, password: string) => Promise<{ ok: boolean; error?: string }>
  signup: (data: SignupInput) => Promise<{ ok: boolean; error?: string }>
  logout: () => Promise<void>
  updateProfile: (data: UpdateProfileInput) => Promise<{ ok: boolean; error?: string }>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalDefaultTab, setAuthModalDefaultTab] = useState<"login" | "signup">("login")
  const [isMyOrdersOpen, setIsMyOrdersOpen] = useState(false)
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false)

  // Initial authentication check on load
  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      })

      if (res.ok) {
        const body = await res.json()
        if (body.data?.user) {
          setUser(body.data.user)
          return
        }
      }
      setUser(null)
    } catch (err) {
      console.warn("[AuthContext] Failed to verify active session:", err)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const openAuthModal = useCallback((tab: "login" | "signup" = "login") => {
    setAuthModalDefaultTab(tab)
    setIsAuthModalOpen(true)
  }, [])

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false)
  }, [])

  const openMyOrders = useCallback(() => {
    setIsMyOrdersOpen(true)
  }, [])

  const closeMyOrders = useCallback(() => {
    setIsMyOrdersOpen(false)
  }, [])

  const openAdminModal = useCallback(() => {
    setIsAdminModalOpen(true)
  }, [])

  const closeAdminModal = useCallback(() => {
    setIsAdminModalOpen(false)
  }, [])

  const login = useCallback(
    async (identifier: string, password: string) => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ identifier, password }),
        })

        const body = await res.json().catch(() => null)

        if (!res.ok) {
          const message = body?.error?.message || "ভুল তথ্য অথবা লগইন ব্যর্থ হয়েছে"
          return { ok: false, error: message }
        }

        if (body?.data?.user) {
          setUser(body.data.user)
          closeAuthModal()
          return { ok: true }
        }

        return {
          ok: false,
          error: "লগইন সেবা থেকে অপ্রত্যাশিত উত্তর এসেছে",
        }
      } catch (err) {
        return {
          ok: false,
          error: err instanceof Error ? err.message : "লগইনের সময় নেটওয়ার্ক সমস্যা হয়েছে",
        }
      }
    },
    [closeAuthModal],
  )

  const signup = useCallback(
    async (data: SignupInput) => {
      try {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(data),
        })

        const body = await res.json().catch(() => null)

        if (!res.ok) {
          const message = body?.error?.message || "রেজিস্ট্রেশন ব্যর্থ হয়েছে। তথ্যগুলো যাচাই করুন।"
          return { ok: false, error: message }
        }

        if (body?.data?.user) {
          setUser(body.data.user)
          closeAuthModal()
          return { ok: true }
        }

        return {
          ok: false,
          error: "রেজিস্ট্রেশন সেবা থেকে অপ্রত্যাশিত উত্তর এসেছে",
        }
      } catch (err) {
        return {
          ok: false,
          error: err instanceof Error ? err.message : "রেজিস্ট্রেশনের সময় নেটওয়ার্ক সমস্যা হয়েছে",
        }
      }
    },
    [closeAuthModal],
  )

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
    } catch (err) {
      console.warn("[AuthContext] Logout request error:", err)
    } finally {
      setUser(null)
      setIsMyOrdersOpen(false)
      setIsAdminModalOpen(false)
    }
  }, [])

  const updateProfile = useCallback(async (data: UpdateProfileInput) => {
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      })

      const body = await res.json().catch(() => null)

      if (!res.ok) {
        return {
          ok: false,
          error: body?.error?.message || "প্রোফাইল আপডেট করা যায়নি",
        }
      }

      if (body?.data?.user) {
        setUser(body.data.user)
        return { ok: true }
      }

      return { ok: true }
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "প্রোফাইল আপডেট করা যায়নি",
      }
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthModalOpen,
        authModalDefaultTab,
        isMyOrdersOpen,
        isAdminModalOpen,
        openAuthModal,
        closeAuthModal,
        openMyOrders,
        closeMyOrders,
        setIsMyOrdersOpen,
        openAdminModal,
        closeAdminModal,
        login,
        signup,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
