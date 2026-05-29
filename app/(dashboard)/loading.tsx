import { DashboardSkeleton } from "@/components/dashboard/shared/skeleton";

export default function DashboardLoading() {
  return (
    <div className="min-h-[60vh]">
      <DashboardSkeleton />
    </div>
  );
}
