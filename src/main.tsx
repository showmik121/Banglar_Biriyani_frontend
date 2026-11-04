import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { AuthProvider } from "./context/AuthContext"
import { CartProvider } from "./context/CartContext"
import { AddressProvider } from "./context/AddressContext"
import { LanguageProvider } from "./context/LanguageContext"
import "./index.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LanguageProvider>
    <AuthProvider>
      <CartProvider>
        <AddressProvider>
          <App />
        </AddressProvider>
      </CartProvider>
    </AuthProvider>
    </LanguageProvider>
  </React.StrictMode>,
)
