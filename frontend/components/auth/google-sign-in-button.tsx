"use client";

import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { googleLogin, persistSession, queryKeys } from "@/lib/api";
import { useTranslation } from "@/providers/i18n-provider";

export function GoogleSignInButton() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const mutation = useMutation({
    mutationFn: (idToken: string) => googleLogin({ id_token: idToken }),
    onSuccess: (auth) => {
      persistSession(auth);
      queryClient.invalidateQueries({ queryKey: queryKeys.me });
      router.push(
        auth.role === "admin" || auth.role === "superadmin"
          ? "/admin"
          : "/dashboard"
      );
    },
  });

  if (!clientId) {
    return null;
  }

  return (
    <div className="flex w-full flex-col items-stretch gap-2">
      <GoogleLogin
        onSuccess={(cred: CredentialResponse) => {
          if (cred.credential) mutation.mutate(cred.credential);
        }}
        onError={() => mutation.reset()}
        theme="filled_black"
        size="large"
        width={320}
        text="continue_with"
        shape="pill"
        locale={document.documentElement.lang === "en" ? "en" : "fa"}
      />
      {mutation.isPending ? (
        <p className="text-sm text-zinc-500">{t("auth.googleSigningIn")}</p>
      ) : null}
      {mutation.isError ? (
        <p className="text-sm text-rose-400">{t("auth.googleError")}</p>
      ) : null}
    </div>
  );
}
