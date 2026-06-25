"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSubscription,
  listPlans,
  listTransactions,
  queryKeys,
  upgradeSubscription,
} from "@/lib/api";

export function useSubscription() {
  return useQuery({
    queryKey: queryKeys.billing.subscription(),
    queryFn: getSubscription,
    enabled: typeof document !== "undefined",
  });
}

export function useTransactions() {
  return useQuery({
    queryKey: queryKeys.billing.transactions(),
    queryFn: listTransactions,
    enabled: typeof document !== "undefined",
  });
}

export function usePlans() {
  return useQuery({
    queryKey: queryKeys.billing.plans(),
    queryFn: listPlans,
    enabled: typeof document !== "undefined",
  });
}

export function useUpgradeSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ planSlug, discountCode }: { planSlug: string; discountCode?: string }) =>
      upgradeSubscription(planSlug, discountCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.billing.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.me });
    },
  });
}
