import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { act, renderHook } from "@testing-library/react"
import type { ReactNode } from "react"
import { AddressProvider, useAddress } from "../src/context/AddressContext"
import { CartProvider, useCart } from "../src/context/CartContext"
import { getTodayDay } from "../src/components/DayPillBar"
import { dhakaClock, mealIsOpen, mealTimeNow } from "../src/i18n/mealTimes"
import { bengaliToAsciiDigits, normalizePhone } from "../src/utils/phone"

const ADDRESS_KEY = "banglar_biriyani_addresses_v2"
const CART_KEY = "banglar_biriyani_cart_v1"

// Recovering from damaged data logs a console.error on purpose (so the problem is visible in
// the browser console). The tests capture it instead of printing it, and check it where it matters.
let consoleError: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  localStorage.clear()
  consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  localStorage.clear()
})

const addressWrapper = ({ children }: { children: ReactNode }) => <AddressProvider>{children}</AddressProvider>
const cartWrapper = ({ children }: { children: ReactNode }) => <CartProvider>{children}</CartProvider>

const goodAddress = { id: "a1", label: "Home", area: "Savar", details: "House 1, Road 2" }
const goodCartLine = { menuItemId: 1, name: "Kacchi", priceBdt: 450, scheduledDay: "Monday", quantity: 2 }

describe("saved addresses that are damaged", () => {
  test.each([
    ["not JSON", "{oops"],
    ["an object instead of a list", "{}"],
    ["a list of nothing useful", '[null, 5, "x", {"id":1}, {"id":"z"}]'],
  ])("%s -> starts with no addresses and the app keeps working", (_name, stored) => {
    localStorage.setItem(ADDRESS_KEY, stored)
    const { result } = renderHook(() => useAddress(), { wrapper: addressWrapper })
    expect(result.current.addresses).toEqual([])
    act(() => {
      result.current.setFreeformAddress("House 9, Road 3, Savar")
    })
    expect(result.current.addresses).toHaveLength(1)
  })

  test("keeps the good addresses and drops only the broken ones", () => {
    localStorage.setItem(ADDRESS_KEY, JSON.stringify([null, goodAddress, { id: "b", details: 7 }]))
    const { result } = renderHook(() => useAddress(), { wrapper: addressWrapper })
    expect(result.current.addresses).toEqual([goodAddress])
    act(() => {
      result.current.setFreeformAddress("House 9, Road 3, Savar")
    })
    expect(result.current.addresses).toHaveLength(2)
  })
})

describe("saved cart that is damaged", () => {
  test.each([
    ["an object instead of a list", "{}"],
    ["not JSON", "[[["],
  ])("%s -> empty cart", (_name, stored) => {
    localStorage.setItem(CART_KEY, stored)
    const { result } = renderHook(() => useCart(), { wrapper: cartWrapper })
    expect(result.current.items).toEqual([])
    expect(result.current.totalBdt).toBe(0)
    // Garbage that is valid JSON but not a list is dropped silently; unparseable text is reported
    if (stored === "[[[") expect(consoleError).toHaveBeenCalled()
  })

  test("fractional or non-numeric lines are dropped and huge quantities are capped at 50", () => {
    localStorage.setItem(
      CART_KEY,
      JSON.stringify([
        goodCartLine,
        { ...goodCartLine, menuItemId: 2, quantity: 1.5 },
        { ...goodCartLine, menuItemId: 1.5 },
        { ...goodCartLine, menuItemId: 3, quantity: "2" },
        { ...goodCartLine, menuItemId: 4, quantity: 1_000_000_000 },
        { ...goodCartLine, menuItemId: 5, priceBdt: null },
      ]),
    )
    const { result } = renderHook(() => useCart(), { wrapper: cartWrapper })
    expect(result.current.items.map((i) => [i.menuItemId, i.quantity])).toEqual([
      [1, 2],
      [4, 50],
    ])
  })
})

