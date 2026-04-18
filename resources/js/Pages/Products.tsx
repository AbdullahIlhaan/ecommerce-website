import type { ReactNode } from "react";
import ProductsPage from "@/pages/Products";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

function Products() {
  return <ProductsPage />;
}

Products.layout = (page: ReactNode) => <DashboardLayout>{page}</DashboardLayout>;

export default Products;
