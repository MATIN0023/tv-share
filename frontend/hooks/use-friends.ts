"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acceptFriendRequest,
  blockUser,
  listBlockedUsers,
  listFriendRequests,
  listFriends,
  listUsers,
  queryKeys,
  rejectFriendRequest,
  sendFriendRequest,
} from "@/lib/api";

export function useFriends() {
  return useQuery({
    queryKey: queryKeys.friends.list(),
    queryFn: listFriends,
    enabled: typeof document !== "undefined",
  });
}

export function useFriendRequests() {
  return useQuery({
    queryKey: queryKeys.friends.requests(),
    queryFn: listFriendRequests,
    enabled: typeof document !== "undefined",
  });
}

export function useBlockedUsers() {
  return useQuery({
    queryKey: queryKeys.friends.blocked(),
    queryFn: listBlockedUsers,
    enabled: typeof document !== "undefined",
  });
}

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: listUsers,
    enabled: typeof document !== "undefined",
  });
}

export function useSendFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.all });
    },
  });
}

export function useAcceptFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.all });
    },
  });
}

export function useRejectFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rejectFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.all });
    },
  });
}

export function useBlockUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: blockUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.blocked() });
    },
  });
}
