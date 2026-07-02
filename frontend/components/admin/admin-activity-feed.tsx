"use client";

import Link from "next/link";
import type { AuditLog } from "@/lib/api/types";
import { activityActionLabel, targetTypeLabel } from "@/lib/activity-labels";
import { formatFaDate } from "@/lib/utils/format-date";
import { AppLoader } from "@/components/ui/app-loader";

import { useTranslation } from "@/providers/i18n-provider";

type Props = {
  items: AuditLog[];
  loading?: boolean;
};

export function AdminActivityFeed({ items, loading }: Props) {
  const { t } = useTranslation();

  if (loading) {
    return <AppLoader variant="inline" className="py-4" />;
  }

  if (items.length === 0) {
    return <p className="text-sm text-zinc-500">{t("adminPages.noUserActivity")}</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((log) => (
        <li
          key={log.id}
          className="rounded-lg border border-zinc-800 px-3 py-2 text-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-medium text-zinc-200">
              {log.actor_name || log.actor_phone || t("common.dash")}
            </span>
            <span className="text-xs text-zinc-600">{formatFaDate(log.created_at)}</span>
          </div>
          <p className="mt-0.5 text-zinc-400">
            {activityActionLabel(t, log.action)}
            {log.target_type ? (
              <>
                {" · "}
                {targetTypeLabel(t, log.target_type)}
              </>
            ) : null}
            {log.details ? (
              <span className="text-zinc-600"> — {log.details}</span>
            ) : null}
          </p>
        </li>
      ))}
      <li>
        <Link
          href="/admin/logs?role=user"
          className="text-sm text-amber-500 hover:text-amber-400"
        >
          {t("adminPages.viewAllActivity")} →
        </Link>
      </li>
    </ul>
  );
}
