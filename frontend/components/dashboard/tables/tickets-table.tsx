"use client";

import { useTranslation } from "@/providers/i18n-provider";

export type TicketStatus = "open" | "pending" | "resolved" | "closed";

export interface TicketRow {
  id: string;
  subject: string;
  category: string;
  status: TicketStatus;
  updatedAt: string;
  lastMessage: string;
}

interface TicketsTableProps {
  rows: TicketRow[];
  onOpen?: (id: string) => void;
}

export function TicketsTable({ rows, onOpen }: TicketsTableProps) {
  const { t } = useTranslation();

  const statusLabel: Record<TicketStatus, string> = {
    open: t("dashboard.open"),
    pending: t("tables.pendingReply"),
    resolved: t("tables.resolved"),
    closed: t("dashboard.closed"),
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <table className="w-full text-sm">
        <thead className="bg-white/5 text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-right">{t("tables.code")}</th>
            <th className="px-3 py-2 text-right">{t("tables.subject")}</th>
            <th className="px-3 py-2 text-right">{t("tables.category")}</th>
            <th className="px-3 py-2 text-right">{t("common.status")}</th>
            <th className="px-3 py-2 text-right">{t("tables.lastUpdate")}</th>
            <th className="px-3 py-2 text-right">{t("common.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-white/10">
              <td className="px-3 py-2" dir="ltr">
                {row.id}
              </td>
              <td className="px-3 py-2">
                <p className="font-medium">{row.subject}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {row.lastMessage}
                </p>
              </td>
              <td className="px-3 py-2">{row.category}</td>
              <td className="px-3 py-2 text-primary">{statusLabel[row.status]}</td>
              <td className="px-3 py-2 text-muted-foreground">{row.updatedAt}</td>
              <td className="px-3 py-2">
                <button
                  type="button"
                  onClick={() => onOpen?.(row.id)}
                  className="text-xs text-primary"
                >
                  {t("tables.view")}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
