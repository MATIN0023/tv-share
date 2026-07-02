"use client";

import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminError } from "@/components/admin/admin-error";
import { AdminSectionHeader } from "@/components/admin/admin-section-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { PaginationBar } from "@/components/admin/pagination-bar";
import { useAdminLogs } from "@/hooks/use-admin";
import { formatFaDate } from "@/lib/utils/format-date";
import { activityActionLabel, targetTypeLabel } from "@/lib/activity-labels";
import { useTranslation } from "@/providers/i18n-provider";

function LogsContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || "1");
  const role = searchParams.get("role") || "";
  const logsQ = useAdminLogs({ page, limit: 50, role: role || undefined });

  const roleTabs = useMemo(
    () =>
      [
        { key: "", label: t("adminPages.roleAll") },
        { key: "admin", label: t("adminPages.roleAdmins") },
        { key: "user", label: t("adminPages.roleUsers") },
      ] as const,
    [t]
  );

  const roleLabel = (r?: string) => {
    if (r === "admin") return t("adminPages.roleAdmin");
    if (r === "superadmin") return t("adminPages.roleSuperadmin");
    if (r === "user") return t("adminPages.roleUser");
    return r ?? t("common.dash");
  };

  const logs = logsQ.data?.items ?? [];
  const total = logsQ.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 50));

  const setRole = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set("role", next);
    else params.delete("role");
    params.set("page", "1");
    router.replace(`/admin/logs?${params.toString()}`);
  };

  return (
    <div>
      <AdminSectionHeader
        title={t("adminPages.activityLog")}
        description={t("adminPages.activityLogDesc")}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {roleTabs.map((tab) => (
          <button
            key={tab.key || "all"}
            type="button"
            onClick={() => setRole(tab.key)}
            className={`rounded-xl border px-3 py-2 text-sm ${
              role === tab.key
                ? "border-amber-500 text-amber-400"
                : "border-zinc-700 text-zinc-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {logsQ.isError ? (
        <AdminError
          error={logsQ.error}
          context="admin.logs"
          onRetry={() => logsQ.refetch()}
          className="mb-4"
        />
      ) : null}

      <AdminPanel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] table-fixed text-sm">
            <colgroup>
              <col className="w-[120px]" />
              <col className="w-[120px]" />
              <col className="w-[72px]" />
              <col className="w-[100px]" />
              <col className="w-[140px]" />
              <col className="w-[140px]" />
              <col />
            </colgroup>
            <thead className="text-zinc-500">
              <tr>
                <th className="py-2 text-right">{t("tables.time")}</th>
                <th className="py-2 text-right">{t("adminPages.namePhone")}</th>
                <th className="py-2 text-right">{t("adminPages.role")}</th>
                <th className="py-2 text-right">{t("tables.userId")}</th>
                <th className="py-2 text-right">{t("common.actions")}</th>
                <th className="py-2 text-right">{t("adminPages.target")}</th>
                <th className="py-2 text-right">{t("common.details")}</th>
              </tr>
            </thead>
          </table>
          <div className="max-h-[520px] overflow-y-auto">
            <table className="w-full min-w-[960px] table-fixed text-sm">
              <colgroup>
                <col className="w-[120px]" />
                <col className="w-[120px]" />
                <col className="w-[72px]" />
                <col className="w-[100px]" />
                <col className="w-[140px]" />
                <col className="w-[140px]" />
                <col />
              </colgroup>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-t border-zinc-800 align-top">
                    <td className="truncate py-2 text-xs text-zinc-500">
                      {formatFaDate(log.created_at)}
                    </td>
                    <td className="truncate py-2">
                      {log.actor_name ?? log.actor_phone ?? t("common.dash")}
                    </td>
                    <td className="truncate py-2 text-xs">{roleLabel(log.actor_role)}</td>
                    <td className="truncate py-2 font-mono text-xs text-zinc-500" dir="ltr">
                      {String(log.actor_id).slice(-12)}
                    </td>
                    <td className="truncate py-2">{activityActionLabel(t, log.action)}</td>
                    <td className="truncate py-2 text-xs">
                      {log.target_type ? (
                        <>
                          {targetTypeLabel(t, log.target_type)}
                          {log.target_id ? (
                            <span className="mr-1 font-mono text-zinc-500" dir="ltr">
                              ({log.target_id.slice(-8)})
                            </span>
                          ) : null}
                        </>
                      ) : (
                        t("common.dash")
                      )}
                    </td>
                    <td className="truncate py-2 text-xs text-zinc-400">
                      {log.details || t("common.dash")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!logs.length && !logsQ.isLoading ? (
            <p className="py-8 text-center text-zinc-500">{t("adminPages.noLogs")}</p>
          ) : null}
        </div>
        <PaginationBar page={page} totalPages={totalPages} total={total} />
      </AdminPanel>
    </div>
  );
}

export default function AdminLogsPage() {
  return (
    <Suspense>
      <LogsContent />
    </Suspense>
  );
}
