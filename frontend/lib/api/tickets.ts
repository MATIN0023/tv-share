import { authApiRequest } from "./authenticated";
import type { Ticket, TicketMessage } from "./types";

export function listTickets() {
  return authApiRequest<{ tickets: Ticket[] }>("/api/tickets");
}

export function createTicket(body: { subject: string; body?: string }) {
  return authApiRequest<Ticket>("/api/tickets", {
    method: "POST",
    body,
  });
}

export function getTicket(id: string) {
  return authApiRequest<{ ticket: Ticket; messages: TicketMessage[] }>(
    `/api/tickets/${id}`
  );
}

export function addTicketMessage(id: string, body: string) {
  return authApiRequest<TicketMessage>(`/api/tickets/${id}/messages`, {
    method: "POST",
    body: { body },
  });
}
