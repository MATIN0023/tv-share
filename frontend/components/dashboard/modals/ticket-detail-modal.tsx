"use client";

import { useState } from "react";
import { ModalShell } from "./modal-shell";
import type { TicketRow } from "@/components/dashboard/tables/tickets-table";
import type { TicketMessage } from "@/lib/api/types";
import { useAddTicketMessage } from "@/hooks/use-tickets";
import { formatFaDate } from "@/lib/utils/format-date";

interface TicketDetailModalProps {
  open: boolean;
  onClose: () => void;
  ticket: TicketRow | null;
  ticketId?: string | null;
  messages?: TicketMessage[];
  isLoading?: boolean;
}

export function TicketDetailModal({
  open,
  onClose,
  ticket,
  ticketId,
  messages = [],
  isLoading = false,
}: TicketDetailModalProps) {
  const [reply, setReply] = useState("");
  const addMessage = useAddTicketMessage();

  if (!ticket) return null;

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={`تیکت ${ticket.id.slice(-8)}`}
      description={ticket.subject}
    >
      <div className="space-y-3 text-sm">
        {isLoading ? (
          <p className="text-muted-foreground">در حال بارگذاری...</p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`rounded-xl border p-3 ${
                m.is_staff ? "border-primary/30" : "border-white/10"
              }`}
            >
              <p className="text-xs text-muted-foreground">
                {m.is_staff ? "پشتیبانی" : "شما"} · {formatFaDate(m.created_at)}
              </p>
              <p className="mt-2">{m.body}</p>
            </div>
          ))
        )}
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="پاسخ شما..."
          rows={3}
          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none"
        />
        <button
          type="button"
          disabled={!reply.trim() || !ticketId || addMessage.isPending}
          onClick={() => {
            if (ticketId && reply.trim()) {
              addMessage.mutate({ id: ticketId, body: reply.trim() });
              setReply("");
            }
          }}
          className="w-full rounded-xl bg-primary px-3 py-2 text-sm text-white disabled:opacity-50"
        >
          ارسال پاسخ
        </button>
      </div>
    </ModalShell>
  );
}
