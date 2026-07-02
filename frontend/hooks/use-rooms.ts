"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acceptInvitation,
  createInvitation,
  createRoom,
  getRoom,
  getRoomMessages,
  listRooms,
  pauseRoom,
  playRoom,
  updateRoomVideo,
  queryKeys,
  seekRoom,
} from "@/lib/api";

export function useRooms() {
  return useQuery({
    queryKey: queryKeys.rooms.list(),
    queryFn: listRooms,
    enabled: typeof document !== "undefined",
  });
}

export function useRoom(id: string | null) {
  return useQuery({
    queryKey: queryKeys.rooms.detail(id ?? ""),
    queryFn: () => getRoom(id!),
    enabled: Boolean(id) && typeof document !== "undefined",
  });
}

export function useRoomMessages(id: string | null) {
  return useQuery({
    queryKey: queryKeys.rooms.messages(id ?? ""),
    queryFn: () => getRoomMessages(id!),
    enabled: Boolean(id) && typeof document !== "undefined",
    refetchInterval: () =>
      typeof document !== "undefined" && document.visibilityState === "visible"
        ? 15_000
        : false,
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all });
    },
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: acceptInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all });
    },
  });
}

export function usePlayRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: playRoom,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.detail(id) });
    },
  });
}

export function usePauseRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: pauseRoom,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.detail(id) });
    },
  });
}

export function useSeekRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, position }: { id: string; position: number }) =>
      seekRoom(id, position),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.detail(vars.id) });
    },
  });
}

export function useCreateInvitation() {
  return useMutation({
    mutationFn: createInvitation,
  });
}

export function useUpdateRoomVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, videoUrl }: { id: string; videoUrl: string }) =>
      updateRoomVideo(id, videoUrl),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.detail(vars.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all });
    },
  });
}
