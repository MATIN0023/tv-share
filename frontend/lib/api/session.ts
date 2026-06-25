import { AUTH_TOKEN_COOKIE, ROLE_COOKIE } from "@/lib/auth/roles";
import type { AuthResponse } from "@/lib/api/types";

const MAX_AGE = 60 * 60 * 24; // 24 hours

export function persistSession(auth: AuthResponse): void {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_TOKEN_COOKIE}=${auth.token}; path=/; max-age=${MAX_AGE}; SameSite=Lax`;
  document.cookie = `${ROLE_COOKIE}=${auth.role}; path=/; max-age=${MAX_AGE}; SameSite=Lax`;
}

export function clearSession(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_TOKEN_COOKIE}=; path=/; max-age=0`;
  document.cookie = `${ROLE_COOKIE}=; path=/; max-age=0`;
}

export function getAuthToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${AUTH_TOKEN_COOKIE}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}
