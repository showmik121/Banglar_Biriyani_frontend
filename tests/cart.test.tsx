import { describe, test, expect } from "vitest"
import { act, renderHook } from "@testing-library/react"
import type { ReactNode } from "react"
import { CartProvider, useCart } from "../src/context/CartContext"

const wrapper = ({ children }: { children: ReactNode }) => <CartProvider>{children}</CartProvider>

const kacchi = { id: "1", name: "Shahi Mutton Kacchi", price: 450 }
const borhani = { id: "13", name: "Traditional Borhani", price: 80 }

describe("cart", () => {
  test("starts empty with no delivery fee", () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    expect(result.current.totalItems).toBe(0)
    expect(result.current.deliveryFeeBdt).toBe(0)
    expect(result.current.totalBdt).toBe(0)
  })

  test("adding items updates count and subtotal; delivery stays free", () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => {
      result.current.addItem(kacchi)
      result.current.addItem(kacchi)
      result.current.addItem(borhani)
    })
    expect(result.current.totalItems).toBe(3)
    expect(result.current.subtotalBdt).toBe(450 * 2 + 80)
    expect(result.current.deliveryFeeBdt).toBe(0)
    expect(result.current.totalBdt).toBe(980)
  })

  test("the same dish is merged into one line with a higher quantity", () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => {
      result.current.addItem(kacchi)
      result.current.addItem(kacchi)
    })
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].quantity).toBe(2)
  })

  test("decrementing the last portion removes the line", () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => result.current.addItem(borhani))
    act(() => result.current.decrementItem(13))
    expect(result.current.items).toHaveLength(0)
  })

  test("the cart survives a page reload (saved in localStorage)", () => {
    const first = renderHook(() => useCart(), { wrapper })
    act(() => first.result.current.addItem(kacchi))
    first.unmount()

    const second = renderHook(() => useCart(), { wrapper })
    expect(second.result.current.totalItems).toBe(1)
  })

  test("corrupt saved data is ignored instead of crashing", () => {
    localStorage.setItem("banglar_biriyani_cart_v1", "{not valid json")
    const { result } = renderHook(() => useCart(), { wrapper })
    expect(result.current.items).toEqual([])
  })
})
