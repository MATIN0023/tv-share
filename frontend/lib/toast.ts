"use client";

import { create } from "zustand";

type ToastItem = {
  id: string;
  type: "success" | "error" | "info";
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
  info: (message: string) =>
    useToastStore.getState().push({ type: "info", message }),
};

export function getErrorMessage(err: unknown, fallback = "خطایی رخ داد"): string {
  if (err && typeof err === "object" && "message" in err) {
    return String((err as { message: string }).message);
  }
  return fallback;
}
