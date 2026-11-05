import { describe, expect, test } from "vitest"
import { imageSrcSet } from "../src/utils/imageSizes"

const url = "https://images.unsplash.com/photo-1?crop=entropy&fm=jpg&q=80&w=800&h=600"

describe("imageSrcSet", () => {
  test("adds smaller copies with the same shape, plus the original", () => {
    const set = imageSrcSet(url, [240, 480])!
    expect(set).toContain("w=240&h=180 240w")
    expect(set).toContain("w=480&h=360 480w")
    expect(set.endsWith("w=800&h=600 800w")).toBe(true)
  })
  test("never offers a size larger than the original", () => {
    expect(imageSrcSet(url, [1200])).toBe(`${url} 800w`)
  })
  test("leaves other hosts alone", () => {
    expect(imageSrcSet("https://example.com/a.jpg?w=800&h=600", [240])).toBeUndefined()
  })
})
