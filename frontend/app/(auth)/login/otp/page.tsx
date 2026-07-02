"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { OtpInput } from "@/components/forms/otp-input";
import { AuthShell } from "@/components/auth/auth-shell";
import { authInputClass, authLabelClass } from "@/components/auth/auth-field-styles";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { useRequestOTPMutation, useVerifyOTPMutation } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api";
import { useTranslation } from "@/providers/i18n-provider";

type PhoneForm = { phone: string };

export default function OtpLoginPage() {
  const { t } = useTranslation();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);

  const requestOtp = useRequestOTPMutation();
  const verifyOtp = useVerifyOTPMutation();

  const phoneSchema = useMemo(
    () =>
      z.object({
        phone: z.string().regex(/^09\d{9}$/, t("validation.phoneInvalid")),
      }),
    [t]
  );

  const phoneForm = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "" },
  });

  const onRequestOTP = async (data: PhoneForm) => {
    setError(null);
    try {
      await requestOtp.mutateAsync({ phone_number: data.phone });
      setPhone(data.phone);
      setOtp("");
      setStep("otp");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("auth.otpSendFailed"));
    }
  };

  const submitOtp = async (code: string) => {
    if (code.length !== 5) return;
    setError(null);
    try {
      await verifyOtp.mutateAsync({ phone_number: phone, code });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("auth.otpInvalid"));
      setOtp("");
    }
  };

  return (
    <AuthShell
      title={t("auth.otpLoginTitle")}
      subtitle={
        step === "phone"
          ? t("auth.otpPhoneStep")
          : t("auth.otpSentTo", { phone })
      }
    >
      {step === "phone" ? (
        <Form {...phoneForm}>
          <form onSubmit={phoneForm.handleSubmit(onRequestOTP)} className="space-y-5">
            <FormField
              control={phoneForm.control}
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
                      dir="ltr"
                      className={authInputClass}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error ? (
              <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-center text-sm text-rose-400">
                {error}
              </p>
            ) : null}
            <StatefulButton type="submit" disabled={requestOtp.isPending} loadingText={t("auth.sendingOtp")}>
              {t("auth.getCode")}
            </StatefulButton>
          </form>
        </Form>
      ) : (
        <div className="space-y-6">
          <div>
            <p className="mb-5 text-center text-sm text-zinc-400">{t("auth.otpEnterCode")}</p>
            <OtpInput
              value={otp}
              onChange={setOtp}
              onComplete={submitOtp}
              disabled={verifyOtp.isPending}
            />
          </div>
          {error ? (
            <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-center text-sm text-rose-400">
              {error}
            </p>
          ) : null}
          {verifyOtp.isPending ? (
            <p className="text-center text-sm text-zinc-500">{t("auth.verifyingOtp")}</p>
          ) : null}
          <button
            type="button"
            className="w-full text-sm text-violet-400 transition hover:text-violet-300"
            onClick={() => {
              setStep("phone");
              setOtp("");
              setError(null);
            }}
          >
            {t("auth.changePhone")}
          </button>
        </div>
      )}

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-700/80" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-wide">
          <span className="bg-zinc-900 px-3 text-zinc-500">{t("common.or")}</span>
        </div>
      </div>

      <GoogleSignInButton />

      <p className="mt-6 text-center text-sm text-zinc-500">
        {t("auth.noAccount")}{" "}
        <Link href="/signup" className="font-semibold text-violet-400 hover:text-violet-300">
          {t("auth.signupLink")}
        </Link>
      </p>
    </AuthShell>
  );
}
