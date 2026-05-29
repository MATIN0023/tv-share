"use client";

import { useMemo, useState } from "react";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { SectionHeader } from "@/components/dashboard/section-header";
import {
  NotificationsTable,
  type NotificationRow,
  type NotificationType,
} from "@/components/dashboard/tables/notifications-table";
import { EmptyState } from "@/components/dashboard/shared/empty-state";
import { Bell, CheckCheck, Filter } from "lucide-react";

const initialNotifications: NotificationRow[] = [
  {
    id: "n1",
    type: "room_invite",
    title: "دعوت به اتاق Interstellar Night",
    body: "مهدی شما را به واچ‌پارتی دعوت کرد.",
    createdAt: "۱۴۰۵/۰۳/۰۷ — ۱۸:۴۵",
    read: false,
  },
  {
    id: "n2",
    type: "friend_request",
    title: "درخواست دوستی جدید",
    body: "الهام رضایی درخواست دوستی ارسال کرد.",
    createdAt: "۱۴۰۵/۰۳/۰۷ — ۱۶:۲۰",
    read: false,
  },
  {
    id: "n3",
    type: "system",
    title: "تمدید اشتراک",
    body: "اشتراک Pro شما تا ۶ روز دیگر تمدید می‌شود.",
    createdAt: "۱۴۰۵/۰۳/۰۶ — ۱۰:۰۰",
    read: true,
  },
  {
    id: "n4",
    type: "room_invite",
    title: "اتاق Marvel Marathon شروع شد",
    body: "سینا اتاق زمان‌بندی‌شده را باز کرد.",
    createdAt: "۱۴۰۵/۰۳/۰۵ — ۲۲:۱۰",
    read: true,
  },
  {
    id: "n5",
    type: "system",
    title: "به‌روزرسانی سیاست حریم خصوصی",
    body: "نسخه جدید قوانین از فردا اعمال می‌شود.",
    createdAt: "۱۴۰۵/۰۳/۰۴ — ۰۹:۳۰",
    read: true,
  },
];

type FilterTab = "all" | NotificationType;

export default function NotificationsPage() {
  const [items, setItems] = useState(initialNotifications);
  const [tab, setTab] = useState<FilterTab>("all");

  const unreadCount = items.filter((n) => !n.read).length;

  const filtered = useMemo(() => {
    if (tab === "all") return items;
    return items.filter((n) => n.type === tab);
  }, [items, tab]);

  const markRead = (id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div>
      <SectionHeader
        title="اعلانات"
        description="تاریخچه تمام نوتیفیکیشن‌ها: دعوت به اتاق، درخواست دوستی و پیام‌های سیستم."
      />

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3 md:mb-6">
        <GlassPanel title="خوانده‌نشده" description="">
          <p className="text-2xl font-bold text-primary">{unreadCount}</p>
        </GlassPanel>
        <GlassPanel title="کل اعلانات" description="">
          <p className="text-2xl font-bold">{items.length}</p>
        </GlassPanel>
        <GlassPanel title="اقدام سریع" description="">
          <button
            type="button"
            onClick={markAllRead}
            className="mt-1 inline-flex items-center gap-2 rounded-xl border border-white/20 px-3 py-2 text-sm"
          >
            <CheckCheck className="size-4" />
            همه را خوانده کن
          </button>
        </GlassPanel>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2 md:mb-6">
        <Filter className="size-4 text-muted-foreground" />
        {(
          [
            { key: "all", label: "همه" },
            { key: "room_invite", label: "دعوت اتاق" },
            { key: "friend_request", label: "دوستی" },
            { key: "system", label: "سیستم" },
          ] as const
        ).map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={`rounded-xl border px-3 py-2 text-sm ${
              tab === item.key ? "border-primary text-primary" : "border-white/20"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <GlassPanel
        title="تاریخچه اعلانات"
        description="لیست کامل رویدادها با امکان فیلتر و علامت‌گذاری خوانده‌شده."
      >
        <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Bell className="size-4" />
          {filtered.length} مورد نمایش داده می‌شود
        </div>
        {filtered.length ? (
          <NotificationsTable rows={filtered} onMarkRead={markRead} />
        ) : (
          <EmptyState title="اعلانی نیست" description="در این فیلتر اعلانی ثبت نشده است." />
        )}
      </GlassPanel>
    </div>
  );
}
