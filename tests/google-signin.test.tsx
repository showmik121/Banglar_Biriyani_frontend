import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { act, render, screen, waitFor } from "@testing-library/react"
import { GoogleSignInButton } from "../src/components/GoogleSignInButton"

let initialize: ReturnType<typeof vi.fn>
let renderButton: ReturnType<typeof vi.fn>

function setup(googleClientId: string | null) {
  initialize = vi.fn()
  renderButton = vi.fn()
  // The Google script is already "loaded", so the test never touches the network
  ;(window as unknown as { google: unknown }).google = { accounts: { id: { initialize, renderButton } } }
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify({ data: { googleClientId } }), { status: 200 })),
  )
}

beforeEach(() => localStorage.setItem("bb_lang", "en"))
afterEach(() => {
  delete (window as unknown as { google?: unknown }).google
  vi.unstubAllGlobals()
})

describe("Continue with Google", () => {
  test("shows nothing while Google sign-in is not set up on the server", async () => {
    setup(null)
    const { container } = render(<GoogleSignInButton onCredential={vi.fn()} />)
    await act(async () => {})
    expect(container).toBeEmptyDOMElement()
    expect(initialize).not.toHaveBeenCalled()
  })

  test("draws Google's button for this shop and passes the signed credential on", async () => {
    setup("123-shop.apps.googleusercontent.com")
    const onCredential = vi.fn()
    render(<GoogleSignInButton onCredential={onCredential} />)

    expect(await screen.findByTestId("google-button")).toBeInTheDocument()
    await waitFor(() => expect(renderButton).toHaveBeenCalledTimes(1))
    const config = initialize.mock.calls[0][0] as { client_id: string; callback: (r: { credential?: string }) => void }
    expect(config.client_id).toBe("123-shop.apps.googleusercontent.com")
    expect(renderButton.mock.calls[0][1]).toMatchObject({ text: "continue_with" })

    config.callback({ credential: "header.payload.signature" })
    expect(onCredential).toHaveBeenCalledWith("header.payload.signature")
    config.callback({}) // Google closed without a credential: nothing happens
    expect(onCredential).toHaveBeenCalledTimes(1)
  })

  test("stays hidden when the settings cannot be loaded", async () => {
    setup(null)
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new Error("offline"))))
    const { container } = render(<GoogleSignInButton onCredential={vi.fn()} />)
    await act(async () => {})
    expect(container).toBeEmptyDOMElement()
  })
})
