export type UserRole = "user" | "admin";

export const ROLE_COOKIE = "role";
export const AUTH_TOKEN_COOKIE = "auth_token";

export function isAdminRole(role: string | undefined | null): boolean {
  return role === "admin";
}
