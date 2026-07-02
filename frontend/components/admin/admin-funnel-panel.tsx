"use client";

import type { AdminFunnel } from "@/lib/api/types";
import { formatFaNumber } from "@/lib/utils/format-date";
import { useTranslation } from "@/providers/i18n-provider";

type Props = {
  funnel: AdminFunnel;
};

export function AdminFunnelPanel({ funnel }: Props) {
  const { t } = useTranslation();
  const total = Math.max(1, funnel.total_users);

  const steps = [
    { key: "signup", label: t("adminPages.funnelSignup"), value: funnel.total_users },
    { key: "room", label: t("adminPages.funnelRoom"), value: funnel.users_with_room },
    { key: "video", label: t("adminPages.funnelVideo"), value: funnel.users_with_video },
    { key: "friend", label: t("adminPages.funnelFriend"), value: funnel.users_with_friend },
    { key: "paid", label: t("adminPages.funnelPaid"), value: funnel.paid_users },
  ];

  return (
    <div className="space-y-3">
      {steps.map((step) => {
        const pct = Math.round((step.value / total) * 100);
        return (
          <div key={step.key}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-zinc-400">{step.label}</span>
              <span className="text-zinc-300">
                {formatFaNumber(step.value)}{" "}
                <span className="text-zinc-600">({formatFaNumber(pct)}%)</span>
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
