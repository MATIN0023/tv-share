"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { StatefulButton } from "@/components/ui/stateful-button";
import { AuthShell } from "@/components/auth/auth-shell";
import { authInputClass, authLabelClass } from "@/components/auth/auth-field-styles";
import { GoogleAuthSection } from "@/components/auth/google-auth-section";
import { useLoginMutation } from "@/hooks/use-auth";
import {
  createAuthSchemas,
  type LoginFormValues,
} from "@/lib/validations/create-auth-schemas";
import { ApiError } from "@/lib/api";
import { useTranslation } from "@/providers/i18n-provider";

export default function LoginPage() {
  const { t } = useTranslation();
  const loginMutation = useLoginMutation();
  const { loginSchema } = useMemo(() => createAuthSchemas(t), [t]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: "", password: "" },
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(
      { phone_number: data.phone, password: data.password },
      {
        onError: (err) => {
          form.setError("root", {
            message:
              err instanceof ApiError ? err.message : t("auth.loginError"),
          });
        },
      }
    );
  };

  const rootError = form.formState.errors.root?.message;

  return (
    <AuthShell title={t("auth.welcome")} subtitle={t("auth.loginSubtitle")}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={authLabelClass}>{t("auth.phone")}</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="09123456789"
                    autoComplete="tel"
                    {...field}
                    className={authInputClass}
                    dir="ltr"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={authLabelClass}>{t("auth.password")}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...field}
                    className={authInputClass}
                    dir="ltr"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {rootError ? (
            <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-center text-sm text-rose-400">
              {rootError}
            </p>
          ) : null}
          <div className="text-end text-sm">
            <Link
              href="/login/otp"
              className="text-violet-400 transition hover:text-violet-300"
            >
              {t("auth.tabOtp")} →
            </Link>
          </div>
          <StatefulButton
            type="submit"
            disabled={loginMutation.isPending}
            loadingText={t("auth.loggingIn")}
            successText={t("auth.loginSuccess")}
          >
            {t("common.login")}
          </StatefulButton>
        </form>
      </Form>

      <GoogleAuthSection />

      <p className="mt-6 text-center text-sm text-zinc-500">
        {t("auth.noAccount")}{" "}
        <Link href="/signup" className="font-semibold text-violet-400 hover:text-violet-300">
          {t("auth.signupLink")}
        </Link>
      </p>
    </AuthShell>
  );
}
