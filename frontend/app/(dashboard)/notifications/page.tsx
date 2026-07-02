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
import { QueryError } from "@/components/dashboard/shared/query-error";
import { DashboardSkeleton } from "@/components/dashboard/shared/skeleton";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/hooks/use-notifications";
import { formatFaDate } from "@/lib/utils/format-date";
import { useTranslation } from "@/providers/i18n-provider";

type FilterTab = "all" | NotificationType;

function mapType(t: string): NotificationType {
  if (t === "room_invite" || t === "friend_request" || t === "system") return t;
  return "system";
}

export default function NotificationsPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<FilterTab>("all");
  const { data, isLoading, isError, error, refetch } = useNotifications();
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
      <SectionHeader title={t("dashboard.notificationsTitle")} description="GET /api/notifications" />

      {isError ? (
        <QueryError error={error} context="notifications.load" onRetry={() => refetch()} />
      ) : null}

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3 md:mb-6">
        <GlassPanel title={t("dashboard.unread")}>
          <p className="text-2xl font-bold text-primary">{unreadCount}</p>
        </GlassPanel>
        <GlassPanel title={t("dashboard.total")}>
          <p className="text-2xl font-bold">{items.length}</p>
        </GlassPanel>
        <GlassPanel title={t("dashboard.action")}>
          <button
            type="button"
            onClick={() => markAll.mutate()}
            className="mt-1 rounded-xl border border-white/20 px-3 py-2 text-sm"
          >
            {t("dashboard.markAllReadShort")}
          </button>
        </GlassPanel>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 md:mb-6">
        {(
          [
            { key: "all", label: t("common.all") },
            { key: "room_invite", label: t("dashboard.invite") },
            { key: "friend_request", label: t("dashboard.friendship") },
            { key: "system", label: t("dashboard.system") },
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

      <GlassPanel title={t("dashboard.history")}>
        {filtered.length ? (
          <NotificationsTable
            rows={filtered}
            onMarkRead={(id) => markRead.mutate(id)}
          />
        ) : (
          <EmptyState title={t("dashboard.noNotificationsShort")} />
        )}
      </GlassPanel>
    </div>
  );
}
