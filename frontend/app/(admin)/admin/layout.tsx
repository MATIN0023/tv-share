"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { PageLoader } from "@/components/ui/app-loader";
import { useMe } from "@/hooks/use-me";
import { isAdminRole } from "@/lib/auth/roles";
import { useTranslation } from "@/providers/i18n-provider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const { data: me, isLoading, isError } = useMe();

  useEffect(() => {
    if (isLoading) return;
    if (isError || !me || !isAdminRole(me.role)) {
      router.replace("/login?redirect=/admin&error=admin_forbidden");
    }
  }, [me, isLoading, isError, router]);

  if (isLoading || !me || !isAdminRole(me.role)) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <PageLoader label={t("adminPages.checkingAccess")} />
      </div>
    );
  }

  return (
    <>
      <AdminShell>{children}</AdminShell>
    </>
  );
}
