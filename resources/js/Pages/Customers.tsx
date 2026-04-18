import type { ReactNode } from "react";
import CustomersPage from "@/pages/Customers";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

function Customers() {
  return <CustomersPage />;
}

Customers.layout = (page: ReactNode) => <DashboardLayout>{page}</DashboardLayout>;

export default Customers;
