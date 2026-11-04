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
  test("asks for name, mobile number, email and password only", () => {
    render(<AuthModal />)
    expect(screen.getByLabelText("Your name")).toBeInTheDocument()
    expect(screen.getByLabelText("Mobile number")).toBeInTheDocument()
    expect(screen.getByLabelText("Email")).toBeInTheDocument()
    expect(screen.getByLabelText("Password")).toBeInTheDocument()
    expect(screen.queryByLabelText(/address/i)).not.toBeInTheDocument()
  })

  test("switches between sign in and create account with the tabs", () => {
    render(<AuthModal />)
    expect(screen.getByRole("tab", { name: "Create account" })).toHaveAttribute("aria-selected", "true")
    fireEvent.click(screen.getByRole("tab", { name: "Sign in" }))
    expect(screen.getByLabelText("Mobile number or email")).toBeInTheDocument()
    expect(screen.queryByLabelText("Your name")).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Create an account" }))
    expect(screen.getByLabelText("Your name")).toBeInTheDocument()
  })

  test("shows what is wrong under each field and does not submit", () => {
    render(<AuthModal />)
    fill("Mobile number", "12345")
    fill("Email", "rahim@")
    fill("Password", "short")
    fireEvent.click(screen.getByRole("button", { name: "Create account" }))
    expect(screen.getByText("Enter your name")).toBeInTheDocument()
    expect(screen.getByText("Enter an 11-digit mobile number starting with 01")).toBeInTheDocument()
    expect(screen.getByText("Enter a valid email, e.g. name@gmail.com")).toBeInTheDocument()
    expect(screen.getByText("Use at least 8 characters")).toBeInTheDocument()
    expect(signup).not.toHaveBeenCalled()
  })

  test("sends a clean 01... number and shows the server's message", async () => {
    signup.mockResolvedValue({ ok: false, error: "An account with this mobile number already exists. Please sign in instead." })
    render(<AuthModal />)
    fill("Your name", "Rahim Uddin")
    fill("Mobile number", "+880 1711-000009")
    fill("Email", " Rahim@Gmail.com ")
    fill("Password", "biriyani123")
    fireEvent.click(screen.getByRole("button", { name: "Create account" }))
    await waitFor(() =>
      expect(signup).toHaveBeenCalledWith({
        fullName: "Rahim Uddin",
        phone: "01711000009",
        email: "rahim@gmail.com",
        password: "biriyani123",
      }),
    )
    expect(await screen.findByRole("alert")).toHaveTextContent("already exists")
  })
})
