"use client";

import { useMutation } from "@tanstack/react-query";
import { createReport } from "@/lib/api/admin";
import { toast, showAppError } from "@/lib/toast";
import { useTranslation } from "@/providers/i18n-provider";

export function useCreateReport() {
  const { t } = useTranslation();
  return useMutation({
    mutationFn: createReport,
    onSuccess: () => toast.success(t("errors.reportSubmitted")),
    onError: (e) => showAppError(e, "generic"),
  });
}
