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
import { useRegisterMutation } from "@/hooks/use-auth";
import { signupSchema, type SignupFormValues } from "@/lib/validations/auth";
import { ApiError } from "@/lib/api";

export default function SignupPage() {
  const registerMutation = useRegisterMutation();

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
              err instanceof ApiError
                ? err.message
                : "خطا در ثبت‌نام. دوباره تلاش کنید.",
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
        className="w-full max-w-md"
      >
        <Card className="border-2 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">عضویت</CardTitle>
            <CardDescription className="text-center">
              ثبت‌نام با موبایل و رمز عبور
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نام نمایشی</FormLabel>
                      <FormControl>
                        <Input placeholder="علی احمدی" {...field} />
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
                      <FormLabel>شماره موبایل</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="09123456789"
                          {...field}
                          dir="ltr"
                          className="text-left"
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
                        <Input type="password" {...field} dir="ltr" className="text-left" />
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
                      <FormLabel>تکرار رمز عبور</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} dir="ltr" className="text-left" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {rootError ? (
                  <p className="text-sm text-red-600 text-center">{rootError}</p>
                ) : null}
                <StatefulButton
                  type="submit"
                  disabled={registerMutation.isPending}
                  loadingText="در حال ثبت‌نام..."
                  successText="ثبت‌نام موفق!"
                >
                  ثبت‌نام
                </StatefulButton>
              </form>
            </Form>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-center w-full text-gray-600">
              قبلاً ثبت‌نام کرده‌اید؟{" "}
              <Link href="/login" className="text-purple-600 font-semibold">
                وارد شوید
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
