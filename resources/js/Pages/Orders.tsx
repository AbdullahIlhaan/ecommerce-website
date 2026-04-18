import type { ReactNode } from "react";
import OrdersPage from "@/pages/Orders";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

function Orders() {
  return <OrdersPage />;
}

Orders.layout = (page: ReactNode) => <DashboardLayout>{page}</DashboardLayout>;

export default Orders;
