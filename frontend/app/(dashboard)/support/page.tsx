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
import { QueryError } from "@/components/dashboard/shared/query-error";
import { DashboardSkeleton } from "@/components/dashboard/shared/skeleton";
import {
  useCreateTicket,
  useTicket,
  useTickets,
} from "@/hooks/use-tickets";
import { useCreateReport } from "@/hooks/use-reports";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { useUsers } from "@/hooks/use-friends";
import { useRooms } from "@/hooks/use-rooms";
import { useVideos } from "@/hooks/use-videos";
import { createAdminSchemas } from "@/lib/validations/create-admin-schemas";
import { formatFaDate } from "@/lib/utils/format-date";
import { targetTypeLabel } from "@/lib/activity-labels";
import { useTranslation } from "@/providers/i18n-provider";

const REPORT_TARGET_TYPES = ["user", "room", "video", "message"] as const;

export default function SupportPage() {
  const { t } = useTranslation();
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<"all" | TicketStatus>("all");

  const ticketsQ = useTickets();
  const settingsQ = usePublicSettings();
  const createMut = useCreateTicket();
  const reportMut = useCreateReport();
  const detailQ = useTicket(selectedId);
  const usersQ = useUsers();
  const roomsQ = useRooms();
  const videosQ = useVideos();

  const { userReportSchema } = useMemo(() => createAdminSchemas(t), [t]);

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
        title={t("dashboard.supportTitle")}
        description={t("dashboard.supportPageDesc")}
      />

      {settingsQ.data ? (
        <GlassPanel title={t("dashboard.contactMethods")} className="mb-4">
          <div className="mt-2 flex flex-wrap gap-6 text-sm">
            {settingsQ.data.support_email ? (
              <div>
                <span className="text-muted-foreground">{t("dashboard.emailPrefix")}</span>
                <a
                  href={`mailto:${settingsQ.data.support_email}`}
                  className="text-primary"
                  dir="ltr"
                >
                  {settingsQ.data.support_email}
                </a>
              </div>
            ) : null}
            {settingsQ.data.support_phone ? (
              <div>
                <span className="text-muted-foreground">{t("dashboard.phonePrefix")}</span>
                <span dir="ltr">{settingsQ.data.support_phone}</span>
              </div>
            ) : null}
            {!settingsQ.data.support_email && !settingsQ.data.support_phone ? (
              <p className="text-muted-foreground">
                {t("dashboard.contactNotConfigured")}
              </p>
            ) : null}
          </div>
        </GlassPanel>
      ) : null}

      {ticketsQ.isError ? (
        <QueryError
          error={ticketsQ.error}
          context="tickets.load"
          onRetry={() => ticketsQ.refetch()}
        />
      ) : null}

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3 md:mb-6">
        <GlassPanel title={t("dashboard.open")}>
          <p className="text-2xl font-bold text-amber-400">{openCount}</p>
        </GlassPanel>
        <GlassPanel title={t("dashboard.total")}>
          <p className="text-2xl font-bold">{tickets.length}</p>
        </GlassPanel>
        <GlassPanel title={t("dashboard.new")}>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="mt-1 rounded-xl bg-primary px-3 py-2 text-sm text-white"
          >
            {t("dashboard.createTicket")}
          </button>
        </GlassPanel>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 md:mb-6">
        {(
          [
            { key: "all", label: t("common.all") },
            { key: "open", label: t("dashboard.open") },
            { key: "pending", label: t("dashboard.waiting") },
            { key: "resolved", label: t("dashboard.resolved") },
            { key: "closed", label: t("dashboard.closed") },
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

      <GlassPanel title={t("dashboard.reportViolation")} className="mt-4 md:mt-6">
        <form
          className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2"
          onSubmit={reportForm.handleSubmit((data) => {
            reportMut.mutate(data, {
              onSuccess: () => reportForm.reset(),
            });
          })}
        >
          <LabeledField label={t("dashboard.reportTargetType")}>
            <select
              className="w-full rounded-xl border border-white/20 bg-transparent px-3 py-2 text-sm"
              {...reportForm.register("target_type")}
              onChange={(e) => {
                reportForm.setValue("target_type", e.target.value as "user" | "room" | "video" | "message");
                reportForm.setValue("target_id", "");
              }}
            >
              {REPORT_TARGET_TYPES.map((type) => (
                <option key={type} value={type}>
                  {targetTypeLabel(t, type)}
                </option>
              ))}
            </select>
          </LabeledField>

          {targetType === "user" ? (
            <LabeledField
              label={t("dashboard.selectUserReport")}
              hint={t("dashboard.selectUserReportHint")}
              error={reportForm.formState.errors.target_id?.message}
            >
              <select
                className="w-full rounded-xl border border-white/20 bg-transparent px-3 py-2 text-sm"
                {...reportForm.register("target_id")}
              >
                <option value="">{t("dashboard.selectPlaceholder")}</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.display_name ?? u.phone_number} ({u.phone_number})
                  </option>
                ))}
              </select>
            </LabeledField>
          ) : targetType === "room" ? (
            <LabeledField
              label={t("dashboard.selectRoom")}
              hint={t("dashboard.selectRoomHint")}
              error={reportForm.formState.errors.target_id?.message}
            >
              <select
                className="w-full rounded-xl border border-white/20 bg-transparent px-3 py-2 text-sm"
                {...reportForm.register("target_id")}
              >
                <option value="">{t("dashboard.selectPlaceholder")}</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </LabeledField>
          ) : targetType === "video" ? (
            <LabeledField
              label={t("dashboard.selectVideo")}
              hint={t("dashboard.selectVideoHint")}
              error={reportForm.formState.errors.target_id?.message}
            >
              <select
                className="w-full rounded-xl border border-white/20 bg-transparent px-3 py-2 text-sm"
                {...reportForm.register("target_id")}
              >
                <option value="">{t("dashboard.selectPlaceholder")}</option>
                {videos.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.title || v.id.slice(-8)}
                  </option>
                ))}
              </select>
            </LabeledField>
          ) : (
            <LabeledField
              label={t("dashboard.messageId")}
              hint={t("dashboard.messageIdHint")}
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
            label={t("dashboard.reportDescription")}
            hint={t("dashboard.reportDescriptionHint")}
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
            {reportMut.isPending ? t("dashboard.sending") : t("dashboard.submitReport")}
          </button>
        </form>
      </GlassPanel>

      <GlassPanel title={t("dashboard.myTickets")} className="mt-4 md:mt-6">
        {filtered.length ? (
          <TicketsTable
            rows={filtered}
            onOpen={(id) => {
              setSelectedId(id);
              setDetailOpen(true);
            }}
          />
        ) : (
          <EmptyState title={t("dashboard.noTicketsShort")} />
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
