"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminSectionHeader } from "@/components/admin/admin-section-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AdminConfirmDialog } from "@/components/admin/confirm-dialog";
import { PaginationBar } from "@/components/admin/pagination-bar";
import { useAdminReports, useResolveAdminReport } from "@/hooks/use-admin";
import { formatFaDate } from "@/lib/utils/format-date";
import { targetTypeLabel } from "@/lib/activity-labels";
import { useTranslation } from "@/providers/i18n-provider";

function ReportsContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || "1");
  const status = searchParams.get("status") || "";
  const targetType = searchParams.get("target_type") || "";

  const reportsQ = useAdminReports({ page, limit: 15, status, target_type: targetType });
  const resolveMut = useResolveAdminReport();
  const [resolveId, setResolveId] = useState<string | null>(null);

  const reports = reportsQ.data?.items ?? [];
  const total = reportsQ.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 15));

  const statusLabel = (s: string) =>
    s === "open" ? t("dashboard.open") : t("adminPages.resolved");

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set("page", "1");
    router.push(`/admin/reports?${params.toString()}`);
  };

  return (
    <div>
      <AdminSectionHeader
        title={t("adminPages.reportsTitle")}
        description={t("adminPages.reportsDesc")}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {["", "open", "resolved"].map((s) => (
          <button
            key={s || "all"}
            type="button"
            onClick={() => setFilter("status", s)}
            className={`rounded-lg border px-3 py-1.5 text-sm ${
              status === s ? "border-amber-500 text-amber-500" : "border-zinc-700"
            }`}
          >
            {s === "" ? t("common.all") : statusLabel(s)}
          </button>
        ))}
        {["", "user", "room", "video", "message"].map((type) => (
          <button
            key={type || "all-type"}
            type="button"
            onClick={() => setFilter("target_type", type)}
            className={`rounded-lg border px-3 py-1.5 text-sm ${
              targetType === type ? "border-sky-500 text-sky-400" : "border-zinc-700"
            }`}
          >
            {type === "" ? t("adminPages.allTypes") : targetTypeLabel(t, type)}
          </button>
        ))}
      </div>

      <AdminPanel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="text-zinc-500">
              <tr>
                <th className="py-2 text-right">{t("tables.type")}</th>
                <th className="py-2 text-right">{t("adminPages.targetId")}</th>
                <th className="py-2 text-right">{t("adminPages.reason")}</th>
                <th className="py-2 text-right">{t("common.status")}</th>
                <th className="py-2 text-right">{t("common.date")}</th>
                <th className="py-2 text-right">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-t border-zinc-800">
                  <td className="py-2">{targetTypeLabel(t, r.target_type)}</td>
                  <td className="py-2 font-mono text-xs" dir="ltr">
                    {r.target_id}
                  </td>
                  <td className="py-2 text-amber-500/90">{r.reason}</td>
                  <td className="py-2">{statusLabel(r.status)}</td>
                  <td className="py-2 text-xs text-zinc-500">{formatFaDate(r.created_at)}</td>
                  <td className="py-2">
                    {r.status !== "resolved" ? (
                      <button
                        type="button"
                        onClick={() => setResolveId(r.id)}
                        className="rounded border border-emerald-800 px-2 py-1 text-emerald-400"
                      >
                        {t("adminPages.resolve")}
                      </button>
                    ) : (
                      t("common.dash")
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!reports.length ? (
            <p className="py-8 text-center text-zinc-500">{t("adminPages.noReports")}</p>
          ) : null}
        </div>
        <PaginationBar page={page} totalPages={totalPages} total={total} />
      </AdminPanel>

      <AdminConfirmDialog
        open={!!resolveId}
        onClose={() => setResolveId(null)}
        title={t("adminPages.resolveReport")}
        description={t("adminPages.resolveReportDesc")}
        confirmLabel={t("adminPages.confirmResolve")}
        onConfirm={async () => {
          if (resolveId) await resolveMut.mutateAsync(resolveId);
        }}
      />
    </div>
  );
}

export default function AdminReportsPage() {
  return (
    <Suspense>
      <ReportsContent />
    </Suspense>
  );
}
