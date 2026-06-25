import { authApiRequest } from "./authenticated";
import type {
  AdminRoom,
  AdminStats,
  AuditLog,
  DiscountCode,
  PaginatedResult,
  Plan,
  Report,
  SystemSettings,
  Transaction,
  UserProfile,
} from "./types";

function qs(params: Record<string, string | number | undefined>) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export function getAdminStats() {
  return authApiRequest<AdminStats>("/api/admin/stats");
}

export function listAdminUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  return authApiRequest<PaginatedResult<UserProfile> & { users?: UserProfile[] }>(
    `/api/admin/users${qs({
      page: params?.page,
      limit: params?.limit,
      search: params?.search,
    })}`
  ).then((data) => ({
    items: data.items ?? data.users ?? [],
    total: data.total ?? 0,
    page: data.page ?? params?.page ?? 1,
    limit: data.limit ?? params?.limit ?? 20,
  }));
}

export function createAdminUser(body: {
  phone_number: string;
  password: string;
  display_name?: string;
  role?: string;
  subscription_plan?: string;
}) {
  return authApiRequest<UserProfile>("/api/admin/users", {
    method: "POST",
    body,
  });
}

export function updateAdminUser(
  id: string,
  body: Partial<{
    display_name: string;
    phone_number: string;
    role: string;
    subscription_plan: string;
    is_active: boolean;
  }>
) {
  return authApiRequest<UserProfile>(`/api/admin/users/${id}`, {
    method: "PUT",
    body,
  });
}

export function deleteAdminUser(id: string) {
  return authApiRequest<{ message: string }>(`/api/admin/users/${id}`, {
    method: "DELETE",
  });
}

export function banAdminUser(id: string, banned: boolean) {
  return authApiRequest<UserProfile>(`/api/admin/users/${id}/ban`, {
    method: "PUT",
    body: { banned },
  });
}

export function assignUserSubscription(
  id: string,
  body: { plan_slug: string; expires_at?: string }
) {
  return authApiRequest<UserProfile>(`/api/admin/users/${id}/subscription`, {
    method: "PUT",
    body,
  });
}

export function resetAdminUserPassword(id: string, newPassword: string) {
  return authApiRequest<{ message: string }>(`/api/admin/users/${id}/password`, {
    method: "PUT",
    body: { new_password: newPassword },
  });
}

export function listAdminPlans() {
  return authApiRequest<{ plans: Plan[] }>("/api/admin/plans");
}

export function createAdminPlan(body: Record<string, unknown>) {
  return authApiRequest<Plan>("/api/admin/plans", { method: "POST", body });
}

export function updateAdminPlan(id: string, body: Record<string, unknown>) {
  return authApiRequest<Plan>(`/api/admin/plans/${id}`, {
    method: "PUT",
    body,
  });
}

export function listAdminTransactions(params?: { page?: number; limit?: number }) {
  return authApiRequest<PaginatedResult<Transaction>>(
    `/api/admin/transactions${qs({ page: params?.page, limit: params?.limit })}`
  );
}

export function listAdminReports(params?: {
  status?: string;
  target_type?: string;
  page?: number;
  limit?: number;
}) {
  return authApiRequest<PaginatedResult<Report>>(
    `/api/admin/reports${qs({
      status: params?.status,
      target_type: params?.target_type,
      page: params?.page,
      limit: params?.limit,
    })}`
  );
}

export function resolveAdminReport(id: string) {
  return authApiRequest<{ message: string }>(
    `/api/admin/reports/${id}/resolve`,
    { method: "PUT" }
  );
}

export function listAdminRooms(params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return authApiRequest<PaginatedResult<AdminRoom>>(
    `/api/admin/rooms${qs({
      status: params?.status,
      search: params?.search,
      page: params?.page,
      limit: params?.limit,
    })}`
  );
}

export function listLiveRooms() {
  return authApiRequest<{ rooms: AdminRoom[] }>("/api/admin/rooms/live");
}

export function closeAdminRoom(id: string) {
  return authApiRequest<{ message: string }>(`/api/admin/rooms/${id}/close`, {
    method: "PUT",
  });
}

export function deleteAdminVideo(id: string) {
  return authApiRequest<{ message: string }>(`/api/admin/videos/${id}`, {
    method: "DELETE",
  });
}

export function getAdminSettings() {
  return authApiRequest<SystemSettings>("/api/admin/settings");
}

export function updateAdminSettings(body: Partial<SystemSettings>) {
  return authApiRequest<SystemSettings>("/api/admin/settings", {
    method: "PUT",
    body,
  });
}

export function setMaintenanceMode(enabled: boolean) {
  return authApiRequest<SystemSettings>("/api/admin/settings/maintenance", {
    method: "PUT",
    body: { enabled },
  });
}

export function listAdminDiscounts() {
  return authApiRequest<{ discounts: DiscountCode[] }>("/api/admin/discounts");
}

export function createAdminDiscount(body: Record<string, unknown>) {
  return authApiRequest<DiscountCode>("/api/admin/discounts", {
    method: "POST",
    body,
  });
}

export function updateAdminDiscount(id: string, body: Record<string, unknown>) {
  return authApiRequest<DiscountCode>(`/api/admin/discounts/${id}`, {
    method: "PUT",
    body,
  });
}

export function deleteAdminDiscount(id: string) {
  return authApiRequest<{ message: string }>(`/api/admin/discounts/${id}`, {
    method: "DELETE",
  });
}

export function listAdminLogs(params?: { page?: number; limit?: number }) {
  return authApiRequest<PaginatedResult<AuditLog>>(
    `/api/admin/logs${qs({ page: params?.page, limit: params?.limit })}`
  );
}

export function createReport(body: {
  target_type: string;
  target_id: string;
  reason: string;
}) {
  return authApiRequest<Report>("/api/reports", { method: "POST", body });
}
