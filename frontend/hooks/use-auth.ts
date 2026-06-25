"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  login,
  register,
  verifyOTP,
  requestOTP,
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
      router.push("/dashboard");
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
      router.push("/dashboard");
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
      router.push("/dashboard");
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return () => {
    clearSession();
    queryClient.clear();
    router.push("/login");
  };
}
