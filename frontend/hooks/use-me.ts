"use client";

import { useQuery } from "@tanstack/react-query";
import { getMe, queryKeys, getAuthToken } from "@/lib/api";

export function useMe() {
  const hasToken =
    typeof window !== "undefined" ? Boolean(getAuthToken()) : false;

  return useQuery({
    queryKey: queryKeys.me,
    queryFn: getMe,
    enabled: hasToken,
  });
}
