import { describe, test, expect, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { CartProvider } from "../src/context/CartContext"
import { ProductCard, type Product } from "../src/components/ProductCard"
import { dhakaClock, hourLabel, mealHoursLabel, mealIsOpen, mealTimeNow, setMealHours } from "../src/i18n/mealTimes"

const dish: Product = { id: "1", name: "Chicken Roast", description: "Roast", price: 200 }

describe("meal hours", () => {
  test("lunch is open 12 to 4 pm and dinner 6 to 10 pm", () => {
    expect(mealIsOpen("LUNCH", 11.9)).toBe(false)
    expect(mealIsOpen("LUNCH", 12)).toBe(true)
    expect(mealIsOpen("LUNCH", 16)).toBe(false)
    expect(mealIsOpen("DINNER", 17.9)).toBe(false)
    expect(mealIsOpen("DINNER", 18)).toBe(true)
    expect(mealIsOpen("DINNER", 22)).toBe(false)
  })

  test("reads the day and hour in Bangladesh, not the visitor's time zone", () => {
    expect(dhakaClock(new Date("2026-11-02T06:00:00Z"))).toEqual({ day: "MONDAY", hour: 12 })
    expect(dhakaClock(new Date("2026-11-02T20:30:00Z"))).toEqual({ day: "TUESDAY", hour: 2.5 })
  })

  test("writes the hours in English and Bangla", () => {
    expect(mealHoursLabel("LUNCH", "en")).toBe("12:00 pm to 4:00 pm")
    expect(mealHoursLabel("LUNCH", "bn")).toBe("দুপুর ১২টা থেকে বিকাল ৪টা")
    expect(mealHoursLabel("DINNER", "bn")).toBe("সন্ধ্যা ৬টা থেকে রাত ১০টা")
  })

  test("a dish cannot be added while its meal is closed", () => {
    const onAdd = vi.fn()
    render(
      <CartProvider>
        <ProductCard product={dish} onAdd={onAdd} orderClosed />
      </CartProvider>,
    )
    const button = screen.getByRole("button")
    expect(button).toBeDisabled()
    fireEvent.click(button)
    expect(onAdd).not.toHaveBeenCalled()
  })

  test("hours set by the owner are used, and bad data is ignored", () => {
    try {
      setMealHours({ LUNCH: { startHour: 11, endHour: 15 }, DINNER: { startHour: 19, endHour: 23 } })
      expect(mealIsOpen("LUNCH", 11)).toBe(true)
      expect(mealIsOpen("DINNER", 22.5)).toBe(true)
      expect(mealHoursLabel("DINNER", "en")).toBe("7:00 pm to 11:00 pm")
      setMealHours({ LUNCH: { startHour: 9, endHour: 3 } })
      expect(mealIsOpen("LUNCH", 11)).toBe(true)
    } finally {
      setMealHours({ LUNCH: { startHour: 12, endHour: 16 }, DINNER: { startHour: 18, endHour: 22 } })
    }
    expect(mealIsOpen("LUNCH", 11)).toBe(false)
    expect(mealTimeNow).toBeTypeOf("function")
    expect(hourLabel(24, "en")).toBe("12:00 am")
  })
})
