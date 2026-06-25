"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { SectionHeader } from "@/components/dashboard/section-header";
import { LabeledField } from "@/components/admin/labeled-field";
import { Input } from "@/components/ui/input";
import {
  TicketsTable,
  type TicketRow,
  type TicketStatus,
} from "@/components/dashboard/tables/tickets-table";
import { CreateTicketModal } from "@/components/dashboard/modals/create-ticket-modal";
import { TicketDetailModal } from "@/components/dashboard/modals/ticket-detail-modal";
import { EmptyState } from "@/components/dashboard/shared/empty-state";
import { ErrorState } from "@/components/dashboard/shared/error-state";
import { DashboardSkeleton } from "@/components/dashboard/shared/skeleton";
import {
  useCreateTicket,
  useTicket,
  useTickets,
} from "@/hooks/use-tickets";
import { useCreateReport } from "@/hooks/use-reports";
import { useUsers } from "@/hooks/use-friends";
import { useRooms } from "@/hooks/use-rooms";
import { useVideos } from "@/hooks/use-videos";
import { userReportSchema } from "@/lib/validations/admin";
import { formatFaDate } from "@/lib/utils/format-date";

export default function SupportPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<"all" | TicketStatus>("all");

  const ticketsQ = useTickets();
  const createMut = useCreateTicket();
  const reportMut = useCreateReport();
  const detailQ = useTicket(selectedId);
  const usersQ = useUsers();
  const roomsQ = useRooms();
  const videosQ = useVideos();

  const reportForm = useForm({
    resolver: zodResolver(userReportSchema),
    defaultValues: {
      target_type: "user" as const,
      target_id: "",
      reason: "",
    },
  });

  const targetType = reportForm.watch("target_type");
  const users = usersQ.data?.users ?? [];
  const rooms = roomsQ.data ?? [];
  const videos = videosQ.data?.videos ?? [];

  const tickets: TicketRow[] = useMemo(
    () =>
      (ticketsQ.data?.tickets ?? []).map((t) => ({
        id: t.id,
        subject: t.subject,
        category: t.priority ?? "—",
        status: (t.status as TicketStatus) || "open",
        updatedAt: formatFaDate(t.updated_at),
        lastMessage: t.subject,
      })),
    [ticketsQ.data]
  );

  const filtered =
    tab === "all" ? tickets : tickets.filter((t) => t.status === tab);

  const openCount = tickets.filter(
    (t) => t.status === "open" || t.status === "pending"
  ).length;

  const selectedRow = tickets.find((t) => t.id === selectedId) ?? null;

  if (ticketsQ.isLoading) return <DashboardSkeleton />;

  return (
    <div>
      <SectionHeader
        title="پشتیبانی"
        description="تیکت پشتیبانی و گزارش تخلف"
      />

      {ticketsQ.isError ? (
        <ErrorState title="خطا در دریافت تیکت‌ها" onRetry={() => ticketsQ.refetch()} />
      ) : null}

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3 md:mb-6">
        <GlassPanel title="باز">
          <p className="text-2xl font-bold text-amber-400">{openCount}</p>
        </GlassPanel>
        <GlassPanel title="کل">
          <p className="text-2xl font-bold">{tickets.length}</p>
        </GlassPanel>
        <GlassPanel title="جدید">
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="mt-1 rounded-xl bg-primary px-3 py-2 text-sm text-white"
          >
            ثبت تیکت
          </button>
        </GlassPanel>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 md:mb-6">
        {(
          [
            { key: "all", label: "همه" },
            { key: "open", label: "باز" },
            { key: "pending", label: "انتظار" },
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

      <GlassPanel title="گزارش تخلف" className="mt-4 md:mt-6">
        <form
          className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2"
          onSubmit={reportForm.handleSubmit((data) => {
            reportMut.mutate(data, {
              onSuccess: () => reportForm.reset(),
            });
          })}
        >
          <LabeledField label="نوع مورد گزارش">
            <select
              className="w-full rounded-xl border border-white/20 bg-transparent px-3 py-2 text-sm"
              {...reportForm.register("target_type")}
              onChange={(e) => {
                reportForm.setValue("target_type", e.target.value as "user" | "room" | "video" | "message");
                reportForm.setValue("target_id", "");
              }}
            >
              <option value="user">کاربر</option>
              <option value="room">اتاق تماشا</option>
              <option value="video">ویدیو</option>
              <option value="message">پیام در اتاق</option>
            </select>
          </LabeledField>

          {targetType === "user" ? (
            <LabeledField
              label="انتخاب کاربر"
              hint="کاربری که می‌خواهید گزارش دهید"
              error={reportForm.formState.errors.target_id?.message}
            >
              <select
                className="w-full rounded-xl border border-white/20 bg-transparent px-3 py-2 text-sm"
                {...reportForm.register("target_id")}
              >
                <option value="">— انتخاب کنید —</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.display_name ?? u.phone_number} ({u.phone_number})
                  </option>
                ))}
              </select>
            </LabeledField>
          ) : targetType === "room" ? (
            <LabeledField
              label="انتخاب اتاق"
              hint="اتاقی که تخلف در آن رخ داده"
              error={reportForm.formState.errors.target_id?.message}
            >
              <select
                className="w-full rounded-xl border border-white/20 bg-transparent px-3 py-2 text-sm"
                {...reportForm.register("target_id")}
              >
                <option value="">— انتخاب کنید —</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </LabeledField>
          ) : targetType === "video" ? (
            <LabeledField
              label="انتخاب ویدیو"
              hint="ویدیویی که محتوای نامناسب دارد"
              error={reportForm.formState.errors.target_id?.message}
            >
              <select
                className="w-full rounded-xl border border-white/20 bg-transparent px-3 py-2 text-sm"
                {...reportForm.register("target_id")}
              >
                <option value="">— انتخاب کنید —</option>
                {videos.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.title || v.id.slice(-8)}
                  </option>
                ))}
              </select>
            </LabeledField>
          ) : (
            <LabeledField
              label="شناسه پیام"
              hint="شناسه پیام را از تاریخچه چت اتاق کپی کنید"
              error={reportForm.formState.errors.target_id?.message}
            >
              <Input
                dir="ltr"
                className="border-white/20 bg-transparent"
                {...reportForm.register("target_id")}
              />
            </LabeledField>
          )}

          <LabeledField
            label="شرح گزارش"
            hint="دقیق توضیح دهید چه اتفاقی افتاده"
            error={reportForm.formState.errors.reason?.message}
            className="md:col-span-2"
          >
            <textarea
              className="w-full rounded-xl border border-white/20 bg-transparent px-3 py-2 text-sm"
              rows={3}
              {...reportForm.register("reason")}
            />
          </LabeledField>

          <button
            type="submit"
            disabled={reportMut.isPending}
            className="rounded-xl bg-red-600/80 px-4 py-2 text-sm text-white disabled:opacity-50 md:col-span-2"
          >
            {reportMut.isPending ? "در حال ارسال..." : "ارسال گزارش"}
          </button>
        </form>
      </GlassPanel>

      <GlassPanel title="تیکت‌های من" className="mt-4 md:mt-6">
        {filtered.length ? (
          <TicketsTable
            rows={filtered}
            onOpen={(id) => {
              setSelectedId(id);
              setDetailOpen(true);
            }}
          />
        ) : (
          <EmptyState title="تیکتی نیست" />
        )}
      </GlassPanel>

      <CreateTicketModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={(payload) => {
          createMut.mutate({
            subject: payload.subject,
            body: payload.message,
          });
        }}
      />
      <TicketDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        ticket={selectedRow}
        ticketId={selectedId}
        messages={detailQ.data?.messages}
        isLoading={detailQ.isLoading}
      />
    </div>
  );
}
