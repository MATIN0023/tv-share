"use client";

import Link from "next/link";
import {
  AlertTriangle,
  WifiOff,
  ShieldAlert,
  LogIn,
  LifeBuoy,
  ArrowLeft,
  RefreshCw,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/providers/i18n-provider";
import { useAppError } from "@/hooks/use-app-error";
import type { ErrorAction, ErrorContextKey, ErrorSeverity } from "@/lib/errors";

const SEVERITY_STYLES: Record<
  ErrorSeverity,
  { box: string; icon: string; title: string; text: string; btn: string }
> = {
  error: {
    box: "border-red-500/30 bg-red-500/10",
    icon: "text-red-400",
    title: "text-red-300",
    text: "text-red-200/90",
    btn: "border-red-300/40 text-red-100 hover:bg-red-500/10",
  },
  warning: {
    box: "border-amber-500/30 bg-amber-500/10",
    icon: "text-amber-400",
    title: "text-amber-300",
    text: "text-amber-200/90",
    btn: "border-amber-300/40 text-amber-100 hover:bg-amber-500/10",
  },
  info: {
    box: "border-sky-500/30 bg-sky-500/10",
    icon: "text-sky-400",
    title: "text-sky-300",
    text: "text-sky-200/90",
    btn: "border-sky-300/40 text-sky-100 hover:bg-sky-500/10",
  },
};

function SeverityIcon({
  severity,
  code,
  className,
}: {
  severity: ErrorSeverity;
  code?: string;
  className?: string;
}) {
  if (code === "offline" || code === "network") {
    return <WifiOff className={className} />;
  }
  if (severity === "info") return <Info className={className} />;
  if (severity === "warning") return <AlertTriangle className={className} />;
  return <ShieldAlert className={className} />;
}

export interface ErrorStateProps {
  /** Raw error — auto-resolved when provided */
  error?: unknown;
  /** Scope for fallback messages */
  context?: ErrorContextKey;
  /** Manual override (used when error is not provided) */
  title?: string;
  description?: string;
  severity?: ErrorSeverity;
  action?: ErrorAction;
  onRetry?: () => void;
  /** compact = inline banner; page = full panel (default) */
  variant?: "page" | "compact" | "inline";
  className?: string;
  showCode?: boolean;
}

export function ErrorState({
  error,
  context = "generic",
  title,
  description,
  severity,
  action,
  onRetry,
  variant = "page",
  className,
  showCode = false,
}: ErrorStateProps) {
  const { t } = useTranslation();
  const { resolve } = useAppError();

  const resolved = error ? resolve(error, context) : null;
  const finalTitle = title ?? resolved?.title ?? t("errors.generic.title");
  const finalDesc = description ?? resolved?.description ?? t("errors.generic.description");
  const finalSeverity = severity ?? resolved?.severity ?? "error";
  const finalAction = action ?? resolved?.action ?? (onRetry ? "retry" : "none");
  const code = resolved?.code;
  const styles = SEVERITY_STYLES[finalSeverity];

  const actionButton = (() => {
    if (finalAction === "retry" && onRetry) {
      return (
        <button
          type="button"
          onClick={onRetry}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition",
            styles.btn
          )}
        >
          <RefreshCw className="size-3.5" />
          {t("common.retry")}
        </button>
      );
    }
    if (finalAction === "login") {
      return (
        <Link
          href="/login"
          className={cn(
            "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition",
            styles.btn
          )}
        >
          <LogIn className="size-3.5" />
          {t("errors.actions.login")}
        </Link>
      );
    }
    if (finalAction === "support") {
      return (
        <Link
          href="/support"
          className={cn(
            "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition",
            styles.btn
          )}
        >
          <LifeBuoy className="size-3.5" />
          {t("errors.actions.support")}
        </Link>
      );
    }
    if (finalAction === "back") {
      return (
        <button
          type="button"
          onClick={() => window.history.back()}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition",
            styles.btn
          )}
        >
          <ArrowLeft className="size-3.5 rtl:rotate-180" />
          {t("errors.actions.back")}
        </button>
      );
    }
    if (onRetry) {
      return (
        <button
          type="button"
          onClick={onRetry}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition",
            styles.btn
          )}
        >
          <RefreshCw className="size-3.5" />
          {t("common.retry")}
        </button>
      );
    }
    return null;
  })();

  if (variant === "inline") {
    return (
      <p className={cn("text-sm", styles.text, className)} role="alert">
        {finalTitle}
        {finalDesc ? ` — ${finalDesc}` : null}
      </p>
    );
  }

  if (variant === "compact") {
    return (
      <div
        role="alert"
        className={cn(
          "flex items-start gap-3 rounded-xl border p-4",
          styles.box,
          className
        )}
      >
        <SeverityIcon
          severity={finalSeverity}
          code={code}
          className={cn("mt-0.5 size-5 shrink-0", styles.icon)}
        />
        <div className="min-w-0 flex-1">
          <p className={cn("font-medium text-sm", styles.title)}>{finalTitle}</p>
          {finalDesc ? (
            <p className={cn("mt-1 text-xs", styles.text)}>{finalDesc}</p>
          ) : null}
          {showCode && code ? (
            <p className="mt-1 font-mono text-[10px] opacity-50">{code}</p>
          ) : null}
        </div>
        {actionButton ? <div className="shrink-0">{actionButton}</div> : null}
      </div>
    );
  }

  return (
    <div
      role="alert"
      className={cn(
        "rounded-2xl border p-6 text-center",
        styles.box,
        className
      )}
    >
      <SeverityIcon
        severity={finalSeverity}
        code={code}
        className={cn("mx-auto size-8", styles.icon)}
      />
      <h3 className={cn("mt-3 font-semibold", styles.title)}>{finalTitle}</h3>
      <p className={cn("mt-2 text-sm", styles.text)}>{finalDesc}</p>
      {showCode && code ? (
        <p className="mt-2 font-mono text-[10px] opacity-40">{code}</p>
      ) : null}
      {actionButton ? <div className="mt-4 flex justify-center">{actionButton}</div> : null}
    </div>
  );
}
