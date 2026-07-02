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
import { GoogleAuthSection } from "@/components/auth/google-auth-section";
import { authInputClass, authLabelClass } from "@/components/auth/auth-field-styles";
import { useRegisterMutation } from "@/hooks/use-auth";
import {
  createAuthSchemas,
  type SignupFormValues,
} from "@/lib/validations/create-auth-schemas";
import { ApiError } from "@/lib/api";
import { useTranslation } from "@/providers/i18n-provider";

export default function SignupPage() {
  const { t } = useTranslation();
  const registerMutation = useRegisterMutation();
  const { signupSchema } = useMemo(() => createAuthSchemas(t), [t]);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: SignupFormValues) => {
    registerMutation.mutate(
      {
        phone_number: data.phone,
        password: data.password,
        display_name: data.name,
      },
      {
        onError: (err) => {
          form.setError("root", {
            message:
              err instanceof ApiError ? err.message : t("auth.signupError"),
          });
        },
      }
    );
  };

  const rootError = form.formState.errors.root?.message;

  return (
    <AuthShell
      showTabs={false}
      title={t("auth.signupTitle")}
      subtitle={t("auth.signupWithPassword")}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={authLabelClass}>{t("auth.displayName")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("auth.namePlaceholder")}
                    {...field}
                    className={authInputClass}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                    {...field}
                    dir="ltr"
                    className={authInputClass}
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
                    {...field}
                    dir="ltr"
                    className={authInputClass}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={authLabelClass}>{t("auth.confirmPassword")}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    {...field}
                    dir="ltr"
                    className={authInputClass}
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
          <StatefulButton
            type="submit"
            disabled={registerMutation.isPending}
            loadingText={t("auth.signingUp")}
            successText={t("auth.signupSuccess")}
          >
            {t("common.signup")}
          </StatefulButton>
        </form>
      </Form>

      <GoogleAuthSection />

      <p className="mt-6 text-center text-sm text-zinc-500">
        {t("auth.hasAccount")}{" "}
        <Link href="/login" className="font-semibold text-violet-400 hover:text-violet-300">
          {t("auth.loginLink")}
        </Link>
      </p>
    </AuthShell>
  );
}
