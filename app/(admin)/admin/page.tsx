"use client";

import { AdminSectionHeader } from "@/components/admin/admin-section-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { Users, Radio, DoorOpen, HardDrive, TrendingUp } from "lucide-react";

const stats = [
  { label: "کاربران کل", value: "۱,۲۴۸", icon: Users, hint: "+۱۲ امروز" },
  { label: "آنلاین فعلی", value: "۸۶", icon: Radio, hint: "لحظه‌ای" },
  { label: "اتاق‌های فعال", value: "۲۳", icon: DoorOpen, hint: "در حال پخش" },
  { label: "فضای Storage", value: "۴۸٪", icon: HardDrive, hint: "۲.۴ / ۵ TB" },
];

export default function AdminOverviewPage() {
  return (
    <div>
      <AdminSectionHeader
        title="داشبورد ادمین"
        description="آمار کلی، درآمد، مصرف سرور و وضعیت سیستم."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
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
              <p className="mt-1 text-xs text-emerald-500">{item.hint}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AdminPanel title="درآمد این ماه">
          <div className="flex items-end gap-4">
            <div>
              <p className="text-3xl font-bold text-amber-400">۴۲.۸M</p>
              <p className="text-sm text-zinc-500">تومان</p>
            </div>
            <div className="flex items-center gap-1 text-sm text-emerald-500">
              <TrendingUp className="size-4" />
              +۱۸٪ نسبت به ماه قبل
            </div>
          </div>
          <div className="mt-4 flex h-24 items-end gap-2">
            {[40, 55, 48, 72, 65, 88, 100].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-amber-500/40"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </AdminPanel>

        <AdminPanel title="مانیتورینگ منابع">
          <div className="space-y-4">
            {[
              { label: "CPU", value: 64 },
              { label: "RAM", value: 72 },
              { label: "Object Storage", value: 48 },
              { label: "Transcoding Queue", value: 15 },
            ].map((m) => (
              <div key={m.label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-zinc-400">{m.label}</span>
                  <span>{m.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-zinc-800">
                  <div
                    className="h-2 rounded-full bg-amber-500"
                    style={{ width: `${m.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </AdminPanel>
      </div>

      <div className="mt-4">
        <AdminPanel title="گزارش‌های فوری">
          <ul className="space-y-2 text-sm">
            <li className="rounded-lg border border-red-900/40 bg-red-950/30 px-3 py-2 text-red-300">
              ۲ گزارش تخلف با اولویت بالا — نیاز به بررسی
            </li>
            <li className="rounded-lg border border-zinc-800 px-3 py-2 text-zinc-400">
              ۳ پرداخت ناموفق در ۲۴ ساعت گذشته
            </li>
            <li className="rounded-lg border border-zinc-800 px-3 py-2 text-zinc-400">
              ۵ ویدیو در صف تبدیل HLS
            </li>
          </ul>
        </AdminPanel>
      </div>
    </div>
  );
}
