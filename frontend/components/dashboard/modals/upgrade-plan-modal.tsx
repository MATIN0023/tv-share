"use client";

import { useState } from "react";
import { ModalShell } from "./modal-shell";
import { Input } from "@/components/ui/input";
import type { Plan } from "@/lib/api/types";
import { validateCoupon } from "@/lib/api/billing";
import { toast } from "@/lib/toast";
import { useTranslation } from "@/providers/i18n-provider";

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
  const { t, locale } = useTranslation();
  const [selected, setSelected] = useState<string>("");
  const [coupon, setCoupon] = useState("");
  const [finalPrice, setFinalPrice] = useState<number | null>(null);

  const paidPlans = plans.filter((p) => p.slug !== "free" && p.is_active);
  const formatAmount = (amount: number) =>
    amount.toLocaleString(locale === "fa" ? "fa-IR" : "en-US");

  const applyCoupon = async () => {
    if (!selected || !coupon.trim()) return;
    try {
      const res = await validateCoupon(coupon.trim(), selected);
      setFinalPrice(res.final_amount);
      toast.success(
        t("modals.discountApplied", { amount: formatAmount(res.final_amount) })
      );
    } catch (e) {
      setFinalPrice(null);
      toast.error(e instanceof Error ? e.message : t("modals.invalidDiscount"));
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
      title={t("dashboard.upgradePlan")}
      description={t("modals.upgradeDesc")}
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
                {formatAmount(plan.price)} {plan.currency}
              </span>
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder={t("modals.discountCode")}
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
            {t("modals.apply")}
          </button>
        </div>

        {finalPrice !== null ? (
          <p className="text-sm text-emerald-400">
            {t("modals.finalAmount", { amount: formatAmount(finalPrice) })}
          </p>
        ) : null}

        <button
          type="button"
          disabled={isSubmitting || !selected}
          onClick={handleSubmit}
          className="w-full rounded-xl bg-primary px-3 py-2 text-sm text-white disabled:opacity-50"
        >
          {isSubmitting ? t("modals.connectingPayment") : t("modals.continuePayment")}
        </button>
      </div>
    </ModalShell>
  );
}
