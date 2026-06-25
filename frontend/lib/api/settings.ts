import { apiRequest } from "./client";
import type { SystemSettings } from "./types";

/** Public site settings (no auth) — used by dashboard UI. */
export type PublicSettings = Pick<
  SystemSettings,
  | "site_name"
  | "announcement_text"
  | "login_enabled"
  | "signup_enabled"
  | "payment_enabled"
  | "otp_enabled"
  | "allow_guest_rooms"
  | "maintenance_mode"
  | "max_upload_size_mb"
  | "support_email"
  | "support_phone"
>;

export function getPublicSettings() {
  return apiRequest<PublicSettings>("/api/settings/public");
}
