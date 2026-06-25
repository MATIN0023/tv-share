"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  requestOTP,
  verifyOTP,
  persistSession,
  ApiError,
} from "@/lib/api";

const phoneSchema = z.object({
  phone: z.string().regex(/^09\d{9}$/, "شماره موبایل معتبر نیست"),
});

const otpSchema = z.object({
  code: z.string().length(5, "کد باید ۵ رقم باشد"),
});

type PhoneForm = z.infer<typeof phoneSchema>;
type OtpForm = z.infer<typeof otpSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  const phoneForm = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "" },
  });

  const otpForm = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  });

  const onRequestOTP = async (data: PhoneForm) => {
    setError(null);
    try {
      await requestOTP({ phone_number: data.phone });
      setPhone(data.phone);
      setStep("otp");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "ارسال کد ناموفق بود");
    }
  };

  const onVerifyOTP = async (data: OtpForm) => {
    setError(null);
    try {
      const auth = await verifyOTP({ phone_number: phone, code: data.code });
      persistSession(auth);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "کد نامعتبر است");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>ورود با کد یکبار مصرف</CardTitle>
          <CardDescription>
            {step === "phone"
              ? "شماره موبایل خود را وارد کنید. کد در کنسول سرور چاپ می‌شود."
              : `کد ارسال‌شده به ${phone} را وارد کنید`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "phone" ? (
            <Form {...phoneForm}>
              <form onSubmit={phoneForm.handleSubmit(onRequestOTP)} className="space-y-4">
                <FormField
                  control={phoneForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>شماره موبایل</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="09123456789" {...field} dir="ltr" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <StatefulButton type="submit">دریافت کد</StatefulButton>
              </form>
            </Form>
          ) : (
            <Form {...otpForm}>
              <form onSubmit={otpForm.handleSubmit(onVerifyOTP)} className="space-y-4">
                <FormField
                  control={otpForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>کد ۵ رقمی</FormLabel>
                      <FormControl>
                        <Input placeholder="12345" maxLength={5} {...field} dir="ltr" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <StatefulButton type="submit">تأیید و ورود</StatefulButton>
                <button
                  type="button"
                  className="text-sm text-purple-600 w-full"
                  onClick={() => setStep("phone")}
                >
                  تغییر شماره
                </button>
              </form>
            </Form>
          )}
          <p className="mt-4 text-sm text-center">
            <Link href="/login" className="text-purple-600">بازگشت به ورود با رمز</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
