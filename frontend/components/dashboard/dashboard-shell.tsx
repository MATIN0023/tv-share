"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { cn } from "@/lib/utils";
import { useLogout } from "@/hooks/use-auth";
import { useMe } from "@/hooks/use-me";
import { usePublicSettings } from "@/hooks/use-public-settings";

const mainNavItems: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  settingsKey: "payment_enabled" | null;
}[] = [
  { href: "/dashboard", label: "نمای کلی", icon: LayoutDashboard, settingsKey: null },
  { href: "/rooms", label: "روم‌ها / واچ پارتی", icon: DoorOpen, settingsKey: null },
  { href: "/library", label: "ویدیوها / کتابخانه من", icon: Video, settingsKey: null },
  { href: "/friends", label: "دوستان", icon: Users, settingsKey: null },
  { href: "/billing", label: "اشتراک / پرداخت", icon: CreditCard, settingsKey: "payment_enabled" },
  { href: "/profile", label: "پروفایل", icon: UserCircle2, settingsKey: null },
];

const serviceNavItems = [
  { href: "/notifications", label: "اعلانات", icon: Bell },
  { href: "/support", label: "پشتیبانی", icon: Headphones },
];

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

  const siteName = settings?.site_name?.trim() || "مــــــــــــوی سیـــــــنک";
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
              <h2 className="text-lg font-bold">{siteName}</h2>
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
              aria-label="بستن منو"
            >
              <X className="size-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-4 overflow-y-auto">
            <div className="space-y-2">
              <p className="px-2 text-xs text-muted-foreground">اصلی</p>
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
              <p className="px-2 text-xs text-muted-foreground">خدمات</p>
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
            <div className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2">
              <span className="text-sm text-muted-foreground">تم</span>
              <ThemeSwitch />
            </div>
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/20"
            >
              <LogOut className="size-4" />
              خروج
            </button>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col p-3 md:p-6 md:pr-8">
          <div className="mb-3 flex md:hidden">
            <button
              type="button"
              className="rounded-lg p-2 md:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="باز کردن منو"
            >
              <Menu className="size-5" />
            </button>
          </div>

          {settings?.maintenance_mode ? (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <p>سرویس در حالت تعمیرات است. برخی امکانات ممکن است محدود باشند.</p>
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
    </div>
  );
}
