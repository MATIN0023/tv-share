"use client";

import Link from "next/link";
import { AdminActivityFeed } from "@/components/admin/admin-activity-feed";
import { AdminError } from "@/components/admin/admin-error";
import { AdminFunnelPanel } from "@/components/admin/admin-funnel-panel";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AdminSectionHeader } from "@/components/admin/admin-section-header";
import { AdminSignupChart } from "@/components/admin/admin-signup-chart";
import {
  useAdminLogs,
  useAdminReports,
  useAdminStats,
  useAdminTransactions,
} from "@/hooks/use-admin";
import { formatFaNumber } from "@/lib/utils/format-date";
import {
  Users,
  DoorOpen,
  HardDrive,
  TrendingUp,
  UserPlus,
  LogIn,
  Ban,
  CreditCard,
  Heart,
  LifeBuoy,
  ShieldAlert,
  Video,
} from "lucide-react";
import { useTranslation } from "@/providers/i18n-provider";

function formatRevenue(amount: number) {
  return amount.toLocaleString("fa-IR");
}

export default function AdminOverviewPage() {
  const { t } = useTranslation();
  const statsQ = useAdminStats();
  const txQ = useAdminTransactions({ page: 1, limit: 5 });
  const reportsQ = useAdminReports({ status: "open", page: 1, limit: 5 });
  const activityQ = useAdminLogs({ page: 1, limit: 8, role: "user" });

  const s = statsQ.data;
  const funnel = s?.funnel ?? {
    total_users: 0,
    users_with_room: 0,
    users_with_video: 0,
    users_with_friend: 0,
    paid_users: 0,
  };

  const primaryCards = [
    { label: t("adminPages.totalUsers"), value: s?.total_users ?? 0, icon: Users },
    { label: t("adminPages.activeUsers"), value: s?.active_users ?? 0, icon: Users },
    { label: t("adminPages.liveRooms"), value: s?.live_rooms ?? 0, icon: DoorOpen },
    { label: t("adminPages.videos"), value: s?.total_videos ?? 0, icon: HardDrive },
  ];

  const growthCards = [
    { label: t("adminPages.newUsersToday"), value: s?.new_users_today ?? 0, icon: UserPlus },
    { label: t("adminPages.newUsers7d"), value: s?.new_users_7d ?? 0, icon: UserPlus },
    { label: t("adminPages.activeUsers7d"), value: s?.active_users_7d ?? 0, icon: LogIn },
    { label: t("adminPages.loginsToday"), value: s?.logins_today ?? 0, icon: LogIn },
  ];

  const crmCards = [
    { label: t("adminPages.totalRevenue"), value: formatRevenue(s?.total_revenue ?? 0), icon: CreditCard, raw: true },
    { label: t("adminPages.revenue30d"), value: formatRevenue(s?.revenue_30d ?? 0), icon: TrendingUp, raw: true },
    { label: t("adminPages.premiumUsers"), value: s?.premium_users ?? 0, icon: CreditCard },
    { label: t("adminPages.bannedUsers"), value: s?.banned_users ?? 0, icon: Ban },
  ];

  const engagementCards = [
    { label: t("adminPages.roomsCreated7d"), value: s?.rooms_created_7d ?? 0, icon: DoorOpen },
    { label: t("adminPages.videosUploaded7d"), value: s?.videos_uploaded_7d ?? 0, icon: Video },
    { label: t("adminPages.pendingFriendRequests"), value: s?.pending_friend_requests ?? 0, icon: Heart },
    { label: t("adminPages.googleAuthUsers"), value: s?.google_auth_users ?? 0, icon: Users },
  ];

  const supportCards = [
    { label: t("adminPages.openReports"), value: s?.open_reports ?? 0, icon: ShieldAlert, href: "/admin/reports" },
    { label: t("adminPages.openTicketsLabel"), value: s?.open_tickets ?? 0, icon: LifeBuoy, href: "/admin/tickets" },
    { label: t("adminPages.completedPayments"), value: s?.completed_payments ?? 0, icon: CreditCard },
    { label: t("adminPages.failedPayments"), value: s?.failed_payments ?? 0, icon: CreditCard },
  ];

  return (
    <div>
      <AdminSectionHeader
        title={t("adminPages.adminDashboard")}
        description={t("adminPages.platformOverviewCrm")}
      />

      {statsQ.isError ? (
        <AdminError error={statsQ.error} context="admin.stats" onRetry={() => statsQ.refetch()} />
      ) : null}

      <section className="mb-6">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-zinc-500">
          {t("adminPages.sectionPlatform")}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {primaryCards.map((item) => {
            const Icon = item.icon;
            return (
              <StatCard key={item.label} label={item.label} icon={Icon}>
                {formatFaNumber(item.value as number)}
              </StatCard>
            );
          })}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-zinc-500">
          {t("adminPages.sectionGrowth")}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {growthCards.map((item) => {
            const Icon = item.icon;
            return (
              <StatCard key={item.label} label={item.label} icon={Icon}>
                {formatFaNumber(item.value as number)}
              </StatCard>
            );
          })}
        </div>
      </section>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AdminPanel title={t("adminPages.signupTrend7d")}>
          <AdminSignupChart data={s?.signup_trend ?? []} />
          <p className="mt-3 text-xs text-zinc-600">
            {t("adminPages.newUsers30d")}: {formatFaNumber(s?.new_users_30d ?? 0)} ·{" "}
            {t("adminPages.activeUsers30d")}: {formatFaNumber(s?.active_users_30d ?? 0)}
          </p>
        </AdminPanel>

        <AdminPanel title={t("adminPages.userFunnel")}>
          <AdminFunnelPanel funnel={funnel} />
        </AdminPanel>
      </div>

      <section className="mb-6">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-zinc-500">
          {t("adminPages.sectionRevenue")}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {crmCards.map((item) => {
            const Icon = item.icon;
            return (
              <StatCard key={item.label} label={item.label} icon={Icon}>
                {item.raw ? item.value : formatFaNumber(item.value as number)}
              </StatCard>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-zinc-600">
          {t("adminPages.planBreakdown")}: {t("adminPages.freeUsers")}{" "}
          {formatFaNumber(s?.free_users ?? 0)} · {t("adminPages.premiumUsers")}{" "}
          {formatFaNumber(s?.premium_users ?? 0)}
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-zinc-500">
          {t("adminPages.sectionEngagement")}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {engagementCards.map((item) => {
            const Icon = item.icon;
            return (
              <StatCard key={item.label} label={item.label} icon={Icon}>
                {formatFaNumber(item.value as number)}
              </StatCard>
            );
          })}
        </div>
      </section>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {supportCards.map((item) => {
          const Icon = item.icon;
          const inner = (
            <StatCard label={item.label} icon={Icon}>
              {formatFaNumber(item.value as number)}
            </StatCard>
          );
          return item.href ? (
            <Link key={item.label} href={item.href} className="block transition hover:opacity-90">
              {inner}
            </Link>
          ) : (
            <div key={item.label}>{inner}</div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AdminPanel title={t("adminPages.recentUserActivity")}>
          <AdminActivityFeed
            items={activityQ.data?.items ?? []}
            loading={activityQ.isLoading}
          />
        </AdminPanel>

        <AdminPanel title={t("adminPages.invoicesPayments")}>
          <div className="flex items-end gap-4">
            <div>
              <p className="text-3xl font-bold text-amber-400">
                {formatFaNumber(s?.total_transactions ?? 0)}
              </p>
              <p className="text-sm text-zinc-500">{t("adminPages.totalTransactions")}</p>
            </div>
            <div className="flex items-center gap-1 text-sm text-emerald-500">
              <TrendingUp className="size-4" />
              {t("adminPages.premium")} {formatFaNumber(s?.premium_users ?? 0)}
            </div>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {(txQ.data?.items ?? []).map((tx) => (
              <li key={tx.id} className="rounded-lg border border-zinc-800 px-3 py-2 text-zinc-400">
                {tx.amount.toLocaleString("fa-IR")} — {tx.status}
                {tx.plan_slug ? ` · ${tx.plan_slug}` : ""}
              </li>
            ))}
          </ul>
          <Link href="/admin/plans" className="mt-3 inline-block text-sm text-amber-500 hover:text-amber-400">
            {t("adminPages.viewAllInvoices")} →
          </Link>
        </AdminPanel>
      </div>

      <AdminPanel title={t("adminPages.openReports")} className="mt-4">
        <ul className="space-y-2 text-sm">
          {(reportsQ.data?.items ?? []).map((r) => (
            <li key={r.id} className="rounded-lg border border-zinc-800 px-3 py-2 text-zinc-400">
              {r.reason} — {r.target_type}
            </li>
          ))}
          {(reportsQ.data?.items ?? []).length === 0 ? (
            <li className="text-zinc-500">{t("adminPages.noReports")}</li>
          ) : null}
        </ul>
        <Link href="/admin/reports" className="mt-3 inline-block text-sm text-amber-500 hover:text-amber-400">
          {t("adminPages.viewAllReports")} →
        </Link>
      </AdminPanel>
    </div>
  );
}

function StatCard({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">{label}</p>
        <Icon className="size-5 text-amber-500" />
      </div>
      <p className="mt-2 text-2xl font-bold">{children}</p>
    </div>
  );
}
