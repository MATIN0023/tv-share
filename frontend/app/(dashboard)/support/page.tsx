"use client";

import { useState } from "react";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { SectionHeader } from "@/components/dashboard/section-header";
import {
  TicketsTable,
  type TicketRow,
} from "@/components/dashboard/tables/tickets-table";
import { CreateTicketModal } from "@/components/dashboard/modals/create-ticket-modal";
import { TicketDetailModal } from "@/components/dashboard/modals/ticket-detail-modal";
import { EmptyState } from "@/components/dashboard/shared/empty-state";
import { Headphones, MessageSquarePlus, Clock } from "lucide-react";

const initialTickets: TicketRow[] = [
  {
    id: "TK-1042",
    subject: "مشکل همگام‌سازی پخش در روم",
    category: "فنی",
    status: "pending",
    updatedAt: "۱۴۰۵/۰۳/۰۷ — ۱۷:۱۰",
    lastMessage: "پخش برای دوستان من ۳ ثانیه عقب است.",
  },
  {
    id: "TK-1038",
    subject: "سوال درباره تمدید اشتراک",
    category: "مالی",
    status: "resolved",
    updatedAt: "۱۴۰۵/۰۳/۰۵ — ۱۱:۴۰",
    lastMessage: "ممنون، مشکل حل شد.",
  },
];

export default function SupportPage() {
  const [tickets, setTickets] = useState(initialTickets);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<TicketRow | null>(null);
  const [tab, setTab] = useState<"all" | TicketRow["status"]>("all");

  const filtered =
    tab === "all" ? tickets : tickets.filter((t) => t.status === tab);

  const openCount = tickets.filter((t) => t.status === "open" || t.status === "pending").length;

  return (
    <div>
      <SectionHeader
        title="پشتیبانی"
        description="ارتباط با تیم پشتیبانی از طریق تیکت؛ پیگیری وضعیت و پاسخ‌ها."
      />

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3 md:mb-6">
        <GlassPanel title="تیکت‌های باز" description="">
          <p className="text-2xl font-bold text-amber-400">{openCount}</p>
        </GlassPanel>
        <GlassPanel title="میانگین پاسخ" description="">
          <div className="mt-1 flex items-center gap-2">
            <Clock className="size-5 text-primary" />
            <p className="text-lg font-semibold">زیر ۲۴ ساعت</p>
          </div>
        </GlassPanel>
        <GlassPanel title="تیکت جدید" description="">
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="mt-1 inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm text-white"
          >
            <MessageSquarePlus className="size-4" />
            ثبت تیکت
          </button>
        </GlassPanel>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 md:mb-6">
        {(
          [
            { key: "all", label: "همه" },
            { key: "open", label: "باز" },
            { key: "pending", label: "در انتظار" },
            { key: "resolved", label: "حل‌شده" },
            { key: "closed", label: "بسته" },
          ] as const
        ).map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={`rounded-xl border px-3 py-2 text-sm ${
              tab === item.key ? "border-primary text-primary" : "border-white/20"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <GlassPanel
        title="تیکت‌های من"
        description="لیست درخواست‌های ارسال‌شده به پشتیبانی."
      >
        <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Headphones className="size-4" />
          پشتیبانی ۷ روز هفته — ۹ تا ۲۱
        </div>
        {filtered.length ? (
          <TicketsTable
            rows={filtered}
            onOpen={(id) => {
              const ticket = tickets.find((t) => t.id === id) ?? null;
              setSelected(ticket);
              setDetailOpen(true);
            }}
          />
        ) : (
          <EmptyState
            title="تیکتی وجود ندارد"
            description="اولین تیکت خود را ثبت کنید تا تیم ما پیگیری کند."
          />
        )}
      </GlassPanel>

      <CreateTicketModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={(payload) => {
          const newTicket: TicketRow = {
            id: `TK-${1000 + tickets.length + 1}`,
            subject: payload.subject,
            category: payload.category,
            status: "open",
            updatedAt: "همین الان",
            lastMessage: payload.message,
          };
          setTickets((prev) => [newTicket, ...prev]);
        }}
      />
      <TicketDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        ticket={selected}
      />
    </div>
  );
}
