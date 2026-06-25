"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AdminSectionHeader } from "@/components/admin/admin-section-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { PaginationBar } from "@/components/admin/pagination-bar";
import { useAdminLogs } from "@/hooks/use-admin";
import { formatFaDate } from "@/lib/utils/format-date";
import { activityActionLabel, targetTypeLabel } from "@/lib/activity-labels";

function LogsContent() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || "1");
  const logsQ = useAdminLogs({ page, limit: 30 });

  const logs = logsQ.data?.items ?? [];
  const total = logsQ.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 30));

  return (
    <div>
      <AdminSectionHeader
        title="لاگ فعالیت"
        description="ثبت اقدامات مدیران و کاربران در سیستم"
      />

      {logsQ.isError ? (
        <p className="mb-4 text-red-400">خطا در بارگذاری لاگ‌ها</p>
      ) : null}

      <AdminPanel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-sm">
            <thead className="text-zinc-500">
              <tr>
                <th className="py-2 text-right">زمان</th>
                <th className="py-2 text-right">نام / موبایل</th>
                <th className="py-2 text-right">نقش</th>
                <th className="py-2 text-right">شناسه عامل</th>
                <th className="py-2 text-right">عملیات</th>
                <th className="py-2 text-right">هدف</th>
                <th className="py-2 text-right">جزئیات</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-zinc-800">
                  <td className="py-2 text-xs text-zinc-500">
                    {formatFaDate(log.created_at)}
                  </td>
                  <td className="py-2">
                    {log.actor_name ?? log.actor_phone ?? "—"}
                  </td>
                  <td className="py-2 text-xs">
                    {log.actor_role === "admin"
                      ? "مدیر"
                      : log.actor_role === "superadmin"
                        ? "مدیر ارشد"
                        : log.actor_role === "user"
                          ? "کاربر"
                          : (log.actor_role ?? "—")}
                  </td>
                  <td className="py-2 font-mono text-xs text-zinc-500" dir="ltr">
                    {String(log.actor_id).slice(-12)}
                  </td>
                  <td className="py-2">{activityActionLabel(log.action)}</td>
                  <td className="py-2 text-xs">
                    {log.target_type ? (
                      <>
                        {targetTypeLabel(log.target_type)}
                        {log.target_id ? (
                          <span className="mr-1 font-mono text-zinc-500" dir="ltr">
                            ({log.target_id.slice(-10)})
                          </span>
                        ) : null}
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-2 text-xs text-zinc-400">{log.details || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!logs.length && !logsQ.isLoading ? (
            <p className="py-8 text-center text-zinc-500">هنوز لاگی ثبت نشده</p>
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
