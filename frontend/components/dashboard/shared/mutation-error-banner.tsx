"use client";

import { ErrorState } from "./error-state";
import type { ErrorContextKey } from "@/lib/errors";

interface MutationErrorBannerProps {
  error: unknown;
  context: ErrorContextKey;
  onDismiss?: () => void;
  className?: string;
}

/** Inline error for form / modal mutations */
export function MutationErrorBanner({
  error,
  context,
  onDismiss,
  className,
}: MutationErrorBannerProps) {
  if (!error) return null;

  return (
    <div className={className}>
      <ErrorState error={error} context={context} variant="compact" />
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="mt-1 text-xs text-muted-foreground hover:text-foreground"
        >
          ×
        </button>
      ) : null}
    </div>
  );
}
