"use client";

import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { useTranslation } from "@/providers/i18n-provider";

export function isGoogleOAuthConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim());
}

/** Divider + Google button; renders nothing when OAuth is not configured. */
export function GoogleAuthSection() {
  const { t } = useTranslation();

  if (!isGoogleOAuthConfigured()) {
    return null;
  }

  return (
    <>
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-700/80" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-wide">
          <span className="bg-zinc-900 px-3 text-zinc-500">{t("common.or")}</span>
        </div>
      </div>
      <GoogleSignInButton />
    </>
  );
}
