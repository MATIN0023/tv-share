"use client";

import { useTranslation } from "@/providers/i18n-provider";

interface FriendCardProps {
  name: string;
  status: "online" | "watching" | "away";
}

export function FriendCard({ name, status }: FriendCardProps) {
  const { t } = useTranslation();

  const statusLabel: Record<FriendCardProps["status"], string> = {
    online: t("cards.online"),
    watching: t("cards.watching"),
    away: t("cards.away"),
  };

  return (
    <div className="rounded-xl border border-white/10 p-3">
      <p className="font-medium">{name}</p>
      <p className="mt-1 text-xs text-muted-foreground">{statusLabel[status]}</p>
    </div>
  );
}
