import { authApiRequest } from "./authenticated";
import type { Notification } from "./types";

export function listNotifications() {
  return authApiRequest<{ notifications: Notification[] }>(
    "/api/notifications"
  );
}

export function markNotificationRead(id: string) {
  return authApiRequest<{ message: string }>(
    `/api/notifications/${id}/read`,
    { method: "PUT" }
  );
}

export function markAllNotificationsRead() {
  return authApiRequest<{ message: string }>("/api/notifications/read-all", {
    method: "PUT",
  });
}
