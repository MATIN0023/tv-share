"use client";

import { QueryError } from "@/components/dashboard/shared/query-error";
import type { ErrorContextKey } from "@/lib/errors";

interface AdminErrorProps {
  error: unknown;
  context: ErrorContextKey;
  onRetry?: () => void;
  variant?: "page" | "compact";
  className?: string;
}

/** Admin panel error display — same resolver, dark-friendly compact default */
export function AdminError({
  error,
  context,
  onRetry,
  variant = "compact",
  className,
}: AdminErrorProps) {
  if (!error) return null;
  return (
    <QueryError
      error={error}
      context={context}
      onRetry={onRetry}
      variant={variant}
      className={className}
    />
  );
}
