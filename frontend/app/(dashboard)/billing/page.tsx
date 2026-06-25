"use client";

import { useState } from "react";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { SectionHeader } from "@/components/dashboard/section-header";
import { CreditCard, CalendarClock } from "lucide-react";
import { PlanCard } from "@/components/dashboard/cards/plan-card";
import { TransactionsTable } from "@/components/dashboard/tables/transactions-table";
import { UpgradePlanModal } from "@/components/dashboard/modals/upgrade-plan-modal";
import { ErrorState } from "@/components/dashboard/shared/error-state";
import { DashboardSkeleton } from "@/components/dashboard/shared/skeleton";
import {
  usePlans,
  useSubscription,
  useTransactions,
  useUpgradeSubscription,
} from "@/hooks/use-billing";
import { formatFaDate } from "@/lib/utils/format-date";

export default function BillingPage() {
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const subQ = useSubscription();
  const txQ = useTransactions();
  const plansQ = usePlans();
  const upgradeMut = useUpgradeSubscription();

  const invoices = (txQ.data?.transactions ?? []).map((t) => ({
    id: t.gateway_reference || t.id.slice(-8),
    amount: `${t.amount.toLocaleString("fa-IR")} تومان`,
    date: formatFaDate(t.created_at),
    status: t.status,
  }));

  const loading = subQ.isLoading || txQ.isLoading || plansQ.isLoading;

  if (loading) return <DashboardSkeleton />;

  return (
    <div>
      <SectionHeader
        title="اشتراک / پرداخت"
        description="مدیریت اشتراک، فاکتورها و ارتقای پلن"
      />

      {subQ.isError || txQ.isError ? (
        <ErrorState
          title="خطا در دریافت اطلاعات billing"
          onRetry={() => {
            subQ.refetch();
            txQ.refetch();
            plansQ.refetch();
          }}
        />
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassPanel title="پلن فعلی">
          <div className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <CreditCard className="size-4" />
            {subQ.data?.plan ?? "free"}
          </div>
        </GlassPanel>
        <GlassPanel title="تمدید">
          <div className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarClock className="size-4" />
            {subQ.data?.subscription_expires_at
              ? formatFaDate(subQ.data.subscription_expires_at)
              : "—"}
          </div>
        </GlassPanel>
        <GlassPanel title="تراکنش‌ها" description={`${invoices.length} مورد`} />
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
        ارتقای پلن
      </button>

      <div className="mt-4 md:mt-6">
        <GlassPanel title="سوابق پرداخت">
          {invoices.length ? (
            <TransactionsTable rows={invoices} />
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">تراکنشی نیست</p>
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
