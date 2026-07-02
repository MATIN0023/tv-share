"use client";

import Link from "next/link";
import { TvOfflineCard } from "@/components/errors/tv-offline-card";
import { useTranslation } from "@/providers/i18n-provider";

export default function OfflinePage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden bg-[#1a1a1a] px-4 py-8 text-center text-white">
      <TvOfflineCard screenText={t("pwa.tvNetworkScreen")} />
      <div>
        <h1 className="text-xl font-bold">{t("pwa.offlineTitle")}</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-white/60">{t("pwa.offlinePageDesc")}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 me-3 inline-block rounded-xl border border-white/15 px-5 py-2.5 text-sm font-medium text-white/90 transition hover:bg-white/5"
        >
          {t("common.retry")}
        </button>
        <Link
          href="/dashboard"
          className="mt-4 inline-block rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
        >
          {t("pwa.backToDashboard")}
        </Link>
      </div>
    </div>
  );
}
