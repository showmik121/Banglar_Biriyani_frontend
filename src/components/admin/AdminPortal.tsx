import { LanguageProvider } from "../../context/LanguageContext"
import { useCurrentPath } from "../../utils/navigation"
import { AdminGuard } from "../AdminGuard"
import { AdminLayout } from "./AdminLayout"
import { AdminOrders } from "./AdminOrders"
import { AdminMenu } from "./AdminMenu"
import { AdminMeals } from "./AdminMeals"
import { AdminOffers } from "./AdminOffers"
import { AdminDeliveryZones } from "./AdminDeliveryZones"
import { ADMIN_LANG_KEY } from "./adminApi"

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
      <AdminGuard>
        <AdminLayout>{view}</AdminLayout>
      </AdminGuard>
    </LanguageProvider>
  )
}
