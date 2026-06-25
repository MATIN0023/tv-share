"use client";

import { useQuery } from "@tanstack/react-query";
import { listMyActivity } from "@/lib/api/activity";

export function useMyActivity(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["my-activity", params?.page, params?.limit],
    queryFn: () => listMyActivity(params),
    enabled: typeof document !== "undefined",
  });
}
