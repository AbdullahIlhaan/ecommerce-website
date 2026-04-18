import type { ReactNode } from "react";
import FlashDealsPage from "@/pages/FlashDeals";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

function FlashDeals() {
  return <FlashDealsPage />;
}

FlashDeals.layout = (page: ReactNode) => <DashboardLayout>{page}</DashboardLayout>;

export default FlashDeals;
