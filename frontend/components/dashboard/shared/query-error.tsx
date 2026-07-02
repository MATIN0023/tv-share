"use client";

import { ErrorState } from "./error-state";
import type { ErrorContextKey } from "@/lib/errors";

interface QueryErrorProps {
  error: unknown;
  context: ErrorContextKey;
  onRetry?: () => void;
  variant?: "page" | "compact";
  className?: string;
}

/** Drop-in replacement for react-query error UI */
export function QueryError({
  error,
  context,
  onRetry,
  variant = "page",
  className,
}: QueryErrorProps) {
  if (!error) return null;
  return (
    <ErrorState
      error={error}
      context={context}
      onRetry={onRetry}
      variant={variant}
      className={className}
    />
  );
}
