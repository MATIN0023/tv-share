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
  listAdminTickets,
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
  adminReplyTicket,
  adminUpdateTicketStatus,
  getAdminTicket,
  exportAdminRoomChat,
  deleteAdminRoom,
} from "@/lib/api";
import { toast, showAppError } from "@/lib/toast";
import type { ErrorContextKey } from "@/lib/errors";
import { useTranslation } from "@/providers/i18n-provider";

function onMutateSuccess(message: string) {
  return () => toast.success(message);
}

function onMutateError(context: ErrorContextKey) {
  return (err: unknown) => showAppError(err, context);
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

export function useAdminLogs(params?: { page?: number; limit?: number; role?: string }) {
  return useQuery({
    queryKey: [...queryKeys.admin.logs(), params?.page, params?.role],
    queryFn: () => listAdminLogs(params),
    enabled: typeof document !== "undefined",
  });
}

export function useAdminTickets(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  return useQuery({
    queryKey: [...queryKeys.admin.all, "tickets", params?.page, params?.status],
    queryFn: () => listAdminTickets(params),
    enabled: typeof document !== "undefined",
  });
}

export function useAdminTicket(id: string | null) {
  return useQuery({
    queryKey: [...queryKeys.admin.all, "ticket", id],
    queryFn: () => getAdminTicket(id!),
    enabled: Boolean(id) && typeof document !== "undefined",
  });
}

export function useAdminReplyTicket() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) =>
      adminReplyTicket(id, body),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: [...queryKeys.admin.all, "ticket", v.id] });
      qc.invalidateQueries({ queryKey: [...queryKeys.admin.all, "tickets"] });
      toast.success(t("adminToast.replySent"));
    },
    onError: onMutateError("admin.tickets.reply"),
  });
}

export function useAdminUpdateTicketStatus() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminUpdateTicketStatus(id, status),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: [...queryKeys.admin.all, "ticket", v.id] });
      qc.invalidateQueries({ queryKey: [...queryKeys.admin.all, "tickets"] });
      toast.success(t("adminToast.ticketStatusUpdated"));
    },
    onError: onMutateError("admin.tickets.status"),
  });
}

export function useExportAdminRoomChat() {
  return useMutation({
    mutationFn: ({
      id,
      format,
      zip,
    }: {
      id: string;
      format: "txt" | "csv";
      zip?: boolean;
    }) => exportAdminRoomChat(id, format, zip),
  });
}

export function useDeleteAdminRoom() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminRoom,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.all });
      toast.success(t("adminToast.roomDeleted"));
    },
    onError: onMutateError("admin.rooms.delete"),
  });
}

export function useCreateAdminUser() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAdminUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.all });
      toast.success(t("adminToast.userCreated"));
    },
    onError: onMutateError("admin.users.create"),
  });
}

export function useUpdateAdminUser() {
  const { t } = useTranslation();
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
      toast.success(t("adminToast.userUpdated"));
    },
    onError: onMutateError("admin.users.update"),
  });
}

export function useDeleteAdminUser() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.all });
      toast.success(t("adminToast.userDeleted"));
    },
    onError: onMutateError("admin.users.delete"),
  });
}

export function useBanAdminUser() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, banned }: { id: string; banned: boolean }) =>
      banAdminUser(id, banned),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.all });
      toast.success(v.banned ? t("adminToast.userBanned") : t("adminToast.userUnbanned"));
    },
    onError: onMutateError("admin.users.ban"),
  });
}

export function useAssignUserSubscription() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: { plan_slug: string; expires_at?: string };
    }) => assignUserSubscription(id, body),
    onSuccess: onMutateSuccess(t("adminToast.subscriptionSet")),
    onError: onMutateError("admin.users.subscription"),
  });
}

export function useResetAdminUserPassword() {
  const { t } = useTranslation();
  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      resetAdminUserPassword(id, password),
    onSuccess: onMutateSuccess(t("adminToast.passwordChanged")),
    onError: onMutateError("admin.users.password"),
  });
}

export function useCreateAdminPlan() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAdminPlan,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.plans() });
      toast.success(t("adminToast.planCreated"));
    },
    onError: onMutateError("admin.plans.create"),
  });
}

export function useUpdateAdminPlan() {
  const { t } = useTranslation();
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
      toast.success(t("adminToast.planUpdated"));
    },
    onError: onMutateError("admin.plans.update"),
  });
}

export function useResolveAdminReport() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: resolveAdminReport,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.all });
      toast.success(t("adminToast.reportResolved"));
    },
    onError: onMutateError("admin.reports.resolve"),
  });
}

export function useDeleteAdminVideo() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminVideo,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.all });
      toast.success(t("adminToast.videoDeleted"));
    },
    onError: onMutateError("admin.videos.delete"),
  });
}

export function useCloseAdminRoom() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: closeAdminRoom,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.all });
      toast.success(t("adminToast.roomClosed"));
    },
    onError: onMutateError("admin.rooms.close"),
  });
}

export function useUpdateAdminSettings() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateAdminSettings,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.settings() });
      qc.invalidateQueries({ queryKey: ["public-settings"] });
      toast.success(t("adminToast.settingsSaved"));
    },
    onError: onMutateError("admin.settings"),
  });
}

export function useSetMaintenanceMode() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: setMaintenanceMode,
    onSuccess: (_d, enabled) => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.settings() });
      qc.invalidateQueries({ queryKey: ["public-settings"] });
      toast.success(
        enabled ? t("adminToast.maintenanceEnabled") : t("adminToast.maintenanceDisabled")
      );
    },
    onError: onMutateError("admin.maintenance"),
  });
}

export function useCreateAdminDiscount() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAdminDiscount,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.discounts() });
      toast.success(t("adminToast.discountCreated"));
    },
    onError: onMutateError("admin.coupons.create"),
  });
}

export function useUpdateAdminDiscount() {
  const { t } = useTranslation();
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
      toast.success(t("adminToast.discountUpdated"));
    },
    onError: onMutateError("admin.coupons.update"),
  });
}

export function useDeleteAdminDiscount() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminDiscount,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.discounts() });
      toast.success(t("adminToast.discountDeleted"));
    },
    onError: onMutateError("admin.coupons.delete"),
  });
}
