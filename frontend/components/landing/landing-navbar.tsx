"use client";

import Link from "next/link";
import { AppLogo } from "@/components/brand/app-logo";
import { motion } from "framer-motion";
import { useTranslation } from "@/providers/i18n-provider";
import { LocaleSwitcher } from "@/components/locale-switcher";

export function LandingNavbar() {
  const { t } = useTranslation();

  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-white/5 bg-zinc-950/80 px-4 py-3 backdrop-blur-xl sm:px-8"
    >
      <AppLogo
        href="/"
        size={32}
        name={t("common.appName")}
        nameClassName="text-sm sm:text-base text-white"
      />

      {/* actions */}
      <div className="flex items-center gap-3">
        <LocaleSwitcher />
        <Link
          href="/login"
          className="hidden rounded-xl border border-white/15 px-4 py-2 text-sm text-white/80 transition hover:bg-white/5 sm:block"
        >
          {t("common.login")}
        </Link>
        <Link
          href="/signup"
          className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow shadow-violet-500/30 transition hover:bg-violet-500"
        >
          {t("landing.ctaStartFree")}
        </Link>
      </div>
    </motion.nav>
  );
}