describe("phone numbers typed with a Bangla keyboard", () => {
  test("Bengali digits become ordinary digits", () => {
    expect(bengaliToAsciiDigits("০১৭১১২৩৪৫৬৭")).toBe("01711234567")
    expect(normalizePhone("০১৭১১-২৩৪৫৬৭")).toBe("01711234567")
  })

  test("country code, spaces and mixed digits are handled", () => {
    expect(normalizePhone("+৮৮০ ১৭১১-২৩৪৫৬৭")).toBe("01711234567")
    expect(normalizePhone("+880 1711-234567")).toBe("01711234567")
    expect(normalizePhone("০1711234567")).toBe("01711234567")
    expect(normalizePhone("")).toBe("")
  })
})

describe("today and the current meal follow Bangladesh time, not the device's time zone", () => {
  test("17:30 in Dhaka (11:30 UTC) is dinner time", () => {
    expect(mealTimeNow(new Date("2026-11-05T11:30:00Z"))).toBe("DINNER")
  })

  test("15:00 in Dhaka (09:00 UTC) is still lunch time", () => {
    expect(mealTimeNow(new Date("2026-11-05T09:00:00Z"))).toBe("LUNCH")
  })

  test("the day flips at midnight Dhaka time (18:00 UTC), not at midnight UTC", () => {
    expect(dhakaClock(new Date("2026-11-05T17:59:00Z"))).toEqual({ day: "THURSDAY", hour: 23 + 59 / 60 })
    expect(dhakaClock(new Date("2026-11-05T18:00:00Z"))).toEqual({ day: "FRIDAY", hour: 0 })
    expect(dhakaClock(new Date("2026-11-05T23:59:00Z"))).toMatchObject({ day: "FRIDAY" })
    expect(dhakaClock(new Date("2026-11-06T00:00:00Z"))).toEqual({ day: "FRIDAY", hour: 6 })
  })

  test("both meals are closed around midnight and the edges are exact", () => {
    const hourAt = (iso: string) => dhakaClock(new Date(iso)).hour
    // Lunch 12:00 up to (not including) 16:00 -> 06:00Z up to 10:00Z
    expect(mealIsOpen("LUNCH", hourAt("2026-11-05T05:59:00Z"))).toBe(false)
    expect(mealIsOpen("LUNCH", hourAt("2026-11-05T06:00:00Z"))).toBe(true)
    expect(mealIsOpen("LUNCH", hourAt("2026-11-05T09:59:00Z"))).toBe(true)
    expect(mealIsOpen("LUNCH", hourAt("2026-11-05T10:00:00Z"))).toBe(false)
    // Dinner 18:00 up to (not including) 22:00 -> 12:00Z up to 16:00Z
    expect(mealIsOpen("DINNER", hourAt("2026-11-05T11:59:00Z"))).toBe(false)
    expect(mealIsOpen("DINNER", hourAt("2026-11-05T12:00:00Z"))).toBe(true)
    expect(mealIsOpen("DINNER", hourAt("2026-11-05T15:59:00Z"))).toBe(true)
    expect(mealIsOpen("DINNER", hourAt("2026-11-05T16:00:00Z"))).toBe(false)
    // Midnight and the small hours in Dhaka (18:00Z-23:59Z): nothing is open
    for (const iso of ["2026-11-05T18:00:00Z", "2026-11-05T20:30:00Z", "2026-11-05T23:59:00Z"]) {
      expect(mealIsOpen("LUNCH", hourAt(iso)), iso).toBe(false)
      expect(mealIsOpen("DINNER", hourAt(iso)), iso).toBe(false)
    }
  })

  test("01:00 on Friday in Dhaka is already Friday when it is still Thursday in UTC", () => {
    vi.useFakeTimers({ toFake: ["Date"] })
    vi.setSystemTime(new Date("2026-11-05T19:00:00Z"))
    expect(getTodayDay()).toBe("Friday")
    const { result } = renderHook(() => useCart(), { wrapper: cartWrapper })
    expect(result.current.activeDay).toBe("Friday")
  })
})
