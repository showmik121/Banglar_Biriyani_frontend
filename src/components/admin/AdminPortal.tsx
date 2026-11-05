import { LanguageProvider, useLang } from "../../context/LanguageContext"
import { useEffect } from "react"
import { useCurrentPath } from "../../utils/navigation"
import { AdminGuard } from "../AdminGuard"
import { AdminLayout } from "./AdminLayout"
import { AdminOrders } from "./AdminOrders"
import { AdminMenu } from "./AdminMenu"
import { AdminMeals } from "./AdminMeals"
import { AdminOffers } from "./AdminOffers"
import { AdminDeliveryZones } from "./AdminDeliveryZones"
import { ADMIN_LANG_KEY } from "./adminApi"

/** Keeps <html lang> in step with the admin language (Bangla font and screen readers). */
function HtmlLang() {
  const { lang } = useLang()
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])
  return null
}

export function AdminPortal() {
  const path = useCurrentPath()

  const view = path.startsWith("/admin/menu") ? (
    <AdminMenu />
  ) : path.startsWith("/admin/meals") ? (
    <AdminMeals />
  ) : path.startsWith("/admin/offers") ? (
    <AdminOffers />
  ) : path.startsWith("/admin/delivery") ? (
    <AdminDeliveryZones />
  ) : (
    // /admin and /admin/orders
    <AdminOrders />
  )

  return (
    <LanguageProvider storageKey={ADMIN_LANG_KEY} defaultLang="bn">
      <HtmlLang />
      <AdminGuard>
        <AdminLayout>{view}</AdminLayout>
      </AdminGuard>
    </LanguageProvider>
  )
}
