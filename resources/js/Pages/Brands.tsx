import type { ReactNode } from "react";
import BrandsPage from "@/pages/Brands";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

function Brands() {
  return <BrandsPage />;
}

Brands.layout = (page: ReactNode) => <DashboardLayout>{page}</DashboardLayout>;

export default Brands;
