import { beforeEach, describe, expect, test, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { LanguageProvider } from "../src/context/LanguageContext"
import { AdminNavMenu } from "../src/components/admin/AdminNavMenu"

const logout = vi.fn(() => Promise.resolve())

vi.mock("../src/context/AuthContext", () => ({
  useAuth: () => ({ user: { email: "admin@banglarbiriyani.com", phone: null }, logout }),
}))
vi.mock("../src/components/admin/PushAlertsCard", () => ({
  PushAlertsCard: () => <section>push settings</section>,
}))

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem("bb_admin_lang", "en")
  logout.mockClear()
})

const setup = (soundOn = true, enableSound = vi.fn()) => {
  render(
    <LanguageProvider storageKey="bb_admin_lang" defaultLang="en">
      <AdminNavMenu soundOn={soundOn} enableSound={enableSound} />
    </LanguageProvider>,
  )
  return enableSound
}

describe("admin hamburger menu", () => {
  test("is closed at first and opens with the account, language, notifications and sign out", () => {
    setup()
    expect(screen.queryByText("Sign out")).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Menu" }))
    expect(screen.getByText("admin@banglarbiriyani.com")).toBeInTheDocument()
    expect(screen.getByText("View site")).toBeInTheDocument()
    expect(screen.getByText("Language")).toBeInTheDocument()
    expect(screen.getByText("push settings")).toBeInTheDocument()
    expect(screen.getByText("Sign out")).toBeInTheDocument()
  })

  test("Escape closes it and Sign out logs out", () => {
    setup()
    fireEvent.click(screen.getByRole("button", { name: "Menu" }))
    fireEvent.keyDown(document, { key: "Escape" })
    expect(screen.queryByText("Sign out")).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Menu" }))
    fireEvent.click(screen.getByText("Sign out"))
    expect(logout).toHaveBeenCalledTimes(1)
  })

  test("offers to turn on the order sound when it is off", () => {
    const enable = setup(false)
    fireEvent.click(screen.getByRole("button", { name: "Menu" }))
    fireEvent.click(screen.getByRole("button", { name: "Turn on" }))
    expect(enable).toHaveBeenCalledTimes(1)
  })
})
