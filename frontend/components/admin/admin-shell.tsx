"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  ShieldAlert,
  DoorOpen,
  Settings,
  Menu,
  X,
  LogOut,
  ArrowRight,
  Server,
  Tag,
  ScrollText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLogout } from "@/hooks/use-auth";
import { useAdminSettings } from "@/hooks/use-admin";

const adminNav = [
  { href: "/admin", label: "داشبورد", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "کاربران", icon: Users },
  { href: "/admin/plans", label: "پلن‌ها و فاکتورها", icon: CreditCard },
  { href: "/admin/coupons", label: "کدهای تخفیف", icon: Tag },
  { href: "/admin/reports", label: "گزارش‌ها", icon: ShieldAlert },
  { href: "/admin/rooms", label: "اتاق‌ها و محتوا", icon: DoorOpen },
  { href: "/admin/logs", label: "لاگ فعالیت", icon: ScrollText },
  { href: "/admin/settings", label: "تنظیمات سیستم", icon: Settings },
];

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const logout = useLogout();
  const settingsQ = useAdminSettings();
  const maintenance = settingsQ.data?.maintenance_mode;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="flex min-h-screen">
        <aside
          className={cn(
            "fixed inset-y-0 right-0 z-50 flex w-64 flex-col border-l border-zinc-800 bg-zinc-900/95 p-4 backdrop-blur-md transition-transform md:static md:translate-x-0",
            menuOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
          )}
        >
          <div className="mb-6 border-b border-zinc-800 pb-4">
            <p className="text-xs font-medium uppercase tracking-wider text-amber-500">
              پنل مدیریت
            </p>
            <h1 className="mt-1 text-lg font-bold">MovieSync</h1>
            <p className="text-xs text-zinc-500">مدیریت کل سیستم</p>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto">
            {adminNav.map((item) => {
              const Icon = item.icon;
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
                    active
                      ? "bg-amber-500/15 text-amber-400"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-2 border-t border-zinc-800 pt-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
            >
              <ArrowRight className="size-4" />
              بازگشت به داشبورد کاربر
            </Link>
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-400"
            >
              <LogOut className="size-4" />
              خروج
            </button>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-40 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/90 px-4 py-3 backdrop-blur md:px-8">
            <button
              type="button"
              className="rounded-lg p-2 md:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="منو"
            >
              <Menu className="size-5" />
            </button>
            <div className="flex items-center gap-2 text-sm">
              <Server
                className={`size-4 ${maintenance ? "text-amber-500" : "text-emerald-500"}`}
              />
              <span className="text-zinc-500">
                {maintenance ? "حالت تعمیرات فعال" : "سرویس در دسترس"}
              </span>
            </div>
            <button
              type="button"
              className="rounded-lg p-2 md:hidden"
              onClick={() => setMenuOpen(false)}
            >
              <X className="size-5" />
            </button>
          </header>

          <main className="flex-1 p-4 md:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
