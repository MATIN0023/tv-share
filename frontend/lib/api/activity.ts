import { authApiRequest } from "./authenticated";
import type { AuditLog, PaginatedResult } from "./types";

export function listMyActivity(params?: { page?: number; limit?: number }) {
  const sp = new URLSearchParams();
  if (params?.page) sp.set("page", String(params.page));
  if (params?.limit) sp.set("limit", String(params.limit));
  const q = sp.toString();
  return authApiRequest<PaginatedResult<AuditLog>>(
    `/api/activity${q ? `?${q}` : ""}`
  );
}
