// Small fetch helper for admin pages: sends the session cookie and turns
// API errors into readable messages.

export class ApiError extends Error {
  fieldErrors: Record<string, string[] | undefined>
  constructor(message: string, fieldErrors: Record<string, string[] | undefined> = {}) {
    super(message)
    this.fieldErrors = fieldErrors
  }
}

export async function adminFetch<T>(url: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    credentials: "include",
    ...init,
    headers: { "content-type": "application/json", ...(init.headers || {}) },
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    const err = body?.error
    if (res.status === 401) throw new ApiError("Your session has ended. Please sign in again.")
    if (res.status === 403) throw new ApiError("Only an admin can do this.")
    const details = err?.details && typeof err.details === "object" ? err.details : {}
    throw new ApiError(err?.message || `Something went wrong (${res.status}). Please try again.`, details)
  }
  return body?.data as T
}

export const taka = (n: number) => `৳${n.toLocaleString("en-IN")}`

/** "just now", "5 min ago", "2 h ago", else a short date. */
export function timeAgo(iso: string) {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime())
  const min = Math.floor(diff / 60000)
  if (min < 1) return "just now"
  if (min < 60) return `${min} min ago`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h} h ago`
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}

export const inputClass =
  "h-11 w-full rounded-lg border border-line bg-white px-3 text-base text-charcoal outline-none transition placeholder:text-slate/50 focus:border-brand focus:ring-2 focus:ring-brand/15 sm:text-sm"

export const labelClass = "mb-1.5 block text-sm font-medium text-charcoal"

export const btnPrimary =
  "inline-flex h-10 items-center justify-center rounded-lg bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50"

export const btnSecondary =
  "inline-flex h-10 items-center justify-center rounded-lg border border-line bg-white px-4 text-sm font-medium text-charcoal transition hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50"

export const btnDanger =
  "inline-flex h-10 items-center justify-center rounded-lg px-3 text-sm font-medium text-red-600 transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50"
