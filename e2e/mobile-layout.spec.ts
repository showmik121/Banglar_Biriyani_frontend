import { devices, expect, test } from "@playwright/test"
import { createBackend } from "./fakeApi"

// Phone layout check: the page never scrolls sideways and the key buttons are reachable.
// Screenshots are saved to test-results/ so the design can be looked at.
const { defaultBrowserType: _ignored, ...phone } = devices["Pixel 7"]

test("phone layout: no sideways scroll, order button and dish cards fit", async ({ browser }) => {
  const backend = createBackend()
  const ctx = await browser.newContext({ ...phone, locale: "en-US", timezoneId: "Asia/Dhaka" })
  await backend.attach(ctx)
  const page = await ctx.newPage()
  await page.clock.setFixedTime(new Date("2026-11-04T07:00:00Z"))
  await page.goto("/")
  await expect(page.getByRole("link", { name: "Order now" }).first()).toBeVisible()
  await page.waitForTimeout(800)

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(0)

  // Order button is on the first screen
  const box = await page.getByRole("link", { name: "Order now" }).first().boundingBox()
  expect(box!.y + box!.height).toBeLessThan(page.viewportSize()!.height)

  // On a phone the menu comes first, then the daily meals
  const tops = await page.evaluate(() => ({
    menu: document.querySelector("#menu")!.getBoundingClientRect().top + window.scrollY,
    meal: document.querySelector("#meal")!.getBoundingClientRect().top + window.scrollY,
  }))
  expect(tops.menu).toBeLessThan(page.viewportSize()!.height * 0.7)
  expect(tops.menu).toBeLessThan(tops.meal)

  await page.screenshot({ path: "test-results/mobile-1-top.png" })
  await page.locator("#meal").scrollIntoViewIfNeeded()
  await page.waitForTimeout(500)
  await page.screenshot({ path: "test-results/mobile-2-menu.png" })

  await page.getByRole("button", { name: "Add Kacchi Biriyani to cart" }).first().click()
  await page.waitForTimeout(300)
  await page.screenshot({ path: "test-results/mobile-3-cartbar.png" })
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({ path: "test-results/mobile-4-full.png", fullPage: true })
  await ctx.close()
})
