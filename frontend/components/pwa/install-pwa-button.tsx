"use client";

import { Download, Smartphone } from "lucide-react";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/providers/i18n-provider";

type InstallPwaButtonProps = {
  className?: string;
  variant?: "sidebar" | "inline";
};

export function InstallPwaButton({
  className,
  variant = "inline",
}: InstallPwaButtonProps) {
  const { canInstall, isInstalled, install } = usePwaInstall();
  const { t } = useTranslation();

  if (isInstalled) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 text-xs text-emerald-400",
          className
        )}
      >
        <Smartphone className="size-3.5 shrink-0" />
        <span>{t("pwa.installedApp")}</span>
      </div>
    );
  }

  if (!canInstall) return null;

  return (
    <button
      type="button"
      onClick={() => void install()}
      className={cn(
        variant === "sidebar"
          ? "flex w-full items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-3 py-2 text-sm text-primary transition hover:bg-primary/20"
          : "inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2 text-sm text-primary transition hover:bg-primary/20",
        className
      )}
    >
      <Download className="size-4 shrink-0" />
      {t("pwa.installApp")}
    </button>
  );
}
