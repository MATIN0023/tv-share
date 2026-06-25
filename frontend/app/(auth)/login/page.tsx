"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { useLoginMutation } from "@/hooks/use-auth";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
  const loginMutation = useLoginMutation();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: "09123456789",
      password: "Admin123",
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(
      { phone_number: data.phone, password: data.password },
      {
        onError: (err) => {
          form.setError("root", {
            message:
              err instanceof ApiError
                ? err.message
                : "خطا در ورود. دوباره تلاش کنید.",
          });
        },
      }
    );
  };

  const rootError = form.formState.errors.root?.message;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-black dark:to-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-2 shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              خوش آمدید
            </CardTitle>
            <CardDescription className="text-center text-base">
              ورود با شماره موبایل و رمز عبور
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>شماره موبایل</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="09123456789"
                          {...field}
                          className="text-left"
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
                      <FormLabel>رمز عبور</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                          className="text-left"
                          dir="ltr"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {rootError ? (
                  <p className="text-sm text-red-600 text-center">{rootError}</p>
                ) : null}
                <div className="flex items-center justify-between text-sm">
                  <Link
                    href="/forgot-password"
                    className="text-purple-600 hover:text-purple-700 dark:text-purple-400"
                  >
                    فراموشی رمز عبور؟ (ورود با OTP)
                  </Link>
                </div>
                <div className="pt-2">
                  <StatefulButton
                    type="submit"
                    disabled={loginMutation.isPending}
                    loadingText="در حال ورود..."
                    successText="ورود موفق!"
                  >
                    ورود
                  </StatefulButton>
                </div>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-gray-600 dark:text-gray-400">
              حساب کاربری ندارید؟{" "}
              <Link href="/signup" className="text-purple-600 font-semibold">
                ثبت‌نام کنید
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
