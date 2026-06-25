"use client";

import { useQuery } from "@tanstack/react-query";
import { getPublicSettings } from "@/lib/api/settings";

export function usePublicSettings() {
  return useQuery({
    queryKey: ["public-settings"],
    queryFn: getPublicSettings,
    staleTime: 60_000,
    enabled: typeof document !== "undefined",
  });
}
