"use client";

import { AdminSectionHeader } from "@/components/admin/admin-section-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { Users, DoorOpen, HardDrive, TrendingUp } from "lucide-react";
import { useAdminReports, useAdminStats, useAdminTransactions } from "@/hooks/use-admin";
import { formatFaNumber } from "@/lib/utils/format-date";

export default function AdminOverviewPage() {
  const statsQ = useAdminStats();
  const txQ = useAdminTransactions({ page: 1, limit: 5 });
  const reportsQ = useAdminReports({ status: "open", page: 1, limit: 5 });

  const s = statsQ.data;

  const statCards = [
    { label: "کاربران کل", value: formatFaNumber(s?.total_users ?? 0), icon: Users },
    { label: "کاربران فعال", value: formatFaNumber(s?.active_users ?? 0), icon: Users },
    { label: "اتاق‌های زنده", value: formatFaNumber(s?.live_rooms ?? 0), icon: DoorOpen },
    { label: "ویدیوها", value: formatFaNumber(s?.total_videos ?? 0), icon: HardDrive },
  ];

  return (
    <div>
      <AdminSectionHeader
        title="داشبورد مدیریت"
        description="نمای کلی از وضعیت پلتفرم"
      />

      {statsQ.isError ? (
        <p className="mb-4 text-red-400">خطا در بارگذاری آمار</p>
      ) : null}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-500">{item.label}</p>
                <Icon className="size-5 text-amber-500" />
              </div>
              <p className="mt-2 text-2xl font-bold">{item.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AdminPanel title="فاکتورها و پرداخت">
          <div className="flex items-end gap-4">
            <div>
              <p className="text-3xl font-bold text-amber-400">
                {formatFaNumber(s?.total_transactions ?? 0)}
              </p>
              <p className="text-sm text-zinc-500">کل تراکنش‌ها</p>
            </div>
            <div className="flex items-center gap-1 text-sm text-emerald-500">
              <TrendingUp className="size-4" />
              پریمیوم: {formatFaNumber(s?.premium_users ?? 0)}
            </div>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {(txQ.data?.items ?? []).map((t) => (
              <li key={t.id} className="rounded-lg border border-zinc-800 px-3 py-2 text-zinc-400">
                {t.amount.toLocaleString("fa-IR")} — {t.status}
              </li>
            ))}
          </ul>
        </AdminPanel>

        <AdminPanel title="گزارش‌های باز">
          <p className="text-2xl font-bold text-red-400">
            {formatFaNumber(s?.open_reports ?? 0)}
          </p>
          <p className="text-sm text-zinc-500">
            تیکت باز: {formatFaNumber(s?.open_tickets ?? 0)}
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {(reportsQ.data?.items ?? []).map((r) => (
              <li key={r.id} className="rounded-lg border border-zinc-800 px-3 py-2 text-zinc-400">
                {r.reason} — {r.target_type}
              </li>
            ))}
          </ul>
        </AdminPanel>
      </div>
    </div>
  );
}
