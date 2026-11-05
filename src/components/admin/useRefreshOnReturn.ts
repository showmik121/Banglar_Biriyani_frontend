import { useEffect } from "react"

/**
 * Reloads a list when the owner comes back to the admin page (switches back to the
 * browser tab or wakes the phone), so it never shows stale data.
 */
export function useRefreshOnReturn(load: () => void) {
  useEffect(() => {
    const onVisible = () => document.visibilityState === "visible" && load()
    document.addEventListener("visibilitychange", onVisible)
    window.addEventListener("online", onVisible)
    return () => {
      document.removeEventListener("visibilitychange", onVisible)
      window.removeEventListener("online", onVisible)
    }
  }, [load])
}
