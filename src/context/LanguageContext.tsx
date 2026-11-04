import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"

export type Lang = "en" | "bn"

const STORAGE_KEY = "bb_lang"

/** First visit: Bangla if the phone or browser is set to Bangla, otherwise English. */
function initialLang(key: string = STORAGE_KEY, fallback?: Lang): Lang {
  try {
    const saved = localStorage.getItem(key)
    if (saved === "en" || saved === "bn") return saved
  } catch {
    // storage blocked (private mode): fall through
  }
  if (fallback) return fallback
  if (typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("bn")) return "bn"
  return "en"
}

const formatters: Record<Lang, Intl.NumberFormat> = {
  en: new Intl.NumberFormat("en-IN"),
  bn: new Intl.NumberFormat("bn-BD", { useGrouping: true }),
}
const BN_DIGITS = "০১২৩৪৫৬৭৮৯"

interface LanguageValue {
  lang: Lang
  setLang: (lang: Lang) => void
  /** Pick the text for the current language: tr("Cart", "কার্ট") */
  tr: (en: string, bn: string) => string
  /** 1250 -> "1,250" or "১,২৫০" */
  num: (n: number) => string
  /** 1250 -> "৳1,250" or "৳১,২৫০" */
  taka: (n: number) => string
  /** Turns every digit in a string into Bangla digits in Bangla mode ("15-20 min" -> "১৫-২০") */
  digits: (s: string) => string
}

const makeValue = (lang: Lang, setLang: (l: Lang) => void): LanguageValue => ({
  lang,
  setLang,
  tr: (en, bn) => (lang === "bn" ? bn : en),
  num: (n) => formatters[lang].format(n),
  taka: (n) => `৳${formatters[lang].format(n)}`,
  digits: (s) => (lang === "bn" ? s.replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]) : s),
})

// English by default, so components also work outside the provider (tests, admin).
const LanguageContext = createContext<LanguageValue>(makeValue("en", () => {}))

/** storageKey / defaultLang let the admin panel keep its own choice (Bangla by default). */
export function LanguageProvider({
  children,
  storageKey = STORAGE_KEY,
  defaultLang,
}: {
  children: ReactNode
  storageKey?: string
  defaultLang?: Lang
}) {
  const [lang, setLangState] = useState<Lang>(() => initialLang(storageKey, defaultLang))

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      localStorage.setItem(storageKey, next)
    } catch {
      // not saved; still switches for this visit
    }
  }, [storageKey])

  const value = useMemo(() => makeValue(lang, setLang), [lang, setLang])
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export const useLang = () => useContext(LanguageContext)
