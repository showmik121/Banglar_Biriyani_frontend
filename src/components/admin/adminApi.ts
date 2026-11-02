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
    throw new ApiError(err?.message || `Request failed (${res.status})`, err?.details || {})
  }
  return body?.data as T
}

export const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"

export const labelClass = "mb-1.5 block text-xs font-semibold text-slate-700"
