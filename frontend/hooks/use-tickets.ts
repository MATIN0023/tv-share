"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addTicketMessage,
  createTicket,
  getTicket,
  listTickets,
  queryKeys,
} from "@/lib/api";

export function useTickets() {
  return useQuery({
    queryKey: queryKeys.tickets.list(),
    queryFn: listTickets,
    enabled: typeof document !== "undefined",
  });
}

export function useTicket(id: string | null) {
  return useQuery({
    queryKey: queryKeys.tickets.detail(id ?? ""),
    queryFn: () => getTicket(id!),
    enabled: Boolean(id) && typeof document !== "undefined",
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
    },
  });
}

export function useAddTicketMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) =>
      addTicketMessage(id, body),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.detail(vars.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
    },
  });
}
