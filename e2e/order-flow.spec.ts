import { expect, test } from "@playwright/test"
import { ADMIN, createBackend } from "./fakeApi"

// Wednesday 4 Nov 2026, 1:00 pm in Dhaka: same-day lunch orders are open (12:00-16:00).
const LUNCH_TIME = new Date("2026-11-04T07:00:00Z")

test("a new customer signs up, orders from the menu, and the admin sees the order", async ({ browser }) => {
  const backend = createBackend()

  // ---------- Customer ----------
  const customerCtx = await browser.newContext({ locale: "en-US", timezoneId: "Asia/Dhaka" })
  await backend.attach(customerCtx)
  const shop = await customerCtx.newPage()
  await shop.clock.setFixedTime(LUNCH_TIME)
  await shop.goto("/")

  // 1. Sign up
  await shop.getByRole("button", { name: "Sign In" }).first().click()
  await shop.getByRole("tab", { name: "Create account" }).click()
  await shop.getByLabel("Your name", { exact: true }).fill("Rahim Uddin")
  await shop.getByLabel("Mobile number", { exact: true }).fill("01711000009")
  await shop.getByLabel("Email", { exact: true }).fill("rahim@example.com")
  await shop.getByLabel("Password", { exact: true }).fill("biriyani123")
  await shop.getByRole("button", { name: "Create account", exact: true }).click()
  // Signed in: the "Sign In" button is replaced by the account button
  await expect(shop.getByRole("button", { name: "Sign In" })).toHaveCount(0)
  await expect(shop.getByRole("button", { name: /^Rahim/ }).first()).toBeVisible()

  // 2. Menu -> cart
  const add = shop.getByRole("button", { name: "Add Kacchi Biriyani to cart" }).first()
  await expect(add).toBeEnabled()
  await add.click()
  await shop.getByRole("button", { name: /^Cart, 1 items/ }).click()
  await expect(shop.getByRole("dialog", { name: /cart/i })).toBeVisible()
  await shop.getByRole("button", { name: "Proceed to Checkout" }).click()

  // 3. Checkout (name is filled in from the account)
  const checkout = shop.getByRole("dialog", { name: /checkout/i })
  await expect(checkout.getByText("1× Kacchi Biriyani")).toBeVisible()
  await checkout.getByLabel("Mobile number", { exact: true }).fill("01711000009")
  await checkout.getByLabel("Room, house or landmark", { exact: true }).fill("Room 304, Hall 2")
  await checkout.getByRole("button", { name: /Place order/ }).click()
  await expect(shop.getByRole("heading", { name: "Order placed!" })).toBeVisible()

  // The site sent the right order, with the meal it was picked from
  expect(backend.state.orderRequests).toHaveLength(1)
  expect(backend.state.orderRequests[0]).toMatchObject({
    customerName: "Rahim Uddin",
    customerPhone: "01711000009",
    customerAddress: "Room 304, Hall 2",
    paymentMethod: "COD",
    items: [{ menuItemId: 101, quantity: 1, mealTime: "LUNCH" }],
  })

  // ---------- Admin ----------
  const adminCtx = await browser.newContext({ locale: "en-US", timezoneId: "Asia/Dhaka" })
  await backend.attach(adminCtx)
  const admin = await adminCtx.newPage()
  await admin.goto("/admin")
  await admin.getByLabel("Email or phone", { exact: true }).fill(ADMIN.email)
  await admin.getByLabel("Password", { exact: true }).fill(ADMIN.password)
  await admin.getByRole("button", { name: /sign in/i }).click()

  // 4. The order is there, as New, with its customer, address and dish
  const orderNumber = String(backend.state.orders[0].order.orderNumber)
  await expect(admin.getByText("Rahim Uddin").first()).toBeVisible()
  await expect(admin.getByText(orderNumber).first()).toBeVisible()
  await expect(admin.getByText("1× Kacchi Biriyani")).toBeVisible()
  await expect(admin.getByText("Room 304, Hall 2")).toBeVisible()
  await expect(admin.getByText("New", { exact: true }).first()).toBeVisible()

  // 5. The admin confirms it
  await admin.getByRole("button", { name: "Confirm order" }).click()
  await expect(admin.getByText("Confirmed", { exact: true }).first()).toBeVisible()
  expect(backend.state.orders[0].order.status).toBe("CONFIRMED")

  await customerCtx.close()
  await adminCtx.close()
})

test("a customer cannot open the admin orders", async ({ browser }) => {
  const backend = createBackend()
  const ctx = await browser.newContext({ locale: "en-US" })
  await backend.attach(ctx)
  const page = await ctx.newPage()
  await page.goto("/admin")
  // Not signed in: only the sign-in form shows, no orders
  await expect(page.getByRole("heading", { name: "Banglar Biriyani Admin" })).toBeVisible()
  await expect(page.getByText("Search orders")).toHaveCount(0)

  // Wrong password is refused
  await page.getByLabel("Email or phone", { exact: true }).fill(ADMIN.email)
  await page.getByLabel("Password", { exact: true }).fill("wrong-password")
  await page.getByRole("button", { name: /sign in/i }).click()
  await expect(page.getByRole("alert")).toContainText("Wrong email, phone or password.")
  await ctx.close()
})
