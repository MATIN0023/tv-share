"use client";

import { AdminSectionHeader } from "@/components/admin/admin-section-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { Trash2, Radio } from "lucide-react";

const liveRooms = [
  { id: "rm1", name: "Interstellar Night", host: "مهدی", viewers: 8, movie: "Interstellar" },
  { id: "rm2", name: "Marvel Marathon", host: "الهام", viewers: 12, movie: "Endgame" },
];

const videos = [
  { id: "v1", title: "فیلم قدیمی ۲۰۲۳", owner: "سینا", size: "۴.۲ GB", flagged: false },
  { id: "v2", title: "محتوای گزارش‌شده", owner: "ناشناس", size: "۱.۱ GB", flagged: true },
];

export default function AdminRoomsPage() {
  return (
    <div>
      <AdminSectionHeader
        title="اتاق‌ها و محتوا"
        description="مانیتورینگ اتاق‌های زنده و مدیریت ویدیوهای آپلودشده."
      />

      <AdminPanel title="اتاق‌های در حال پخش">
        <div className="space-y-2">
          {liveRooms.map((room) => (
            <div
              key={room.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-800 px-3 py-2 text-sm"
            >
              <div className="flex items-center gap-2">
                <Radio className="size-4 text-emerald-500" />
                <span className="font-medium">{room.name}</span>
                <span className="text-zinc-500">— {room.movie}</span>
              </div>
              <span className="text-zinc-400">
                میزبان: {room.host} | {room.viewers} بیننده
              </span>
              <button
                type="button"
                className="rounded border border-red-900/50 px-2 py-1 text-xs text-red-400"
              >
                بستن اتاق
              </button>
            </div>
          ))}
        </div>
      </AdminPanel>

      <div className="mt-4">
        <AdminPanel title="ویدیوهای آپلود شده">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-zinc-500">
                <tr>
                  <th className="px-3 py-2 text-right">عنوان</th>
                  <th className="px-3 py-2 text-right">مالک</th>
                  <th className="px-3 py-2 text-right">حجم</th>
                  <th className="px-3 py-2 text-right">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {videos.map((v) => (
                  <tr key={v.id} className="border-t border-zinc-800">
                    <td className="px-3 py-2">
                      {v.title}
                      {v.flagged ? (
                        <span className="mr-2 text-xs text-red-400">(گزارش‌شده)</span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2">{v.owner}</td>
                    <td className="px-3 py-2">{v.size}</td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-xs text-red-400"
                      >
                        <Trash2 className="size-3" />
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminPanel>
      </div>
    </div>
  );
}
