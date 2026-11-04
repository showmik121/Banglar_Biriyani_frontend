import { useCurrentPath } from "../../utils/navigation"
import { AdminGuard } from "../AdminGuard"
import { AdminLayout } from "./AdminLayout"
import { AdminOrders } from "./AdminOrders"
import { AdminMenu } from "./AdminMenu"
import { AdminMeals } from "./AdminMeals"
import { AdminOffers } from "./AdminOffers"
import { AdminDeliveryZones } from "./AdminDeliveryZones"

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
    <AdminGuard>
      <AdminLayout>{view}</AdminLayout>
    </AdminGuard>
  )
}
