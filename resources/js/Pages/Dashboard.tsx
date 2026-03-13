import type { ReactNode } from "react";
import DashboardPage from "@/pages/Dashboard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

function Dashboard() {
  return <DashboardPage />;
}

Dashboard.layout = (page: ReactNode) => <DashboardLayout>{page}</DashboardLayout>;

export default Dashboard;
