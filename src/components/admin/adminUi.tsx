import { useEffect, useRef, type FormEvent, type ReactNode } from "react"
import { btnPrimary, btnSecondary } from "./adminApi"

export function PageHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3">
      <h1 className="text-xl font-semibold text-charcoal">{title}</h1>
      {action}
    </div>
  )
}

export function Notice({ kind, children }: { kind: "error" | "ok"; children: ReactNode }) {
  return (
    <p
      role={kind === "error" ? "alert" : "status"}
      className={`mb-4 rounded-lg px-3 py-2.5 text-sm ${
        kind === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"
      }`}
    >
      {children}
    </p>
  )
}

export function Empty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-line px-6 py-12 text-center">
      <p className="font-medium text-charcoal">{title}</p>
      {hint && <p className="mt-1 text-sm text-slate">{hint}</p>}
    </div>
  )
}

export function ListSkeleton() {
  return (
    <div className="space-y-2" aria-hidden>
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-16 animate-pulse rounded-xl bg-cream" />
      ))}
    </div>
  )
}

/** Small on/off switch with a visible label. */
export function Toggle({
  checked,
  onChange,
  label,
  compact = false,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  /** Hide the label text on phones (still read by screen readers). */
  compact?: boolean
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm text-charcoal">
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="relative h-6 w-10 shrink-0 rounded-full bg-slate/30 transition peer-checked:bg-emerald-600 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-4" />
      <span className={compact ? "sr-only sm:not-sr-only" : undefined}>{label}</span>
    </label>
  )
}

/**
 * Form dialog: bottom sheet on phones, centred on larger screens.
 * Escape closes it; focus moves into it and back when it closes.
 */
export function FormDialog({
  title,
  onClose,
  onSubmit,
  saving,
  submitLabel,
  error,
  children,
  footerExtra,
}: {
  title: string
  onClose: () => void
  onSubmit: (e: FormEvent) => void
  saving: boolean
  submitLabel: string
  error?: string | null
  children: ReactNode
  footerExtra?: ReactNode
}) {
  const ref = useRef<HTMLFormElement>(null)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    ref.current?.querySelector<HTMLElement>("input, select, textarea")?.focus()
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("keydown", onKey)
      previous?.focus()
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-charcoal/50 sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <form
        ref={ref}
        onSubmit={onSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-dialog-title"
        className="flex max-h-[92dvh] w-full max-w-md flex-col rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 id="admin-dialog-title" className="font-semibold text-charcoal">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 place-items-center rounded-lg text-slate hover:bg-cream"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="grid gap-4 overflow-y-auto px-5 py-5">
          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          {children}
        </div>
        <div className="flex items-center gap-2 border-t border-line px-5 py-4">
          {footerExtra}
          <div className="ml-auto flex gap-2">
            <button type="button" onClick={onClose} className={btnSecondary}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className={btnPrimary}>
              {saving ? "Saving…" : submitLabel}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <span className="mt-1 block text-xs text-red-600">{message}</span>
}
