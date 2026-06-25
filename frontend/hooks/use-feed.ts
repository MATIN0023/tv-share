"use client";

import { useQuery } from "@tanstack/react-query";
import { getFeed, getRoomHistory, getWatchHistory, queryKeys } from "@/lib/api";

export function useFeed() {
  return useQuery({
    queryKey: queryKeys.feed,
    queryFn: getFeed,
    enabled: typeof document !== "undefined",
  });
}

export function useWatchHistory() {
  return useQuery({
    queryKey: queryKeys.watchHistory,
    queryFn: getWatchHistory,
    enabled: typeof document !== "undefined",
  });
}

export function useRoomHistory() {
  return useQuery({
    queryKey: queryKeys.roomHistory,
    queryFn: getRoomHistory,
    enabled: typeof document !== "undefined",
  });
}
