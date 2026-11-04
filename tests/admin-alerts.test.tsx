import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { act, renderHook } from "@testing-library/react"
import { useOrderAlerts } from "../src/components/admin/useOrderAlerts"

const row = (id: number, status = "PENDING") => ({
  order: { id, orderNumber: `BB-${id}`, customerName: `Customer ${id}`, totalBdt: 500 + id, status },
})

let batches: unknown[][]
let calls = 0

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem("bb_admin_lang", "en")
  calls = 0
  vi.useFakeTimers()
  vi.stubGlobal(
    "fetch",
    vi.fn(() => {
      const data = batches[Math.min(calls++, batches.length - 1)]
      return Promise.resolve(new Response(JSON.stringify({ data }), { status: 200 }))
    }),
  )
})
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe("new order alerts", () => {
  test("orders already waiting when the page opens do not ring", async () => {
    batches = [[row(1)], [row(1)]]
    const { result } = renderHook(() => useOrderAlerts())
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
      await vi.advanceTimersByTimeAsync(15000)
    })
    expect(result.current.alert).toBeNull()
  })

  test("a new pending order raises an alert, and dismiss clears it", async () => {
    batches = [[row(1)], [row(2), row(1)]]
    const onNew = vi.fn()
    window.addEventListener("bb-admin:new-order", onNew)
    const { result } = renderHook(() => useOrderAlerts())
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
      await vi.advanceTimersByTimeAsync(15000)
    })
    expect(result.current.alert).toEqual({ count: 1, name: "Customer 2", total: 502 })
    expect(onNew).toHaveBeenCalledTimes(1)
    act(() => result.current.dismiss())
    expect(result.current.alert).toBeNull()
    window.removeEventListener("bb-admin:new-order", onNew)
  })

  test("orders that are already confirmed never alert", async () => {
    batches = [[row(1)], [row(1), row(2, "CONFIRMED")]]
    const { result } = renderHook(() => useOrderAlerts())
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
      await vi.advanceTimersByTimeAsync(15000)
    })
    expect(result.current.alert).toBeNull()
  })
})
