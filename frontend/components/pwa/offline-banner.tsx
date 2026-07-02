"use client";

import { WifiOff } from "lucide-react";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { useTranslation } from "@/providers/i18n-provider";

export function OfflineBanner() {
  const { isOnline } = usePwaInstall();
  const { t } = useTranslation();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-[100] flex items-center justify-center gap-2 bg-amber-600 px-4 py-2 text-sm text-white shadow-lg"
    >
      <WifiOff className="size-4 shrink-0" />
      <span>{t("pwa.offlineBannerDetail")}</span>
    </div>
  );
}
