"use client";

import { ModalShell } from "./modal-shell";
import type { TicketRow } from "@/components/dashboard/tables/tickets-table";

interface TicketDetailModalProps {
  open: boolean;
  onClose: () => void;
  ticket: TicketRow | null;
}

export function TicketDetailModal({ open, onClose, ticket }: TicketDetailModalProps) {
  if (!ticket) return null;

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={`تیکت ${ticket.id}`}
      description={ticket.subject}
    >
      <div className="space-y-3 text-sm">
        <div className="rounded-xl border border-white/10 p-3">
          <p className="text-muted-foreground">دسته: {ticket.category}</p>
          <p className="mt-2">{ticket.lastMessage}</p>
        </div>
        <div className="rounded-xl border border-white/10 p-3">
          <p className="text-xs text-muted-foreground">پاسخ پشتیبانی (نمونه)</p>
          <p className="mt-2">
            سلام، تیم ما در حال بررسی درخواست شماست. تا ۲۴ ساعت آینده پاسخ می‌دهیم.
          </p>
        </div>
        <textarea
          placeholder="پاسخ شما..."
          rows={3}
          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none"
        />
        <button type="button" className="w-full rounded-xl bg-primary px-3 py-2 text-sm text-white">
          ارسال پاسخ
        </button>
      </div>
    </ModalShell>
  );
}
