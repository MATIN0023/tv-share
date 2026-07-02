"use client";

import { useQuery } from "@tanstack/react-query";
import { getMe, queryKeys, getAuthToken, syncRoleCookie } from "@/lib/api";

export function useMe() {
  const hasToken =
    typeof window !== "undefined" ? Boolean(getAuthToken()) : false;

  return useQuery({
    queryKey: queryKeys.me,
    queryFn: async () => {
      const me = await getMe();
      syncRoleCookie(me.role);
      return me;
    },
    enabled: hasToken,
    retry: false,
  });
}
