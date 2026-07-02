"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { AppLogo } from "@/components/brand/app-logo";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/providers/i18n-provider";
import { LocaleSwitcher } from "@/components/locale-switcher";

interface AuthShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showTabs?: boolean;
}

const AUTH_TABS = [
  { href: "/login", key: "password" as const },
  { href: "/login/otp", key: "otp" as const },
];

const FEATURE_KEYS = [
  { title: "landing.featureGroupWatch", desc: "landing.featureGroupWatchDesc" },
  { title: "landing.featureLiveChat", desc: "landing.featureLiveChatDesc" },
  { title: "landing.featureSharedControl", desc: "landing.featureSharedControlDesc" },
] as const;

export function AuthShell({
  children,
  title,
  subtitle,
  showTabs = true,
}: AuthShellProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

  const tabLabels = {
    password: t("auth.tabPassword"),
    otp: t("auth.tabOtp"),
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-white">
      {/* background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.7) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.7) 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[120px]" />

      {/* top bar */}
      <header className="relative z-10 flex items-center justify-between border-b border-white/5 px-4 py-3 sm:px-8">
        <AppLogo
          href="/"
          size={36}
          name={t("common.appName")}
          nameClassName="text-sm font-bold text-white sm:text-base"
        />
        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <Link
            href="/"
            className="hidden items-center gap-1 text-sm text-zinc-400 transition hover:text-white sm:inline-flex"
          >
            {t("nav.home")}
            <ArrowRight className="size-3.5 rtl:rotate-180" />
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-57px)] max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-2 lg:gap-16 lg:px-8">
        {/* showcase — desktop */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden lg:block"
        >
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
            {t("landing.heroNewBadge")}
          </p>
          <h2 className="text-4xl font-black leading-tight">
            {t("landing.heroTitle1")}{" "}
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              {t("landing.heroTitle2")}
            </span>
          </h2>
          <p className="mt-4 max-w-md text-zinc-400">{t("landing.heroSubtitle")}</p>

          <ul className="mt-10 space-y-4">
            {FEATURE_KEYS.map((item) => (
              <li key={item.title} className="flex gap-3">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-violet-600/20 text-violet-400">
                  <Check className="size-3.5" />
                </span>
                <div>
                  <p className="font-semibold text-zinc-100">{t(item.title)}</p>
                  <p className="text-sm text-zinc-500">{t(item.desc)}</p>
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-12 text-xs text-zinc-600">{t("auth.shellFooter")}</p>
        </motion.div>

        {/* form column */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="mx-auto w-full max-w-md"
        >
          <div className="mb-6 text-center lg:text-start">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
            {subtitle ? (
              <p className="mt-2 text-sm text-zinc-400">{subtitle}</p>
            ) : null}
          </div>

          {showTabs ? (
            <div className="mb-5 flex rounded-xl border border-white/10 bg-zinc-900/60 p-1">
              {AUTH_TABS.map((tab) => {
                const active = pathname === tab.href;
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={cn(
                      "flex-1 rounded-lg py-2.5 text-center text-sm font-medium transition",
                      active
                        ? "bg-violet-600 text-white shadow-lg shadow-violet-600/25"
                        : "text-zinc-400 hover:text-zinc-200"
                    )}
                  >
                    {tabLabels[tab.key]}
                  </Link>
                );
              })}
            </div>
          ) : null}

          <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
