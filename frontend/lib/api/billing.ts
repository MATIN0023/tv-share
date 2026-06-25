import { authApiRequest } from "./authenticated";
import type { Plan, Transaction } from "./types";

export function getSubscription() {
  return authApiRequest<{
    plan: string;
    subscription_expires_at?: string;
  }>("/api/subscription");
}

export function listTransactions() {
  return authApiRequest<{ transactions: Transaction[] }>("/api/transactions");
}

export function upgradeSubscription(planSlug: string, discountCode?: string) {
  return authApiRequest<{
    transaction: Transaction;
    payment_url: string;
    gateway_reference: string;
  }>("/api/subscription/upgrade", {
    method: "POST",
    body: { plan_slug: planSlug, discount_code: discountCode || undefined },
  });
}

export function validateCoupon(code: string, planSlug: string) {
  return authApiRequest<{
    code: string;
    final_amount: number;
    original_amount: number;
  }>("/api/coupons/validate", {
    method: "POST",
    body: { code, plan_slug: planSlug },
  });
}

export function listPlans() {
  return authApiRequest<{ plans: Plan[] }>("/api/plans");
}
