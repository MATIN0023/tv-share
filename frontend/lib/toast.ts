"use client";

import { create } from "zustand";
import { tStatic } from "@/lib/i18n";
import {
  resolveErrorMessage,
  type ErrorContextKey,
} from "@/lib/errors";

type ToastItem = {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
};

type ToastState = {
  toasts: ToastItem[];
  push: (item: Omit<ToastItem, "id">) => void;
  dismiss: (id: string) => void;
};

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (item) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    set((s) => ({ toasts: [...s.toasts, { ...item, id }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 4500);
  },
  dismiss: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (message: string) =>
    useToastStore.getState().push({ type: "success", message }),
  error: (message: string) =>
    useToastStore.getState().push({ type: "error", message }),
  warning: (message: string) =>
    useToastStore.getState().push({ type: "warning", message }),
  info: (message: string) =>
    useToastStore.getState().push({ type: "info", message }),
};

/** @deprecated Use showAppError or useAppError().message */
export function getErrorMessage(
  err: unknown,
  fallback = tStatic("common.errorGeneric")
): string {
  if (err && typeof err === "object" && "message" in err) {
    return resolveErrorMessage(tStatic, err, "generic") || String((err as { message: string }).message);
  }
  return fallback;
}

/** Show a localized toast from any error + context */
export function showAppError(
  err: unknown,
  context: ErrorContextKey = "generic"
): void {
  toast.error(resolveErrorMessage(tStatic, err, context));
}

/** Show success toast with i18n key or raw string */
export function showSuccess(message: string): void {
  toast.success(message);
}
