import { PageLoader } from "@/components/ui/app-loader";

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <PageLoader />
    </div>
  );
}
