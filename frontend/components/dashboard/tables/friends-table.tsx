"use client";

import { useTranslation } from "@/providers/i18n-provider";

interface FriendRow {
  id: string;
  name: string;
  subtitle: string;
  status: string;
}

interface FriendsTableProps {
  rows: FriendRow[];
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onBlock?: (id: string) => void;
  showActions?: "friends" | "requests" | "blocked";
}

export function FriendsTable({
  rows,
  onAccept,
  onReject,
  onBlock,
  showActions = "friends",
}: FriendsTableProps) {
  const { t } = useTranslation();

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <table className="w-full text-sm">
        <thead className="bg-white/5 text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-right">{t("tables.name")}</th>
            <th className="px-3 py-2 text-right">{t("tables.userId")}</th>
            <th className="px-3 py-2 text-right">{t("common.status")}</th>
            <th className="px-3 py-2 text-right">{t("common.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-white/10">
              <td className="px-3 py-2">{row.name}</td>
              <td className="px-3 py-2 text-xs text-muted-foreground" dir="ltr">
                {row.subtitle}
              </td>
              <td className="px-3 py-2 text-primary">{row.status}</td>
              <td className="px-3 py-2">
                {showActions === "requests" ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onAccept?.(row.id)}
                      className="text-emerald-400"
                    >
                      {t("tables.accept")}
                    </button>
                    <button
                      type="button"
                      onClick={() => onReject?.(row.id)}
                      className="text-red-400"
                    >
                      {t("tables.reject")}
                    </button>
                  </div>
                ) : showActions === "blocked" ? (
                  <span className="text-muted-foreground">{t("dashboard.blockedStatus")}</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onBlock?.(row.id)}
                    className="text-red-400"
                  >
                    {t("dashboard.block")}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
