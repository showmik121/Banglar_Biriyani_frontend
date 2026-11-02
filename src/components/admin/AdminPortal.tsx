import { useCurrentPath } from "../../utils/navigation"
import { AdminGuard } from "../AdminGuard"
import { AdminLayout } from "./AdminLayout"
import { AdminOverview } from "./AdminOverview"
import { AdminOrders } from "./AdminOrders"
import { AdminMenuCrud } from "./AdminMenuCrud"
import { AdminUsers } from "./AdminUsers"
import { AdminOffers } from "./AdminOffers"
import { AdminDeliveryZones } from "./AdminDeliveryZones"

export function AdminPortal() {
  const currentPath = useCurrentPath()

  const renderActiveView = () => {
    if (currentPath.startsWith("/admin/orders")) {
      return <AdminOrders />
    }
    if (currentPath.startsWith("/admin/menu")) {
      return <AdminMenuCrud />
    }
    if (currentPath.startsWith("/admin/offers")) {
      return <AdminOffers />
    }
    if (currentPath.startsWith("/admin/delivery")) {
      return <AdminDeliveryZones />
    }
    if (currentPath.startsWith("/admin/users")) {
      return <AdminUsers />
    }
    return <AdminOverview />
  }

  return (
    <AdminGuard>
      <AdminLayout>{renderActiveView()}</AdminLayout>
    </AdminGuard>
  )
}
