import { useEffect, useRef, useState } from "react"
import { useLang } from "../context/LanguageContext"

interface GoogleIdentity {
  initialize: (config: { client_id: string; callback: (response: { credential?: string }) => void }) => void
  renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void
}
declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleIdentity } }
  }
}

const SCRIPT_SRC = "https://accounts.google.com/gsi/client"
let scriptLoading: Promise<void> | null = null

function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve()
  scriptLoading ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script")
    script.src = SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => {
      scriptLoading = null
      script.remove()
      reject(new Error("Google sign-in could not load"))
    }
    document.head.appendChild(script)
  })
  return scriptLoading
}

/**
 * "Continue with Google". Shows nothing until the server says Google sign-in is set up
 * (GOOGLE_CLIENT_ID), so the shop works the same without it.
 * The button itself is drawn by Google; onCredential gets the signed ID token, which the
 * server then verifies.
 */
export function GoogleSignInButton({ onCredential }: { onCredential: (credential: string) => void }) {
  const { tr, lang } = useLang()
  const holder = useRef<HTMLDivElement>(null)
  const [clientId, setClientId] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const latest = useRef(onCredential)
  latest.current = onCredential

  useEffect(() => {
    let live = true
    fetch("/api/auth/config")
      .then((res) => res.json())
      .then((body) => live && setClientId(typeof body?.data?.googleClientId === "string" ? body.data.googleClientId : null))
      .catch(() => {
        // not set up or offline: the button just stays hidden
      })
    return () => {
      live = false
    }
  }, [])

  useEffect(() => {
    if (!clientId) return
    let live = true
    loadGoogleScript()
      .then(() => {
        const id = window.google?.accounts?.id
        if (!live || !holder.current || !id) return
        id.initialize({
          client_id: clientId,
          callback: (response) => response.credential && latest.current(response.credential),
        })
        id.renderButton(holder.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "pill",
          logo_alignment: "left",
          width: Math.min(400, Math.max(200, holder.current.clientWidth || 300)),
          locale: lang === "bn" ? "bn" : "en",
        })
      })
      .catch(() => live && setFailed(true))
    return () => {
      live = false
    }
    // The button is drawn once per opening; a language switch does not need a redraw
  }, [clientId])

  if (!clientId || failed) return null
  return (
    <div className="mt-5">
      <div className="flex items-center gap-3 text-xs text-slate" aria-hidden>
        <span className="h-px flex-1 bg-line" />
        {tr("or", "অথবা")}
        <span className="h-px flex-1 bg-line" />
      </div>
      <div ref={holder} data-testid="google-button" className="mt-4 flex min-h-11 justify-center" />
    </div>
  )
}
