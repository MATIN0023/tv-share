"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminSectionHeader } from "@/components/admin/admin-section-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AdminConfirmDialog } from "@/components/admin/confirm-dialog";
import { PaginationBar } from "@/components/admin/pagination-bar";
import { useAdminReports, useResolveAdminReport } from "@/hooks/use-admin";
import { formatFaDate } from "@/lib/utils/format-date";

const TARGET_LABELS: Record<string, string> = {
  user: "کاربر",
  room: "اتاق",
  video: "ویدیو",
  message: "پیام",
};

function ReportsContent() {
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
        title="گزارش‌ها و تخلفات"
        description="بررسی گزارش‌های کاربران و رسیدگی به تخلفات"
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
            {s === "" ? "همه" : s === "open" ? "باز" : "رسیدگی‌شده"}
          </button>
        ))}
        {["", "user", "room", "video", "message"].map((t) => (
          <button
            key={t || "all-type"}
            type="button"
            onClick={() => setFilter("target_type", t)}
            className={`rounded-lg border px-3 py-1.5 text-sm ${
              targetType === t ? "border-sky-500 text-sky-400" : "border-zinc-700"
            }`}
          >
            {t === "" ? "همه انواع" : TARGET_LABELS[t]}
          </button>
        ))}
      </div>

      <AdminPanel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="text-zinc-500">
              <tr>
                <th className="py-2 text-right">نوع</th>
                <th className="py-2 text-right">شناسه هدف</th>
                <th className="py-2 text-right">دلیل</th>
                <th className="py-2 text-right">وضعیت</th>
                <th className="py-2 text-right">تاریخ</th>
                <th className="py-2 text-right">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-t border-zinc-800">
                  <td className="py-2">{TARGET_LABELS[r.target_type] ?? r.target_type}</td>
                  <td className="py-2 font-mono text-xs" dir="ltr">
                    {r.target_id}
                  </td>
                  <td className="py-2 text-amber-500/90">{r.reason}</td>
                  <td className="py-2">{r.status === "open" ? "باز" : "رسیدگی‌شده"}</td>
                  <td className="py-2 text-xs text-zinc-500">{formatFaDate(r.created_at)}</td>
                  <td className="py-2">
                    {r.status !== "resolved" ? (
                      <button
                        type="button"
                        onClick={() => setResolveId(r.id)}
                        className="rounded border border-emerald-800 px-2 py-1 text-emerald-400"
                      >
                        رسیدگی
                      </button>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!reports.length ? (
            <p className="py-8 text-center text-zinc-500">
              گزارشی ثبت نشده. کاربران می‌توانند از بخش پشتیبانی گزارش ارسال کنند.
            </p>
          ) : null}
        </div>
        <PaginationBar page={page} totalPages={totalPages} total={total} />
      </AdminPanel>

      <AdminConfirmDialog
        open={!!resolveId}
        onClose={() => setResolveId(null)}
        title="رسیدگی به گزارش"
        description="این گزارش به‌عنوان رسیدگی‌شده علامت‌گذاری می‌شود."
        confirmLabel="تأیید رسیدگی"
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
