import "@testing-library/jest-dom/vitest"
import { afterEach } from "vitest"
import { cleanup } from "@testing-library/react"

// Newer Node versions ship their own (disabled) global localStorage, which hides the
// browser one from jsdom. Use a small in-memory version so tests behave the same on
// every Node version.
function createMemoryStorage(): Storage {
  const data = new Map<string, string>()
  return {
    get length() {
      return data.size
    },
    clear: () => data.clear(),
    getItem: (key) => (data.has(key) ? data.get(key)! : null),
    key: (index) => [...data.keys()][index] ?? null,
    removeItem: (key) => void data.delete(key),
    setItem: (key, value) => void data.set(key, String(value)),
  }
}

if (typeof globalThis.localStorage?.getItem !== "function") {
  const storage = createMemoryStorage()
  Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true })
  if (typeof window !== "undefined" && window !== globalThis) {
    Object.defineProperty(window, "localStorage", { value: storage, configurable: true })
  }
}

afterEach(() => {
  cleanup()
  localStorage.clear()
})
