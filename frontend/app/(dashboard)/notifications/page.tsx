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
import { ErrorState } from "@/components/dashboard/shared/error-state";
import { DashboardSkeleton } from "@/components/dashboard/shared/skeleton";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/hooks/use-notifications";
import { formatFaDate } from "@/lib/utils/format-date";

type FilterTab = "all" | NotificationType;

function mapType(t: string): NotificationType {
  if (t === "room_invite" || t === "friend_request" || t === "system") return t;
  return "system";
}

export default function NotificationsPage() {
  const [tab, setTab] = useState<FilterTab>("all");
  const { data, isLoading, isError, refetch } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const items: NotificationRow[] = useMemo(
    () =>
      (data?.notifications ?? []).map((n) => ({
        id: n.id,
        type: mapType(n.type),
        title: n.title,
        body: n.body,
        createdAt: formatFaDate(n.created_at),
        read: n.is_read,
      })),
    [data]
  );

  const unreadCount = items.filter((n) => !n.read).length;

  const filtered = useMemo(() => {
    if (tab === "all") return items;
    return items.filter((n) => n.type === tab);
  }, [items, tab]);

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div>
      <SectionHeader title="اعلانات" description="GET /api/notifications" />

      {isError ? (
        <ErrorState title="خطا در دریافت اعلانات" onRetry={() => refetch()} />
      ) : null}

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3 md:mb-6">
        <GlassPanel title="خوانده‌نشده">
          <p className="text-2xl font-bold text-primary">{unreadCount}</p>
        </GlassPanel>
        <GlassPanel title="کل">
          <p className="text-2xl font-bold">{items.length}</p>
        </GlassPanel>
        <GlassPanel title="اقدام">
          <button
            type="button"
            onClick={() => markAll.mutate()}
            className="mt-1 rounded-xl border border-white/20 px-3 py-2 text-sm"
          >
            همه خوانده
          </button>
        </GlassPanel>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 md:mb-6">
        {(
          [
            { key: "all", label: "همه" },
            { key: "room_invite", label: "دعوت" },
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

      <GlassPanel title="تاریخچه">
        {filtered.length ? (
          <NotificationsTable
            rows={filtered}
            onMarkRead={(id) => markRead.mutate(id)}
          />
        ) : (
          <EmptyState title="اعلانی نیست" />
        )}
      </GlassPanel>
    </div>
  );
}
