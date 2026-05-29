"use client";

import { useState } from "react";
import { AdminSectionHeader } from "@/components/admin/admin-section-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { Ban, MessageSquare, XCircle } from "lucide-react";

const reports = [
  {
    id: "r1",
    room: "Anime Weekend",
    type: "چت نامناسب",
    reporter: "الهام",
    excerpt: "پیام‌های توهین‌آمیز در چت گروهی",
    date: "۱۴۰۵/۰۳/۰۷",
    priority: "high",
  },
  {
    id: "r2",
    room: "Late Night",
    type: "اسپم لینک",
    reporter: "سینا",
    excerpt: "ارسال لینک مشکوک مکرر",
    date: "۱۴۰۵/۰۳/۰۶",
    priority: "medium",
  },
];

export default function AdminReportsPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  return (
    <div>
      <AdminSectionHeader
        title="گزارش‌ها و تخلفات"
        description="بررسی شکایات، چت اتاق‌ها، تعلیق اتاق و بن کاربر."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {reports.map((report) => (
            <AdminPanel key={report.id}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{report.room}</p>
                  <p className="text-sm text-amber-500">{report.type}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    گزارش‌دهنده: {report.reporter} — {report.date}
                  </p>
                  <p className="mt-2 text-sm text-zinc-400">{report.excerpt}</p>
                </div>
                {report.priority === "high" ? (
                  <span className="rounded bg-red-950 px-2 py-0.5 text-xs text-red-400">
                    فوری
                  </span>
                ) : null}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedChat(report.id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs"
                >
                  <MessageSquare className="size-3" />
                  بررسی چت
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-lg border border-red-900/50 px-3 py-1.5 text-xs text-red-400"
                >
                  <XCircle className="size-3" />
                  بستن اتاق
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-lg border border-red-900/50 px-3 py-1.5 text-xs text-red-400"
                >
                  <Ban className="size-3" />
                  بن کاربر
                </button>
              </div>
            </AdminPanel>
          ))}
        </div>

        <AdminPanel title="پیش‌نمایش چت">
          {selectedChat ? (
            <div className="space-y-2 text-sm">
              <p className="text-zinc-500">اتاق: {reports.find((r) => r.id === selectedChat)?.room}</p>
              <div className="rounded-lg bg-zinc-950 p-3">
                <p className="text-red-300">[کاربر۱]: ...</p>
                <p className="mt-2 text-zinc-400">[سیستم]: گزارش ثبت شد</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-zinc-500">یک گزارش را انتخاب کنید تا چت نمایش داده شود.</p>
          )}
        </AdminPanel>
      </div>
    </div>
  );
}
