"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

function resolvePostLoginRoute(role: string): string {
  if (role === "admin" || role === "superadmin") return "/admin";
  if (typeof window !== "undefined" && !localStorage.getItem("ms-onboarded")) {
    return "/welcome";
  }
  return "/dashboard";
}
import {
  login,
  register,
  verifyOTP,
  requestOTP,
  logout,
  persistSession,
  clearSession,
  queryKeys,
  type LoginPayload,
  type RegisterPayload,
  type OTPVerifyPayload,
  type OTPRequestPayload,
} from "@/lib/api";

export function useLoginMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: (auth) => {
      persistSession(auth);
      queryClient.invalidateQueries({ queryKey: queryKeys.me });
      router.push(resolvePostLoginRoute(auth.role));
    },
  });
}

export function useRegisterMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => register(payload),
    onSuccess: (auth) => {
      persistSession(auth);
      queryClient.invalidateQueries({ queryKey: queryKeys.me });
      // new users → onboarding; existing → dashboard
      router.push(auth.is_new_user ? "/welcome" : resolvePostLoginRoute(auth.role));
    },
  });
}

export function useRequestOTPMutation() {
  return useMutation({
    mutationFn: (payload: OTPRequestPayload) => requestOTP(payload),
  });
}

export function useVerifyOTPMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: OTPVerifyPayload) => verifyOTP(payload),
    onSuccess: (auth) => {
      persistSession(auth);
      queryClient.invalidateQueries({ queryKey: queryKeys.me });
      router.push(auth.is_new_user ? "/welcome" : resolvePostLoginRoute(auth.role));
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return async () => {
    await logout();
    clearSession();
    queryClient.clear();
    router.push("/login");
  };
}
