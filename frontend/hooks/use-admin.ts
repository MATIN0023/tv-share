"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  assignUserSubscription,
  banAdminUser,
  closeAdminRoom,
  createAdminDiscount,
  createAdminPlan,
  createAdminUser,
  deleteAdminDiscount,
  deleteAdminUser,
  deleteAdminVideo,
  getAdminSettings,
  getAdminStats,
  listAdminDiscounts,
  listAdminLogs,
  listAdminPlans,
  listAdminReports,
  listAdminRooms,
  listAdminTransactions,
  listAdminUsers,
  listLiveRooms,
  queryKeys,
  resetAdminUserPassword,
  resolveAdminReport,
  setMaintenanceMode,
  updateAdminDiscount,
  updateAdminPlan,
  updateAdminSettings,
  updateAdminUser,
} from "@/lib/api";
import { toast, getErrorMessage } from "@/lib/toast";

function onMutateSuccess(message: string) {
  return () => toast.success(message);
}

function onMutateError(fallback: string) {
  return (err: unknown) => toast.error(getErrorMessage(err, fallback));
}

export function useAdminStats() {
  return useQuery({
    queryKey: queryKeys.admin.stats(),
    queryFn: getAdminStats,
    enabled: typeof document !== "undefined",
  });
}

export function useAdminUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const key = JSON.stringify(params ?? {});
  return useQuery({
    queryKey: queryKeys.admin.usersList(key),
    queryFn: () => listAdminUsers(params),
    enabled: typeof document !== "undefined",
  });
}

export function useAdminPlans() {
  return useQuery({
    queryKey: queryKeys.admin.plans(),
    queryFn: listAdminPlans,
    enabled: typeof document !== "undefined",
  });
}

export function useAdminTransactions(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...queryKeys.admin.transactions(), params?.page, params?.limit],
    queryFn: () => listAdminTransactions(params),
    enabled: typeof document !== "undefined",
  });
}

export function useAdminReports(params?: {
  status?: string;
  target_type?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: [
      ...queryKeys.admin.reports(params?.status),
      params?.target_type,
      params?.page,
    ],
    queryFn: () => listAdminReports(params),
    enabled: typeof document !== "undefined",
  });
}

export function useAdminRooms(params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const key = JSON.stringify(params ?? {});
  return useQuery({
    queryKey: queryKeys.admin.rooms(key),
    queryFn: () => listAdminRooms(params),
    enabled: typeof document !== "undefined",
  });
}

export function useAdminLiveRooms() {
  return useQuery({
    queryKey: queryKeys.admin.liveRooms(),
    queryFn: listLiveRooms,
    enabled: typeof document !== "undefined",
  });
}

export function useAdminSettings() {
  return useQuery({
    queryKey: queryKeys.admin.settings(),
    queryFn: getAdminSettings,
    enabled: typeof document !== "undefined",
  });
}

export function useAdminDiscounts() {
  return useQuery({
    queryKey: queryKeys.admin.discounts(),
    queryFn: async () => (await listAdminDiscounts()).discounts,
    enabled: typeof document !== "undefined",
  });
}

export function useAdminLogs(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...queryKeys.admin.logs(), params?.page],
    queryFn: () => listAdminLogs(params),
    enabled: typeof document !== "undefined",
  });
}

export function useCreateAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAdminUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.all });
      toast.success("کاربر با موفقیت ایجاد شد");
    },
    onError: onMutateError("ایجاد کاربر ناموفق بود"),
  });
}

export function useUpdateAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Parameters<typeof updateAdminUser>[1];
    }) => updateAdminUser(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.all });
      toast.success("کاربر به‌روزرسانی شد");
    },
    onError: onMutateError("به‌روزرسانی کاربر ناموفق بود"),
  });
}

export function useDeleteAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.all });
      toast.success("کاربر حذف شد");
    },
    onError: onMutateError("حذف کاربر ناموفق بود"),
  });
}

export function useBanAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, banned }: { id: string; banned: boolean }) =>
      banAdminUser(id, banned),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.all });
      toast.success(v.banned ? "کاربر مسدود شد" : "مسدودیت کاربر برداشته شد");
    },
    onError: onMutateError("تغییر وضعیت کاربر ناموفق بود"),
  });
}

export function useAssignUserSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: { plan_slug: string; expires_at?: string };
    }) => assignUserSubscription(id, body),
    onSuccess: onMutateSuccess("اشتراک کاربر تنظیم شد"),
    onError: onMutateError("تنظیم اشتراک ناموفق بود"),
  });
}

export function useResetAdminUserPassword() {
  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      resetAdminUserPassword(id, password),
    onSuccess: onMutateSuccess("رمز عبور کاربر تغییر کرد"),
    onError: onMutateError("تغییر رمز عبور ناموفق بود"),
  });
}

export function useCreateAdminPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAdminPlan,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.plans() });
      toast.success("پلن ایجاد شد");
    },
    onError: onMutateError("ایجاد پلن ناموفق بود"),
  });
}

export function useUpdateAdminPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Record<string, unknown>;
    }) => updateAdminPlan(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.plans() });
      toast.success("پلن به‌روزرسانی شد");
    },
    onError: onMutateError("به‌روزرسانی پلن ناموفق بود"),
  });
}

export function useResolveAdminReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: resolveAdminReport,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.all });
      toast.success("گزارش رسیدگی شد");
    },
    onError: onMutateError("رسیدگی به گزارش ناموفق بود"),
  });
}

export function useDeleteAdminVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminVideo,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.all });
      toast.success("ویدیو حذف شد");
    },
    onError: onMutateError("حذف ویدیو ناموفق بود"),
  });
}

export function useCloseAdminRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: closeAdminRoom,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.all });
      toast.success("اتاق بسته شد");
    },
    onError: onMutateError("بستن اتاق ناموفق بود"),
  });
}

export function useUpdateAdminSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateAdminSettings,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.settings() });
      qc.invalidateQueries({ queryKey: ["public-settings"] });
      toast.success("تنظیمات ذخیره شد");
    },
    onError: onMutateError("ذخیره تنظیمات ناموفق بود"),
  });
}

export function useSetMaintenanceMode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: setMaintenanceMode,
    onSuccess: (_d, enabled) => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.settings() });
      qc.invalidateQueries({ queryKey: ["public-settings"] });
      toast.success(
        enabled ? "حالت تعمیرات فعال شد" : "حالت تعمیرات غیرفعال شد"
      );
    },
    onError: onMutateError("تغییر حالت تعمیرات ناموفق بود"),
  });
}

export function useCreateAdminDiscount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAdminDiscount,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.discounts() });
      toast.success("کد تخفیف ایجاد شد");
    },
    onError: onMutateError("ایجاد کد تخفیف ناموفق بود"),
  });
}

export function useUpdateAdminDiscount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Record<string, unknown>;
    }) => updateAdminDiscount(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.discounts() });
      toast.success("کد تخفیف به‌روزرسانی شد");
    },
    onError: onMutateError("به‌روزرسانی کد تخفیف ناموفق بود"),
  });
}

export function useDeleteAdminDiscount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminDiscount,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.discounts() });
      toast.success("کد تخفیف حذف شد");
    },
    onError: onMutateError("حذف کد تخفیف ناموفق بود"),
  });
}
