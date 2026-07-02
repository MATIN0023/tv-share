"use client";

import { useState } from "react";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { SectionHeader } from "@/components/dashboard/section-header";
import { CreditCard, CalendarClock } from "lucide-react";
import { PlanCard } from "@/components/dashboard/cards/plan-card";
import { TransactionsTable } from "@/components/dashboard/tables/transactions-table";
import { UpgradePlanModal } from "@/components/dashboard/modals/upgrade-plan-modal";
import { QueryError } from "@/components/dashboard/shared/query-error";
import { DashboardSkeleton } from "@/components/dashboard/shared/skeleton";
import {
  usePlans,
  useSubscription,
  useTransactions,
  useUpgradeSubscription,
} from "@/hooks/use-billing";
import { formatFaDate } from "@/lib/utils/format-date";
import { useTranslation } from "@/providers/i18n-provider";

export default function BillingPage() {
  const { t } = useTranslation();
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const subQ = useSubscription();
  const txQ = useTransactions();
  const plansQ = usePlans();
  const upgradeMut = useUpgradeSubscription();

  const invoices = (txQ.data?.transactions ?? []).map((tx) => ({
    id: tx.gateway_reference || tx.id.slice(-8),
    amount: t("dashboard.amountToman", {
      amount: tx.amount.toLocaleString("fa-IR"),
    }),
    date: formatFaDate(tx.created_at),
    status: tx.status,
  }));

  const loading = subQ.isLoading || txQ.isLoading || plansQ.isLoading;

  if (loading) return <DashboardSkeleton />;

  return (
    <div>
      <SectionHeader
        title={t("dashboard.billingTitle")}
        description={t("dashboard.billingDesc")}
      />

      {subQ.isError || txQ.isError ? (
        <QueryError
          error={subQ.error ?? txQ.error}
          context="billing.load"
          onRetry={() => {
            subQ.refetch();
            txQ.refetch();
            plansQ.refetch();
          }}
        />
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassPanel title={t("dashboard.currentPlan")}>
          <div className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <CreditCard className="size-4" />
            {subQ.data?.plan ?? "free"}
          </div>
        </GlassPanel>
        <GlassPanel title={t("dashboard.renewal")}>
          <div className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarClock className="size-4" />
            {subQ.data?.subscription_expires_at
              ? formatFaDate(subQ.data.subscription_expires_at)
              : t("common.dash")}
          </div>
        </GlassPanel>
        <GlassPanel
          title={t("dashboard.transactions")}
          description={t("dashboard.itemCount", { count: invoices.length })}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3 md:mt-6">
        {(plansQ.data?.plans ?? []).map((plan) => (
          <PlanCard
            key={plan.id}
            name={plan.name}
            price={`${plan.price.toLocaleString("fa-IR")} ${plan.currency}`}
            features={plan.features ?? []}
            highlighted={plan.slug === subQ.data?.plan}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => setUpgradeOpen(true)}
        className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm text-white md:mt-6"
      >
        {t("dashboard.upgradePlan")}
      </button>

      <div className="mt-4 md:mt-6">
        <GlassPanel title={t("dashboard.paymentHistory")}>
          {invoices.length ? (
            <TransactionsTable rows={invoices} />
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              {t("dashboard.noTransactionsShort")}
            </p>
          )}
        </GlassPanel>
      </div>

      <UpgradePlanModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        plans={plansQ.data?.plans}
        isSubmitting={upgradeMut.isPending}
        onUpgrade={async (slug, discountCode) => {
          const res = await upgradeMut.mutateAsync({ planSlug: slug, discountCode });
          if (res.payment_url) window.open(res.payment_url, "_blank");
          setUpgradeOpen(false);
        }}
      />
    </div>
  );
}
