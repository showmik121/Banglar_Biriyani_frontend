import { describe, test, expect, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { CartProvider } from "../src/context/CartContext"
import { ProductCard, type Product } from "../src/components/ProductCard"
import { Hero } from "../src/components/Hero"

const dish: Product = {
  id: "1",
  name: "Shahi Mutton Kacchi",
  description: "Slow-cooked mutton with basmati",
  price: 450,
}

function renderCard(product: Product, onAdd = vi.fn()) {
  render(
    <CartProvider>
      <ProductCard product={product} onAdd={onAdd} />
    </CartProvider>,
  )
  return onAdd
}

describe("ProductCard", () => {
  test("shows the dish name and price", () => {
    renderCard(dish)
    const card = screen.getByRole("article")
    expect(screen.getByRole("heading", { name: dish.name })).toBeInTheDocument()
    expect(card).toHaveTextContent("৳450")
  })

  test("clicking Add to Cart calls onAdd with the dish", () => {
    const onAdd = renderCard(dish)
    fireEvent.click(screen.getByRole("button", { name: /add shahi mutton kacchi to cart/i }))
    expect(onAdd).toHaveBeenCalledWith(dish)
    expect(screen.getByText(/added/i)).toBeInTheDocument()
  })

  test("a sold-out dish cannot be added", () => {
    const onAdd = renderCard({ ...dish, remainingPortions: 0 })
    const button = screen.getByRole("button", { name: /sold out/i })
    expect(button).toBeDisabled()
    fireEvent.click(button)
    expect(onAdd).not.toHaveBeenCalled()
  })

  test("low stock shows a warning", () => {
    renderCard({ ...dish, remainingPortions: 3 })
    expect(screen.getByText(/only 3 left today/i)).toBeInTheDocument()
  })
})

describe("Hero", () => {
  test("shows the headline and links the order button to the menu", () => {
    render(
      <Hero
        images={["/a.jpg", "/b.jpg"]}
        alt="Biriyani"
        badge="This week only"
        title="Authentic Dhakaiya"
        highlight="biriyani taste"
        subtitle="7-day special menu"
        body="Hot biriyani near DIU"
        primary={{ label: "Order now", href: "#menu" }}
        secondary={{ label: "View menu", href: "#meal" }}
      />,
    )
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Authentic Dhakaiya biriyani taste")
    expect(screen.getByRole("link", { name: /order now/i })).toHaveAttribute("href", "#menu")
    // one dot per photo
    expect(screen.getAllByRole("button", { name: /photo/i })).toHaveLength(2)
  })
})
