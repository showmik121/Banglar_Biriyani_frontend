import { afterEach, describe, expect, test, vi } from "vitest"
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { AdminMeals } from "../src/components/admin/AdminMeals"

const dish = (id: number, name: string) => ({
  id,
  name,
  basePriceBdt: 300,
  imageUrl: "",
  isAvailable: true,
  categoryName: "Signature Biriyani",
})
const row = (menuItemId: number, dayOfWeek: string) => ({
  menuItemId,
  dayOfWeek,
  specialPriceBdt: null,
  dailyQuota: 100,
  isFeatured: false,
})
const days = ["SATURDAY", "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]

afterEach(() => vi.unstubAllGlobals())

function mockApi() {
  const calls: { url: string; init?: RequestInit }[] = []
  const schedule = Object.fromEntries(days.map((d) => [d, [row(1, d), row(2, d)]]))
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({ url, init })
      if (init?.method === "PUT") return new Response(JSON.stringify({ data: { assignments: [] } }), { status: 200 })
      return new Response(
        JSON.stringify({
          data: { days: schedule, menuCatalog: [dish(1, "Kacchi"), dish(2, "Tehari"), dish(3, "Thali"), dish(4, "Borhani")], categories: [] },
        }),
        { status: 200 },
      )
    }),
  )
  return calls
}

describe("Admin daily meals", () => {
  test("adds a third meal and saves the day with the first meal as the special", async () => {
    const calls = mockApi()
    render(<AdminMeals />)
    const select = await screen.findByLabelText("Add meal 3 of 3")
    fireEvent.change(select, { target: { value: "3" } })

    // A day holds 3 meals, so the picker goes away
    expect(screen.queryByLabelText(/Add meal/)).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: /^Save / }))

    await waitFor(() => expect(calls.some((c) => c.init?.method === "PUT")).toBe(true))
    const put = calls.find((c) => c.init?.method === "PUT")!
    const body = JSON.parse(String(put.init!.body))
    expect(body.assignments.map((a: { menuItemId: number }) => a.menuItemId)).toEqual([1, 2, 3])
    expect(body.assignments.map((a: { isFeatured: boolean }) => a.isFeatured)).toEqual([true, false, false])
  })

  test("removing a meal enables Undo", async () => {
    mockApi()
    render(<AdminMeals />)
    const list = (await screen.findByRole("heading", { level: 2 })).closest("section")!
    fireEvent.click(within(list).getByRole("button", { name: /Remove Tehari/ }))
    expect(screen.getByRole("button", { name: "Undo changes" })).toBeEnabled()
  })
})
