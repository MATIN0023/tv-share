import { authApiRequest } from "./authenticated";
import type { UserProfile } from "./types";

export async function updateProfile(payload: Partial<UserProfile>): Promise<UserProfile> {
  return authApiRequest<UserProfile>("/api/users/me", {
    method: "PUT",
    body: payload,
  });
}

export async function listUsers(): Promise<{ users: UserProfile[] }> {
  return authApiRequest("/api/users");
}

export function changePassword(currentPassword: string, newPassword: string) {
  return authApiRequest<{ message: string }>("/api/users/me/password", {
    method: "PUT",
    body: { current_password: currentPassword, new_password: newPassword },
  });
}

export function updateAvatar(avatarUrl: string) {
  return authApiRequest<UserProfile>("/api/users/me/avatar", {
    method: "PUT",
    body: { avatar_url: avatarUrl },
  });
}

export function blockUser(id: string) {
  return authApiRequest<{ message: string }>(`/api/users/${id}/block`, {
    method: "POST",
  });
}

export function listBlockedUsers() {
  return authApiRequest<{ users: UserProfile[] }>("/api/users/blocked");
}
