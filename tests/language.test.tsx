import { beforeEach, describe, expect, test, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { LanguageProvider, useLang } from "../src/context/LanguageContext"
import { categoryName, dishName } from "../src/i18n/dishes"
import { AuthModal } from "../src/components/AuthModal"

vi.mock("../src/context/AuthContext", () => ({
  useAuth: () => ({
    isAuthModalOpen: true,
    authModalDefaultTab: "signup",
    closeAuthModal: vi.fn(),
    login: vi.fn(),
    signup: vi.fn(),
  }),
}))

function Price() {
  const { lang, setLang, taka, tr } = useLang()
  return (
    <div>
      <p>{taka(1250)}</p>
      <p>{tr("Cart", "কার্ট")}</p>
      <button type="button" onClick={() => setLang(lang === "en" ? "bn" : "en")}>
        switch
      </button>
    </div>
  )
}

beforeEach(() => localStorage.clear())

describe("English and Bangla", () => {
  test("English by default, Bangla digits and words after switching, and the choice is saved", () => {
    render(
      <LanguageProvider>
        <Price />
      </LanguageProvider>,
    )
    expect(screen.getByText("৳1,250")).toBeInTheDocument()
    expect(screen.getByText("Cart")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "switch" }))
    expect(screen.getByText("৳১,২৫০")).toBeInTheDocument()
    expect(screen.getByText("কার্ট")).toBeInTheDocument()
    expect(localStorage.getItem("bb_lang")).toBe("bn")
  })

  test("remembers Bangla on the next visit", () => {
    localStorage.setItem("bb_lang", "bn")
    render(
      <LanguageProvider>
        <AuthModal />
      </LanguageProvider>,
    )
    expect(screen.getByLabelText("আপনার নাম")).toBeInTheDocument()
    expect(screen.getByLabelText("মোবাইল নম্বর")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "অ্যাকাউন্ট খুলুন" })).toBeInTheDocument()
  })

  test("dish and category names have Bangla versions, unknown names stay as they are", () => {
    expect(dishName("Special Chicken Tehari", "bn")).toBe("স্পেশাল চিকেন তেহারি")
    expect(dishName("Special Chicken Tehari", "en")).toBe("Special Chicken Tehari")
    expect(dishName("A New Dish", "bn")).toBe("A New Dish")
    expect(categoryName("Signature Biriyani", "bn")).toBe("সিগনেচার বিরিয়ানি")
  })
})
