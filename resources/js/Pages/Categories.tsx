import type { ReactNode } from "react";
import CategoriesPage from "@/pages/Categories";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

function Categories() {
  return <CategoriesPage />;
}

Categories.layout = (page: ReactNode) => <DashboardLayout>{page}</DashboardLayout>;

export default Categories;
