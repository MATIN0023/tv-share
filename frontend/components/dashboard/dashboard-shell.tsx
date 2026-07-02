"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Video,
  CreditCard,
  UserCircle2,
  DoorOpen,
  Menu,
  X,
  LogOut,
  Bell,
  Headphones,
  AlertTriangle,
} from "lucide-react";
import { AppLogo } from "@/components/brand/app-logo";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { cn } from "@/lib/utils";
import { useLogout } from "@/hooks/use-auth";
import { useMe } from "@/hooks/use-me";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { InstallPwaButton } from "@/components/pwa/install-pwa-button";
import { AssistantWidget } from "@/components/assistant/assistant-widget";
import { useTranslation } from "@/providers/i18n-provider";

interface DashboardShellProps {
  children: React.ReactNode;
}

function NavLink({
  item,
  active,
  onNavigate,
  badge,
}: {
  item: { href: string; label: string; icon: React.ComponentType<{ className?: string }> };
  active: boolean;
  onNavigate: () => void;
  badge?: string;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition",
        active
          ? "liquid-glass border-primary/30 text-primary"
          : "border-transparent hover:liquid-glass"
      )}
      onClick={onNavigate}
    >
      <Icon className="size-4 shrink-0" />
      <span className="flex-1">{item.label}</span>
      {badge ? (
        <span className="rounded-md bg-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-300">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const logout = useLogout();
  const { data: me } = useMe();
  const { data: settings } = usePublicSettings();
  const { t } = useTranslation();

  const mainNavItems = useMemo(
    () => [
      { href: "/dashboard", label: t("nav.overview"), icon: LayoutDashboard, settingsKey: null },
      { href: "/rooms", label: t("nav.rooms"), icon: DoorOpen, settingsKey: null },
      { href: "/library", label: t("nav.library"), icon: Video, settingsKey: null },
      { href: "/friends", label: t("nav.friends"), icon: Users, settingsKey: null },
      { href: "/billing", label: t("nav.billing"), icon: CreditCard, settingsKey: "payment_enabled" as const },
      { href: "/profile", label: t("nav.profile"), icon: UserCircle2, settingsKey: null },
    ],
    [t]
  );

  const serviceNavItems = useMemo(
    () => [
      { href: "/notifications", label: t("nav.notifications"), icon: Bell },
      { href: "/support", label: t("nav.support"), icon: Headphones },
    ],
    [t]
  );

  const siteName = settings?.site_name?.trim() || t("common.appName");
  const showBilling = settings?.payment_enabled !== false;
  const visibleMainNav = mainNavItems.filter((item) => {
    if (item.settingsKey === "payment_enabled") return showBilling;
    return true;
  });

  return (
    <div className="min-h-screen page-glass-bg text-foreground">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside
          className={cn(
            "fixed inset-y-0 right-0 z-50 flex w-72 flex-col border-l border-white/10 liquid-glass p-4 transition-transform md:static md:translate-x-0",
            menuOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
          )}
        >
          <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <AppLogo
                href="/dashboard"
                size={36}
                name={siteName}
                nameClassName="text-lg font-bold"
              />
              {me ? (
                <p className="text-xs text-muted-foreground">
                  @{me.display_name ?? me.phone_number}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              className="rounded-md p-2 md:hidden"
              onClick={() => setMenuOpen(false)}
              aria-label={t("nav.closeMenu")}
            >
              <X className="size-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-4 overflow-y-auto">
            <div className="space-y-2">
              <p className="px-2 text-xs text-muted-foreground">{t("nav.mainSection")}</p>
              {visibleMainNav.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  active={pathname === item.href}
                  onNavigate={() => setMenuOpen(false)}
                />
              ))}
            </div>

            <div className="space-y-2">
              <p className="px-2 text-xs text-muted-foreground">{t("nav.servicesSection")}</p>
              {serviceNavItems.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  active={pathname === item.href}
                  onNavigate={() => setMenuOpen(false)}
                />
              ))}
            </div>
          </nav>

          <div className="mt-auto space-y-3 border-t border-white/10 pt-4">
            <InstallPwaButton variant="sidebar" />
            <LocaleSwitcher variant="full" className="rounded-xl border border-white/10 px-3 py-2" />
            <div className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2">
              <span className="text-sm text-muted-foreground">{t("common.theme")}</span>
              <ThemeSwitch />
            </div>
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/20"
            >
              <LogOut className="size-4" />
              {t("common.logout")}
            </button>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col p-3 md:p-6 md:pr-8">
          <div className="mb-3 flex md:hidden">
            <button
              type="button"
              className="rounded-lg p-2 md:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label={t("nav.openMenu")}
            >
              <Menu className="size-5" />
            </button>
          </div>

          {settings?.maintenance_mode ? (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <p>{t("dashboard.maintenanceBanner")}</p>
            </div>
          ) : null}

          {settings?.announcement_text?.trim() ? (
            <div className="mb-4 rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-100">
              {settings.announcement_text}
            </div>
          ) : null}

          <main className="flex-1">{children}</main>
        </div>
      </div>
      <AssistantWidget />
    </div>
  );
}
