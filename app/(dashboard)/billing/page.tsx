 "use client";

import { useState } from "react";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { SectionHeader } from "@/components/dashboard/section-header";
import { CreditCard, CalendarClock, ReceiptText } from "lucide-react";
import { PlanCard } from "@/components/dashboard/cards/plan-card";
import { TransactionsTable } from "@/components/dashboard/tables/transactions-table";
import { UpgradePlanModal } from "@/components/dashboard/modals/upgrade-plan-modal";
import { ErrorState } from "@/components/dashboard/shared/error-state";

const invoices = [
  { id: "#MS-2401", amount: "۲۹۹,۰۰۰ تومان", date: "۱۴۰۵/۰۲/۲۱", status: "موفق" },
  { id: "#MS-2312", amount: "۲۹۹,۰۰۰ تومان", date: "۱۴۰۵/۰۱/۲۱", status: "موفق" },
];

export default function BillingPage() {
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  return (
    <div>
      <SectionHeader
        title="اشتراک / پرداخت"
        description="نمای پلن فعلی، تاریخ تمدید و سوابق پرداخت."
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassPanel title="پلن فعلی" description="پلن Professional ماهانه">
          <div className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <CreditCard className="size-4" />
            مبلغ: ۲۹۹,۰۰۰ تومان
          </div>
        </GlassPanel>
        <GlassPanel title="زمان تمدید" description="۶ روز تا تمدید خودکار باقی مانده">
          <div className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarClock className="size-4" />
            تاریخ: ۱۴۰۵/۰۳/۰۳
          </div>
        </GlassPanel>
        <GlassPanel title="تخفیف فعال" description="کد SPRING20 تا پایان ماه معتبر است." />
      </div>

      <div className="mt-4 md:mt-6">
        <GlassPanel title="Usage Meters" description="مصرف منابع پلن فعلی.">
          <div className="mt-3 space-y-3 text-sm">
            <div>
              <div className="mb-1 flex justify-between">
                <span>آپلود</span>
                <span>5GB / 10GB</span>
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <div className="h-2 w-1/2 rounded-full bg-primary" />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between">
                <span>اتاق ماهانه</span>
                <span>18 / 30</span>
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <div className="h-2 w-3/5 rounded-full bg-primary" />
              </div>
            </div>
          </div>
        </GlassPanel>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3 md:mt-6">
        <PlanCard name="Free" price="0 تومان" features={["720p", "2 rooms", "limited upload"]} />
        <PlanCard
          name="Pro"
          price="299,000 تومان"
          features={["1080p", "30 rooms", "10GB upload"]}
          highlighted
        />
        <PlanCard
          name="Family"
          price="499,000 تومان"
          features={["4K", "100 rooms", "40GB upload"]}
        />
      </div>

      <button
        type="button"
        onClick={() => setUpgradeOpen(true)}
        className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm text-white md:mt-6"
      >
        ارتقای پلن
      </button>

      <div className="mt-4 md:mt-6">
        <GlassPanel title="Permission State" description="وضعیت دسترسی بر اساس پلن شما.">
          <div className="mt-3 rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-sm text-amber-300">
            پلن فعلی شما اجازه استریم 4K ندارد. برای فعال‌سازی، پلن را ارتقا دهید.
          </div>
        </GlassPanel>
      </div>

      <div className="mt-4 md:mt-6">
        <GlassPanel title="سوابق پرداخت" description="آخرین فاکتورهای صادرشده برای اشتراک.">
          <div className="mt-3">
            <TransactionsTable rows={invoices} />
          </div>
        </GlassPanel>
      </div>

      <div className="mt-4 md:mt-6">
        <ErrorState
          title="نمونه وضعیت خطا"
          description="در صورت خطای دریافت تراکنش‌ها این حالت به کاربر نمایش داده می‌شود."
        />
      </div>

      <UpgradePlanModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </div>
  );
}
