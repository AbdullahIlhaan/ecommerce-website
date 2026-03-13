import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import ProductsPage from "./pages/Products";
import CategoriesPage from "./pages/Categories";
import BrandsPage from "./pages/Brands";
import CustomersPage from "./pages/Customers";
import OrdersPage from "./pages/Orders";
import CouponsPage from "./pages/Coupons";
import ReviewsPage from "./pages/Reviews";
import NotFound from "./pages/NotFound";
import { seedData } from "@/lib/store";
import { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => { seedData(); }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/brands" element={<BrandsPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/coupons" element={<CouponsPage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
