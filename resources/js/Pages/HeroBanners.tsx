import type { ReactNode } from "react";
import HeroBannersPage from "@/pages/HeroBanners";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

function HeroBanners() {
  return <HeroBannersPage />;
}

HeroBanners.layout = (page: ReactNode) => <DashboardLayout>{page}</DashboardLayout>;

export default HeroBanners;
