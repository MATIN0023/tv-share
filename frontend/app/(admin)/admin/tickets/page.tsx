"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AdminSectionHeader } from "@/components/admin/admin-section-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { PaginationBar } from "@/components/admin/pagination-bar";
import {
  useAdminTicket,
  useAdminTickets,
  useAdminReplyTicket,
  useAdminUpdateTicketStatus,
} from "@/hooks/use-admin";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { formatFaDate } from "@/lib/utils/format-date";
import { useTranslation } from "@/providers/i18n-provider";

function TicketsContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || "1");
  const status = searchParams.get("status") || "";
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");

  const settingsQ = usePublicSettings();
  const ticketsQ = useAdminTickets({ page, limit: 20, status: status || undefined });
  const detailQ = useAdminTicket(selectedId);
  const replyMut = useAdminReplyTicket();
  const statusMut = useAdminUpdateTicketStatus();

  const statusLabels = useMemo(
    () =>
      ({
        open: t("dashboard.open"),
        in_progress: t("adminPages.inReview"),
        closed: t("dashboard.closed"),
      }) as Record<string, string>,
    [t]
  );

  const tickets = ticketsQ.data?.items ?? [];
  const total = ticketsQ.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 20));
  const settings = settingsQ.data;

  return (
    <div>
      <AdminSectionHeader
        title={t("adminPages.ticketsTitle")}
        description={t("adminPages.ticketsDesc")}
      />

      {settings ? (
        <AdminPanel title={t("adminPages.contactFromSettings")} className="mb-4">
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <span className="text-zinc-500">{t("dashboard.emailPrefix")}</span>
              <span dir="ltr">{settings.support_email || t("common.dash")}</span>
            </div>
            <div>
              <span className="text-zinc-500">{t("dashboard.phonePrefix")}</span>
              <span dir="ltr">{settings.support_phone || t("common.dash")}</span>
            </div>
          </div>
        </AdminPanel>
      ) : null}

      <div className="mb-4 flex flex-wrap gap-2">
        {(["", "open", "in_progress", "closed"] as const).map((s) => (
          <a
            key={s || "all"}
            href={`/admin/tickets?${s ? `status=${s}&` : ""}page=1`}
            className={`rounded-xl border px-3 py-2 text-sm ${
              status === s ? "border-amber-500 text-amber-400" : "border-zinc-700 text-zinc-400"
            }`}
          >
            {s ? statusLabels[s] ?? s : t("common.all")}
          </a>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AdminPanel title={`${t("adminPages.ticketsCount")}${total})`}>
          <div className="space-y-2">
            {tickets.map((ticket) => (
              <button
                key={ticket.id}
                type="button"
                onClick={() => setSelectedId(ticket.id)}
                className={`w-full rounded-lg border px-3 py-2 text-right text-sm transition ${
                  selectedId === ticket.id
                    ? "border-amber-500/50 bg-amber-500/10"
                    : "border-zinc-800 hover:bg-zinc-900"
                }`}
              >
                <p className="font-medium">{ticket.subject}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {statusLabels[ticket.status] ?? ticket.status} · {formatFaDate(ticket.updated_at)}
                </p>
              </button>
            ))}
            {!tickets.length && !ticketsQ.isLoading ? (
              <p className="py-6 text-center text-zinc-500">{t("adminPages.noTickets")}</p>
            ) : null}
          </div>
          <PaginationBar page={page} totalPages={totalPages} total={total} />
        </AdminPanel>

        <AdminPanel title={t("adminPages.ticketDetails")}>
          {selectedId && detailQ.data ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">{detailQ.data.ticket.subject}</h3>
                <p className="text-xs text-zinc-500">
                  {t("adminPages.userPrefix")} {detailQ.data.ticket.user_id.slice(-8)} ·{" "}
                  {statusLabels[detailQ.data.ticket.status] ?? detailQ.data.ticket.status}
                </p>
              </div>

              <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-zinc-800 p-3">
                {(detailQ.data.messages ?? []).map((m) => (
                  <div
                    key={m.id}
                    className={`rounded-lg px-3 py-2 text-sm ${
                      m.is_staff ? "bg-amber-500/10" : "bg-zinc-900"
                    }`}
                  >
                    <p className="text-xs text-zinc-500">
                      {m.is_staff ? t("modals.support") : t("modals.you")} · {formatFaDate(m.created_at)}
                    </p>
                    <p className="mt-1">{m.body}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {(["open", "in_progress", "closed"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={statusMut.isPending}
                    onClick={() =>
                      statusMut.mutate({ id: selectedId, status: s })
                    }
                    className="rounded-lg border border-zinc-700 px-2 py-1 text-xs"
                  >
                    {statusLabels[s]}
                  </button>
                ))}
              </div>

              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={3}
                placeholder={t("adminPages.adminReplyPlaceholder")}
                className="w-full rounded-xl border border-zinc-700 bg-transparent px-3 py-2 text-sm"
              />
              <button
                type="button"
                disabled={!reply.trim() || replyMut.isPending}
                onClick={() => {
                  replyMut.mutate(
                    { id: selectedId, body: reply.trim() },
                    { onSuccess: () => setReply("") }
                  );
                }}
                className="rounded-xl bg-amber-600 px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {t("modals.sendReply")}
              </button>
            </div>
          ) : (
            <p className="py-8 text-center text-zinc-500">{t("adminPages.selectTicket")}</p>
          )}
        </AdminPanel>
      </div>
    </div>
  );
}

export default function AdminTicketsPage() {
  return (
    <Suspense>
      <TicketsContent />
    </Suspense>
  );
}
