import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { AdminMeals } from "../src/components/admin/AdminMeals"

vi.mock("../src/context/AuthContext", () => ({ useAuth: () => ({ user: { role: "ADMIN" } }) }))

const dish = (id: number, name: string) => ({
  id,
  name,
  basePriceBdt: 300,
  imageUrl: "",
  description: "A tasty dish",
  categoryId: 1,
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

beforeEach(() => localStorage.setItem("bb_admin_lang", "en"))
afterEach(() => vi.unstubAllGlobals())

function mockApi() {
  const calls: { url: string; init?: RequestInit }[] = []
  const schedule = Object.fromEntries(days.map((d) => [d, [row(1, "LUNCH")]]))
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({ url, init })
      if (url.includes("meal-hours"))
        return new Response(
          JSON.stringify({ data: { LUNCH: { startHour: 12, endHour: 16 }, DINNER: { startHour: 18, endHour: 22 } } }),
          { status: 200 },
        )
      if (url === "/api/admin/menu" && init?.method === "POST")
        return new Response(JSON.stringify({ data: { menuItem: { id: 9 } } }), { status: 201 })
      if (init?.method === "PUT") return new Response(JSON.stringify({ data: { assignments: [] } }), { status: 200 })
      return new Response(
        JSON.stringify({
          data: {
            days: schedule,
            menuCatalog: [dish(1, "Khichuri"), dish(2, "Kacchi"), dish(3, "Rice & Fish Curry"), dish(4, "Borhani")],
            categories: [{ id: 1, name: "Home-Style Meals" }],
          },
        }),
        { status: 200 },
      )
    }),
  )
  return calls
}

describe("Admin daily meals", () => {
  test("shows lunch and dinner and saves each dish with its meal", async () => {
    const calls = mockApi()
    render(<AdminMeals />)
    const dinner = (await screen.findByRole("heading", { name: "Dinner" })).closest("section")!
    expect(within(dinner).getByText("No dinner yet.")).toBeInTheDocument()

    // The same dish can be at lunch and at dinner
    fireEvent.change(screen.getByLabelText("Add a dish to dinner"), { target: { value: "3" } })
    fireEvent.change(screen.getByLabelText("Add a dish to dinner"), { target: { value: "2" } })
    fireEvent.click(screen.getByRole("button", { name: /^Save \w+day$/ }))

    await waitFor(() => expect(calls.some((c) => c.init?.method === "PUT")).toBe(true))
    const body = JSON.parse(String(calls.find((c) => c.init?.method === "PUT")!.init!.body))
    expect(body.assignments.map((a: { mealTime: string; menuItemId: number }) => `${a.mealTime}:${a.menuItemId}`)).toEqual([
      "LUNCH:1",
      "DINNER:3",
      "DINNER:2",
    ])
    // The first dish of each meal is its special
    expect(body.assignments.map((a: { isFeatured: boolean }) => a.isFeatured)).toEqual([true, true, false])
  })

  test("removing a dish enables Undo", async () => {
    mockApi()
    render(<AdminMeals />)
    const lunch = (await screen.findByRole("heading", { name: "Lunch" })).closest("section")!
    fireEvent.click(within(lunch).getByRole("button", { name: /Remove Khichuri/ }))
    expect(screen.getByRole("button", { name: "Undo changes" })).toBeEnabled()
  })

  test("the owner can create a new dish for a meal and it joins that meal", async () => {
    const calls = mockApi()
    render(<AdminMeals />)
    const dinner = (await screen.findByRole("heading", { name: "Dinner" })).closest("section")!
    fireEvent.click(within(dinner).getByRole("button", { name: /Create a new dinner dish/ }))
    fireEvent.change(await screen.findByLabelText("Photo link"), { target: { value: "https://x.test/a.jpg" } })
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Beef Tehari" } })
    fireEvent.change(screen.getByLabelText("Price (৳)"), { target: { value: "250" } })
    fireEvent.change(screen.getByLabelText("Description"), { target: { value: "Spicy tehari" } })
    fireEvent.submit(screen.getByLabelText("Name").closest("form")!)

    await waitFor(() => expect(calls.some((c) => c.url === "/api/admin/menu" && c.init?.method === "POST")).toBe(true))
    const body = JSON.parse(String(calls.find((c) => c.init?.method === "POST")!.init!.body))
    expect(body).toMatchObject({ name: "Beef Tehari", basePriceBdt: 250, imageUrl: "https://x.test/a.jpg", categoryId: 1, isEveryday: false })
    expect(await screen.findByText(/created and added to dinner/)).toBeInTheDocument()
    // not published until Save is pressed
    expect(screen.getByRole("button", { name: /^Save \w+day$/ })).toBeEnabled()
  })

  test("the owner can change lunch and dinner hours", async () => {
    const calls = mockApi()
    render(<AdminMeals />)
    fireEvent.change(await screen.findByLabelText("Lunch ends"), { target: { value: "15" } })
    fireEvent.click(screen.getByRole("button", { name: "Save hours" }))
    await waitFor(() => expect(calls.some((c) => c.url.includes("meal-hours") && c.init?.method === "PUT")).toBe(true))
    const body = JSON.parse(String(calls.find((c) => c.init?.method === "PUT" && c.url.includes("meal-hours"))!.init!.body))
    expect(body).toEqual({ LUNCH: { startHour: 12, endHour: 15 }, DINNER: { startHour: 18, endHour: 22 } })
  })

  test("refuses an end time that is not after the start", async () => {
    mockApi()
    render(<AdminMeals />)
    fireEvent.change(await screen.findByLabelText("Dinner ends"), { target: { value: "18" } })
    expect(screen.getByRole("alert")).toHaveTextContent("end time must be after")
    expect(screen.getByRole("button", { name: "Save hours" })).toBeDisabled()
  })
})
