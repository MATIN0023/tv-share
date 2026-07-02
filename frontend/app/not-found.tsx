"use client";

import Link from "next/link";
import { Tv404Card } from "@/components/errors/tv-404-card";
import { useTranslation } from "@/providers/i18n-provider";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden bg-[#1a1a1a] px-4 py-8">
      <Tv404Card />
      <div className="text-center">
        <p className="text-sm text-white/50">{t("errors.http.404.description")}</p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
        >
          {t("errors.actions.back")}
        </Link>
      </div>
    </div>
  );
}
