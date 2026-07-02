"use client";

import { CheckCircle2, XCircle, Info, X, AlertTriangle } from "lucide-react";
import { useToastStore } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/providers/i18n-provider";

export function ToastContainer() {
  const { t } = useTranslation();
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (!toasts.length) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-[200] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => {
        const Icon =
          toast.type === "success"
            ? CheckCircle2
            : toast.type === "error"
              ? XCircle
              : toast.type === "warning"
                ? AlertTriangle
                : Info;
        return (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur-md",
              toast.type === "success" &&
                "border-emerald-800/60 bg-emerald-950/90 text-emerald-100",
              toast.type === "error" &&
                "border-red-800/60 bg-red-950/90 text-red-100",
              toast.type === "warning" &&
                "border-amber-800/60 bg-amber-950/90 text-amber-100",
              toast.type === "info" &&
                "border-zinc-700 bg-zinc-900/95 text-zinc-100"
            )}
          >
            <Icon className="mt-0.5 size-4 shrink-0" />
            <p className="flex-1 leading-relaxed">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="opacity-70 hover:opacity-100"
              aria-label={t("common.close")}
            >
              <X className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
