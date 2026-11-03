import { beforeEach, describe, expect, test, vi } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { AuthModal } from "../src/components/AuthModal"

const signup = vi.fn()
vi.mock("../src/context/AuthContext", () => ({
  useAuth: () => ({
    isAuthModalOpen: true,
    authModalDefaultTab: "signup",
    closeAuthModal: vi.fn(),
    login: vi.fn(),
    signup,
  }),
}))

beforeEach(() => signup.mockReset())

const fill = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } })

describe("sign up", () => {
  test("asks only for name, mobile number and password", () => {
    render(<AuthModal />)
    expect(screen.getByLabelText("Your name")).toBeInTheDocument()
    expect(screen.getByLabelText("Mobile number")).toBeInTheDocument()
    expect(screen.getByLabelText("Password")).toBeInTheDocument()
    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/address/i)).not.toBeInTheDocument()
  })

  test("shows what is wrong under each field and does not submit", () => {
    render(<AuthModal />)
    fill("Mobile number", "12345")
    fill("Password", "short")
    fireEvent.click(screen.getByRole("button", { name: "Create account" }))
    expect(screen.getByText("Enter your name")).toBeInTheDocument()
    expect(screen.getByText("Enter an 11-digit mobile number starting with 01")).toBeInTheDocument()
    expect(screen.getByText("Use at least 8 characters")).toBeInTheDocument()
    expect(signup).not.toHaveBeenCalled()
  })

  test("sends a clean 01... number and shows the server's message", async () => {
    signup.mockResolvedValue({ ok: false, error: "An account with this mobile number already exists. Please sign in instead." })
    render(<AuthModal />)
    fill("Your name", "Rahim Uddin")
    fill("Mobile number", "+880 1711-000009")
    fill("Password", "biriyani123")
    fireEvent.click(screen.getByRole("button", { name: "Create account" }))
    await waitFor(() =>
      expect(signup).toHaveBeenCalledWith({ fullName: "Rahim Uddin", phone: "01711000009", password: "biriyani123" }),
    )
    expect(await screen.findByRole("alert")).toHaveTextContent("already exists")
  })
})
