"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { useMe } from "@/hooks/use-me";
import { isAdminRole } from "@/lib/auth/roles";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: me, isLoading, isError } = useMe();

  useEffect(() => {
    if (isLoading) return;
    if (isError || !me || !isAdminRole(me.role)) {
      router.replace("/login?redirect=/admin&error=admin_forbidden");
    }
  }, [me, isLoading, isError, router]);

  if (isLoading || !me || !isAdminRole(me.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        در حال بررسی دسترسی مدیر...
      </div>
    );
  }

  return (
    <>
      <AdminShell>{children}</AdminShell>
    </>
  );
}
