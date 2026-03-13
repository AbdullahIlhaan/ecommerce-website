import type { ReactNode } from "react";
import CouponsPage from "@/pages/Coupons";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

function Coupons() {
  return <CouponsPage />;
}

Coupons.layout = (page: ReactNode) => <DashboardLayout>{page}</DashboardLayout>;

export default Coupons;
