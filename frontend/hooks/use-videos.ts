"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteVideo,
  listVideos,
  queryKeys,
  uploadVideo,
} from "@/lib/api";

export function useVideos() {
  return useQuery({
    queryKey: queryKeys.videos.list(),
    queryFn: listVideos,
    enabled: typeof document !== "undefined",
  });
}

export function useUploadVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadVideo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.videos.all });
    },
  });
}

export function useDeleteVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteVideo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.videos.all });
    },
  });
}
