"use client";

import Link from "next/link";
import { AppLogo } from "@/components/brand/app-logo";
import { useTranslation } from "@/providers/i18n-provider";

export function LandingFooter() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-white/5 bg-zinc-950 px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-8 sm:grid-cols-3">
          {/* brand */}
          <div>
            <AppLogo
              href="/"
              size={32}
              name={t("common.appName")}
              nameClassName="text-white"
            />
            <p className="mt-3 max-w-xs text-sm text-white/40">
              {t("landing.footerDesc")}
            </p>
          </div>

          {/* quick links */}
          <div>
            <p className="mb-4 text-sm font-semibold text-white/60">{t("nav.quickLinks")}</p>
            <ul className="space-y-2 text-sm text-white/40">
              {[
                { href: "/", label: t("nav.home") },
                { href: "/login", label: t("common.login") },
                { href: "/signup", label: t("common.signup") },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* contact */}
          <div>
            <p className="mb-4 text-sm font-semibold text-white/60">{t("nav.contactUs")}</p>
            <ul className="space-y-2 text-sm text-white/40">
              <li>
                <a href="mailto:info@moviesync.app" className="transition hover:text-white">
                  info@moviesync.app
                </a>
              </li>
              <li>{t("nav.location")}</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/5 pt-6 text-center text-xs text-white/20">
          {t("nav.copyright", { year: new Date().getFullYear() })}
        </div>
      </div>
    </footer>
  );
}
