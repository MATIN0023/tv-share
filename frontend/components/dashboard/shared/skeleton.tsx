import { AppLoader } from "@/components/ui/app-loader";

/** Full-page / dashboard section loading (hamster wheel). */
export function DashboardSkeleton() {
  return <AppLoader variant="section" />;
}
