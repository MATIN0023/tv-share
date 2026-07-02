const GOOGLE_PHONE_PREFIX = "google:";

/** True when phone_number is the internal placeholder for Google-only accounts. */
export function isGoogleSyntheticPhone(phone?: string | null): boolean {
  return Boolean(phone?.startsWith(GOOGLE_PHONE_PREFIX));
}

export function isGoogleAuthProvider(provider?: string | null): boolean {
  return provider === "google" || provider === "both";
}
