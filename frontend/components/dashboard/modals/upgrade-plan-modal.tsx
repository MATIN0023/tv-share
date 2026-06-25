"use client";

import { useState } from "react";
import { ModalShell } from "./modal-shell";
import { Input } from "@/components/ui/input";
import type { Plan } from "@/lib/api/types";
import { validateCoupon } from "@/lib/api/billing";
import { toast } from "@/lib/toast";

interface UpgradePlanModalProps {
  open: boolean;
  onClose: () => void;
  plans?: Plan[];
  isSubmitting?: boolean;
  onUpgrade?: (planSlug: string, discountCode?: string) => void | Promise<void>;
}

export function UpgradePlanModal({
  open,
  onClose,
  plans = [],
  isSubmitting = false,
  onUpgrade,
}: UpgradePlanModalProps) {
  const [selected, setSelected] = useState<string>("");
  const [coupon, setCoupon] = useState("");
  const [finalPrice, setFinalPrice] = useState<number | null>(null);

  const paidPlans = plans.filter((p) => p.slug !== "free" && p.is_active);

  const applyCoupon = async () => {
    if (!selected || !coupon.trim()) return;
    try {
      const res = await validateCoupon(coupon.trim(), selected);
      setFinalPrice(res.final_amount);
      toast.success(`کد اعمال شد — مبلغ نهایی: ${res.final_amount.toLocaleString("fa-IR")} تومان`);
    } catch (e) {
      setFinalPrice(null);
      toast.error(e instanceof Error ? e.message : "کد تخفیف نامعتبر است");
    }
  };

  const handleSubmit = async () => {
    if (!selected) return;
    await onUpgrade?.(selected, coupon.trim() || undefined);
    setCoupon("");
    setFinalPrice(null);
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="ارتقای پلن"
      description="پلن را انتخاب کنید و در صورت داشتن، کد تخفیف وارد کنید."
    >
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          {paidPlans.map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => {
                setSelected(plan.slug);
                setFinalPrice(null);
              }}
              className={`rounded-xl border px-2 py-2 ${
                selected === plan.slug
                  ? "border-primary text-primary"
                  : "border-white/20"
              }`}
            >
              {plan.name}
              <span className="mt-1 block text-xs text-muted-foreground">
                {plan.price.toLocaleString("fa-IR")} {plan.currency}
              </span>
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="کد تخفیف"
            dir="ltr"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
          />
          <button
            type="button"
            disabled={!selected || !coupon.trim()}
            onClick={applyCoupon}
            className="shrink-0 rounded-xl border border-white/20 px-3 text-sm"
          >
            اعمال
          </button>
        </div>

        {finalPrice !== null ? (
          <p className="text-sm text-emerald-400">
            مبلغ نهایی: {finalPrice.toLocaleString("fa-IR")} تومان
          </p>
        ) : null}

        <button
          type="button"
          disabled={isSubmitting || !selected}
          onClick={handleSubmit}
          className="w-full rounded-xl bg-primary px-3 py-2 text-sm text-white disabled:opacity-50"
        >
          {isSubmitting ? "در حال اتصال..." : "ادامه پرداخت"}
        </button>
      </div>
    </ModalShell>
  );
}
