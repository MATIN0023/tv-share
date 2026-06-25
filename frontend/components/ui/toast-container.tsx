"use client";

import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { useToastStore } from "@/lib/toast";
import { cn } from "@/lib/utils";

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (!toasts.length) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-[200] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => {
        const Icon =
          t.type === "success"
            ? CheckCircle2
            : t.type === "error"
              ? XCircle
              : Info;
        return (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur-md",
              t.type === "success" &&
                "border-emerald-800/60 bg-emerald-950/90 text-emerald-100",
              t.type === "error" &&
                "border-red-800/60 bg-red-950/90 text-red-100",
              t.type === "info" &&
                "border-zinc-700 bg-zinc-900/95 text-zinc-100"
            )}
          >
            <Icon className="mt-0.5 size-4 shrink-0" />
            <p className="flex-1 leading-relaxed">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="opacity-70 hover:opacity-100"
              aria-label="بستن"
            >
              <X className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
