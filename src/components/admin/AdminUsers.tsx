import { formatBdt, roleLabelBn, toBengaliNumber } from "../../utils/bengali"
import { useState, useEffect, useCallback, useMemo } from "react"
import { useAuth } from "../../context/AuthContext"

interface AdminUserRecord {
  id: number
  fullName: string
  email: string
  phone: string
  role: "CUSTOMER" | "STAFF" | "ADMIN"
  defaultAddress: string | null
  isActive: boolean
  createdAt: string
  orderCount: number
  totalSpendBdt: number
}

const ROLES = ["CUSTOMER", "STAFF", "ADMIN"] as const

export function AdminUsers() {
  const { user: currentUser } = useAuth()
  const [usersList, setUsersList] = useState<AdminUserRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("ALL")
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [toastMessage, setToastMessage] = useState<{
    text: string
    isError?: boolean
  } | null>(null)

  const showToast = (text: string, isError = false) => {
    setToastMessage({ text, isError })
    setTimeout(() => setToastMessage(null), 3500)
  }

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/admin/users", { credentials: "include" })
      if (!res.ok) throw new Error("ব্যবহারকারীর তালিকা লোড করা যায়নি")
      const json = await res.json()
      setUsersList(json.data || [])
    } catch (err) {
      console.error("Fetch users error:", err)
      showToast(err instanceof Error ? err.message : "ব্যবহারকারী লোডে সমস্যা হয়েছে", true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Handle role change with guardrail & optimistic update
  const handleRoleChange = async (
    targetUser: AdminUserRecord,
    nextRole: "CUSTOMER" | "STAFF" | "ADMIN",
  ) => {
    if (targetUser.id === currentUser?.id && nextRole !== "ADMIN") {
      alert("নিরাপত্তা সীমা: আপনি নিজের সক্রিয় অ্যাডমিন অ্যাকাউন্টের ভূমিকা কমাতে পারবেন না।")
      return
    }

    const previousRole = targetUser.role

    // Optimistic UI update
    setUsersList((prev) => prev.map((u) => (u.id === targetUser.id ? { ...u, role: nextRole } : u)))

    try {
      setUpdatingId(targetUser.id)
      const res = await fetch(`/api/admin/users/${targetUser.id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role: nextRole }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error?.message || "ব্যবহারকারীর ভূমিকা আপডেট করা যায়নি")
      }

      showToast(`${targetUser.fullName} এর ভূমিকা এখন ${roleLabelBn(nextRole)}`)
    } catch (err) {
      // Rollback
      setUsersList((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, role: previousRole } : u)),
      )
      showToast(err instanceof Error ? err.message : "ভূমিকা আপডেট করা যায়নি", true)
    } finally {
      setUpdatingId(null)
    }
  }

  // Handle account active toggle
  const handleToggleActive = async (targetUser: AdminUserRecord) => {
    if (targetUser.id === currentUser?.id) {
      alert("নিরাপত্তা সীমা: আপনি নিজের অ্যাডমিন অ্যাকাউন্ট স্থগিত করতে পারবেন না।")
      return
    }

    const nextActive = !targetUser.isActive

    // Optimistic UI update
    setUsersList((prev) =>
      prev.map((u) => (u.id === targetUser.id ? { ...u, isActive: nextActive } : u)),
    )

    try {
      setUpdatingId(targetUser.id)
      const res = await fetch(`/api/admin/users/${targetUser.id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive: nextActive }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error?.message || "স্ট্যাটাস পরিবর্তন করা যায়নি")
      }

      showToast(`${targetUser.fullName} এর অ্যাকাউন্ট এখন ${nextActive ? "সক্রিয়" : "স্থগিত"}`)
    } catch (err) {
      // Rollback
      setUsersList((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, isActive: targetUser.isActive } : u)),
      )
      showToast("অ্যাকাউন্ট স্ট্যাটাস আপডেটে সমস্যা হয়েছে", true)
    } finally {
      setUpdatingId(null)
    }
  }

  // Format joined date nicely
  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString)
      return d.toLocaleDateString("bn-BD", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    } catch {
      return dateString
    }
  }

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase().trim()
    return usersList.filter((u) => {
      const matchSearch =
        !q ||
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.includes(q)
      const matchRole = roleFilter === "ALL" || u.role === roleFilter
      return matchSearch && matchRole
    })
  }, [usersList, search, roleFilter])

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold shadow-2xl transition animate-in fade-in slide-in-from-bottom-3 ${
            toastMessage.isError
              ? "border border-rose-200 bg-rose-50 text-rose-800"
              : "border border-emerald-200 bg-emerald-50 text-emerald-800 shadow-lg"
          }`}
        >
          <span className="size-2 rounded-full bg-current animate-ping" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-rose-50 px-2.5 py-0.5 font-mono text-[10px] font-bold text-rose-700 ring-1 ring-rose-200">
              শুধু অ্যাডমিনের জন্য
            </span>
            <span className="text-xs text-slate-500">
              মোট {toBengaliNumber(usersList.length)}টি অ্যাকাউন্ট
            </span>
          </div>
          <h2 className="mt-1 font-display text-xl font-bold text-slate-900 sm:text-2xl">
            গ্রাহক ও স্টাফ
          </h2>
        </div>

        <button
          type="button"
          onClick={fetchUsers}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition"
        >
          <svg
            className={`size-3.5 ${isLoading ? "animate-spin text-[#D7232B]" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 16h5v5" />
          </svg>
          <span>তালিকা রিফ্রেশ করুন</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="নাম, ইমেইল বা মোবাইল (০১XXXXXXXXX) দিয়ে খুঁজুন..."
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#D7232B] focus:ring-1 focus:ring-[#D7232B]/20 focus:outline-none"
          />

          <div className="flex gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200">
            {["ALL", "ADMIN", "STAFF", "CUSTOMER"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  roleFilter === r
                    ? "bg-[#D7232B] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex min-h-[350px] flex-col items-center justify-center space-y-3">
            <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#D7232B]" />
            <p className="text-xs text-slate-500">ব্যবহারকারীর তথ্য লোড হচ্ছে...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
            <p className="text-sm font-semibold text-slate-800">কোনো ব্যবহারকারী পাওয়া যায়নি</p>
            <p className="mt-1 text-xs text-slate-500">
              খোঁজার সাথে মিলে এমন কোনো নিবন্ধিত ব্যবহারকারী নেই।
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 uppercase tracking-wider text-slate-600">
                <tr>
                  <th scope="col" className="px-5 py-3.5 font-semibold">
                    গ্রাহক / স্টাফ
                  </th>
                  <th scope="col" className="px-5 py-3.5 font-semibold">
                    যোগাযোগ ও ঠিকানা
                  </th>
                  <th scope="col" className="px-5 py-3.5 font-semibold">
                    ভূমিকা
                  </th>
                  <th scope="col" className="px-5 py-3.5 font-semibold">
                    মোট অর্ডার
                  </th>
                  <th scope="col" className="px-5 py-3.5 font-semibold">
                    মোট খরচ (টাকা)
                  </th>
                  <th scope="col" className="px-5 py-3.5 font-semibold">
                    যোগদানের তারিখ
                  </th>
                  <th scope="col" className="px-5 py-3.5 font-semibold text-center">
                    অ্যাকাউন্ট স্ট্যাটাস
                  </th>
                  <th scope="col" className="px-5 py-3.5 font-semibold text-right">
                    ভূমিকা পরিবর্তন
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredUsers.map((u) => {
                  const isSelf = u.id === currentUser?.id

                  return (
                    <tr key={u.id} className="transition hover:bg-slate-50/80 group">
                      {/* Name & Email */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 uppercase text-xs border border-slate-200 shrink-0">
                            {u.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900">{u.fullName}</span>
                              {isSelf && (
                                <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                                  আপনি (সক্রিয় অ্যাডমিন)
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact & Address */}
                      <td className="px-5 py-4">
                        <p className="font-mono text-slate-800">📞 {u.phone}</p>
                        <p className="max-w-[180px] truncate text-[11px] text-slate-500">
                          {u.defaultAddress || "কোনো ডিফল্ট ঠিকানা সংরক্ষিত নেই"}
                        </p>
                      </td>

                      {/* Role Badge */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            u.role === "ADMIN"
                              ? "bg-[#D7232B]/10 text-[#D7232B] ring-1 ring-[#D7232B]/20"
                              : u.role === "STAFF"
                                ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {roleLabelBn(u.role)}
                        </span>
                      </td>

                      {/* Total Orders */}
                      <td className="px-5 py-4 font-mono font-semibold text-slate-800">
                        {toBengaliNumber(u.orderCount)}টি অর্ডার
                      </td>

                      {/* Total Spend */}
                      <td className="px-5 py-4 font-mono font-bold text-[#D7232B] text-sm">
                        {formatBdt(u.totalSpendBdt)}
                      </td>

                      {/* Joined Date */}
                      <td className="px-5 py-4 text-[11px] text-slate-500 font-mono">
                        {formatDate(u.createdAt)}
                      </td>

                      {/* Account Active / Suspended toggle */}
                      <td className="px-5 py-4 text-center">
                        <button
                          type="button"
                          disabled={isSelf || updatingId === u.id}
                          onClick={() => handleToggleActive(u)}
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold transition ${
                            u.isActive
                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                              : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                          } ${
                            isSelf
                              ? "opacity-50 cursor-not-allowed"
                              : "cursor-pointer hover:opacity-80"
                          }`}
                        >
                          {u.isActive ? "● সক্রিয়" : "○ স্থগিত"}
                        </button>
                      </td>

                      {/* RBAC Role Selector Dropdown */}
                      <td className="px-5 py-4 text-right">
                        <select
                          disabled={isSelf || updatingId === u.id}
                          value={u.role}
                          onChange={(e) =>
                            handleRoleChange(u, e.target.value as "CUSTOMER" | "STAFF" | "ADMIN")
                          }
                          className={`rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs transition focus:border-[#D7232B] focus:outline-none ${
                            isSelf ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                          }`}
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {roleLabelBn(r)}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
