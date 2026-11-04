import { afterEach, describe, expect, test, vi } from "vitest"
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { AdminMeals } from "../src/components/admin/AdminMeals"

const dish = (id: number, name: string) => ({
  id,
  name,
  basePriceBdt: 300,
  imageUrl: "",
  isAvailable: true,
  categoryName: "Home-Style Meals",
})
const row = (menuItemId: number, mealTime: string) => ({
  menuItemId,
  mealTime,
  specialPriceBdt: null,
  dailyQuota: 100,
  isFeatured: false,
})
const days = ["SATURDAY", "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]

afterEach(() => vi.unstubAllGlobals())

function mockApi() {
  const calls: { url: string; init?: RequestInit }[] = []
  const schedule = Object.fromEntries(days.map((d) => [d, [row(1, "BREAKFAST"), row(2, "LUNCH")]]))
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({ url, init })
      if (init?.method === "PUT") return new Response(JSON.stringify({ data: { assignments: [] } }), { status: 200 })
      return new Response(
        JSON.stringify({
          data: {
            days: schedule,
            menuCatalog: [dish(1, "Khichuri"), dish(2, "Kacchi"), dish(3, "Rice & Fish Curry"), dish(4, "Borhani")],
            categories: [],
          },
        }),
        { status: 200 },
      )
    }),
  )
  return calls
}

describe("Admin daily meals", () => {
  test("shows breakfast, lunch and dinner and saves each dish with its meal", async () => {
    const calls = mockApi()
    render(<AdminMeals />)
    const dinner = (await screen.findByRole("heading", { name: "Dinner" })).closest("section")!
    expect(within(dinner).getByText("No dinner yet.")).toBeInTheDocument()

    // The same dish can be at lunch and at dinner
    fireEvent.change(screen.getByLabelText("Add a dish to dinner"), { target: { value: "3" } })
    fireEvent.change(screen.getByLabelText("Add a dish to dinner"), { target: { value: "2" } })
    fireEvent.click(screen.getByRole("button", { name: /^Save / }))

    await waitFor(() => expect(calls.some((c) => c.init?.method === "PUT")).toBe(true))
    const body = JSON.parse(String(calls.find((c) => c.init?.method === "PUT")!.init!.body))
    expect(body.assignments.map((a: { mealTime: string; menuItemId: number }) => `${a.mealTime}:${a.menuItemId}`)).toEqual([
      "BREAKFAST:1",
      "LUNCH:2",
      "DINNER:3",
      "DINNER:2",
    ])
    // The first dish of each meal is its special
    expect(body.assignments.map((a: { isFeatured: boolean }) => a.isFeatured)).toEqual([true, true, true, false])
  })

  test("removing a dish enables Undo", async () => {
    mockApi()
    render(<AdminMeals />)
    const lunch = (await screen.findByRole("heading", { name: "Lunch" })).closest("section")!
    fireEvent.click(within(lunch).getByRole("button", { name: /Remove Kacchi/ }))
    expect(screen.getByRole("button", { name: "Undo changes" })).toBeEnabled()
  })
})
