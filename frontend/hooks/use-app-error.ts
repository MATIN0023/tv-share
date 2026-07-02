"use client";

import { useCallback, useMemo } from "react";
import { useTranslation } from "@/providers/i18n-provider";
import {
  resolveError,
  resolveErrorMessage,
  type ErrorContextKey,
  type ResolvedError,
} from "@/lib/errors";

export function useAppError() {
  const { t } = useTranslation();

  const resolve = useCallback(
    (err: unknown, context: ErrorContextKey = "generic"): ResolvedError =>
      resolveError(t, err, context),
    [t]
  );

  const message = useCallback(
    (err: unknown, context: ErrorContextKey = "generic"): string =>
      resolveErrorMessage(t, err, context),
    [t]
  );

  return useMemo(() => ({ resolve, message }), [resolve, message]);
}
