"use client";

import { useTranslation } from "@/providers/i18n-provider";

export type NotificationType = "room_invite" | "friend_request" | "system";

export interface NotificationRow {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

interface NotificationsTableProps {
  rows: NotificationRow[];
  onMarkRead?: (id: string) => void;
}

export function NotificationsTable({ rows, onMarkRead }: NotificationsTableProps) {
  const { t } = useTranslation();

  const typeLabel: Record<NotificationType, string> = {
    room_invite: t("tables.roomInvite"),
    friend_request: t("tables.friendRequest"),
    system: t("tables.systemMessage"),
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <table className="w-full text-sm">
        <thead className="bg-white/5 text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-right">{t("tables.type")}</th>
            <th className="px-3 py-2 text-right">{t("tables.title")}</th>
            <th className="px-3 py-2 text-right">{t("tables.time")}</th>
            <th className="px-3 py-2 text-right">{t("common.status")}</th>
            <th className="px-3 py-2 text-right">{t("common.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={`border-t border-white/10 ${row.read ? "opacity-70" : ""}`}
            >
              <td className="px-3 py-2 text-primary">{typeLabel[row.type]}</td>
              <td className="px-3 py-2">
                <p className="font-medium">{row.title}</p>
                <p className="text-xs text-muted-foreground">{row.body}</p>
              </td>
              <td className="px-3 py-2 text-muted-foreground">{row.createdAt}</td>
              <td className="px-3 py-2">
                {row.read ? t("tables.read") : t("dashboard.new")}
              </td>
              <td className="px-3 py-2">
                {!row.read && onMarkRead ? (
                  <button
                    type="button"
                    onClick={() => onMarkRead(row.id)}
                    className="text-xs text-primary"
                  >
                    {t("tables.markRead")}
                  </button>
                ) : (
                  <span className="text-xs text-muted-foreground">{t("common.dash")}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
