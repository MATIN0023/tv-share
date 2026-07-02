"use client";

import { useTranslation } from "@/providers/i18n-provider";

interface ContinueWatchingCardProps {
  title: string;
  progress: number;
}

export function ContinueWatchingCard({ title, progress }: ContinueWatchingCardProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border border-white/10 p-3">
      <p className="font-medium">{title}</p>
      <div className="mt-2 h-2 rounded-full bg-white/10">
        <div className="h-2 rounded-full bg-primary" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {t("cards.percentWatched", { percent: progress })}
      </p>
    </div>
  );
}
