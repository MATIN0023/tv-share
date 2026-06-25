"use client";

import { useMutation } from "@tanstack/react-query";
import { createReport } from "@/lib/api/admin";
import { toast, getErrorMessage } from "@/lib/toast";

export function useCreateReport() {
  return useMutation({
    mutationFn: createReport,
    onSuccess: () => toast.success("گزارش شما ثبت شد"),
    onError: (e) => toast.error(getErrorMessage(e, "ثبت گزارش ناموفق بود")),
  });
}
