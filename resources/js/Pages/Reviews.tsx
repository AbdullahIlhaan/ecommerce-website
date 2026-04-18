import type { ReactNode } from "react";
import ReviewsPage from "@/pages/Reviews";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

function Reviews() {
  return <ReviewsPage />;
}

Reviews.layout = (page: ReactNode) => <DashboardLayout>{page}</DashboardLayout>;

export default Reviews;
