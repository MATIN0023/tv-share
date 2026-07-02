"use client";

import type { DailyCount } from "@/lib/api/types";
import { useTranslation } from "@/providers/i18n-provider";

type Props = {
  data: DailyCount[];
};

export function AdminSignupChart({ data }: Props) {
  const { t } = useTranslation();
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="flex h-32 items-end gap-2">
      {data.map((d) => {
        const pct = (d.count / max) * 100;
        const label = d.date.slice(5);
        return (
          <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-xs font-medium text-zinc-400">{d.count}</span>
            <div
              className="w-full rounded-t bg-amber-500/80 transition-all"
              style={{ height: `${Math.max(pct, d.count > 0 ? 8 : 2)}%` }}
              title={`${d.date}: ${d.count}`}
            />
            <span className="text-[10px] text-zinc-600">{label}</span>
          </div>
        );
      })}
      {data.length === 0 ? (
        <p className="text-sm text-zinc-500">{t("adminPages.noSignupData")}</p>
      ) : null}
    </div>
  );
}
