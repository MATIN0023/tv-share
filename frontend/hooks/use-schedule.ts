"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  completeScheduledVideo,
  createScheduledVideo,
  deleteScheduledVideo,
  listSchedule,
  queryKeys,
} from "@/lib/api";

export function useSchedule() {
  return useQuery({
    queryKey: queryKeys.schedule,
    queryFn: () => listSchedule(),
    enabled: typeof document !== "undefined",
  });
}

export function useCreateSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createScheduledVideo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schedule });
    },
  });
}

export function useCompleteSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: completeScheduledVideo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schedule });
    },
  });
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteScheduledVideo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schedule });
    },
  });
}
