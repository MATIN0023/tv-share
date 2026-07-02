"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { SectionHeader } from "@/components/dashboard/section-header";
import { Users, Wifi, Plus } from "lucide-react";
import { RoomsTable } from "@/components/dashboard/tables/rooms-table";
import { CreateRoomModal } from "@/components/dashboard/modals/create-room-modal";
import { JoinRoomModal } from "@/components/dashboard/modals/join-room-modal";
import { ShareInviteModal } from "@/components/dashboard/modals/share-invite-modal";
import { EmptyState } from "@/components/dashboard/shared/empty-state";
import { QueryError } from "@/components/dashboard/shared/query-error";
import { DashboardSkeleton } from "@/components/dashboard/shared/skeleton";
import { useAcceptInvitation, useCreateRoom, useRooms } from "@/hooks/use-rooms";
import { formatFaDate } from "@/lib/utils/format-date";
import { useTranslation } from "@/providers/i18n-provider";

export default function RoomsPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <RoomsPageContent />
    </Suspense>
  );
}

function RoomsPageContent() {
  const { t } = useTranslation();
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinError, setJoinError] = useState<unknown>(null);
  const [inviteInfo, setInviteInfo] = useState<{
    roomId: string;
    code: string;
    expires?: string;
  } | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const joinFromUrl = searchParams.get("join") ?? "";

  const { data: rooms, isLoading, isError, error, refetch } = useRooms();
  const createRoom = useCreateRoom();
  const acceptInvite = useAcceptInvitation();

  useEffect(() => {
    if (joinFromUrl) {
      setJoinError(null);
      setJoinOpen(true);
    }
  }, [joinFromUrl]);

  const rows = useMemo(
    () =>
      (rooms ?? []).map((room) => ({
        id: room.id,
        name: room.name,
        members: t("common.dash"),
        status: room.is_playing ? "Active" : room.status ?? t("common.dash"),
        startAt: room.created_at ? formatFaDate(room.created_at) : t("common.dash"),
      })),
    [rooms, t]
  );

  return (
    <div>
      <SectionHeader
        title={t("dashboard.roomsPageTitle")}
        description={t("dashboard.roomsPageDesc")}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassPanel title={t("dashboard.createRoomPanel")}>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="mt-3 inline-flex items-center gap-2 rounded-xl liquid-glass px-3 py-2 text-sm"
          >
            <Plus className="size-4" />
            {t("dashboard.createWatchParty")}
          </button>
          <button
            type="button"
            onClick={() => {
              setJoinError(null);
              setJoinOpen(true);
            }}
            className="mt-2 inline-flex rounded-xl border border-white/20 px-3 py-2 text-sm"
          >
            {t("dashboard.joinWithCode")}
          </button>
        </GlassPanel>

        <GlassPanel title={t("dashboard.registeredRooms")}>
          <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-500">
            <Wifi className="size-4" />
            {t("dashboard.roomCount", { count: rooms?.length ?? 0 })}
          </div>
        </GlassPanel>

        <GlassPanel title={t("dashboard.nowPlaying")}>
          <div className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="size-4" />
            {t("dashboard.activeCount", {
              count: rooms?.filter((r) => r.is_playing).length ?? 0,
            })}
          </div>
        </GlassPanel>
      </div>

      <div className="mt-4 md:mt-6">
        <GlassPanel title={t("dashboard.roomsList")}>
          <div className="mt-3">
            {isLoading ? <DashboardSkeleton /> : null}
            {isError ? (
              <QueryError error={error} context="rooms.load" onRetry={() => refetch()} />
            ) : null}
            {!isLoading && !isError && rows.length ? <RoomsTable rows={rows} /> : null}
            {!isLoading && !isError && !rows.length ? (
              <EmptyState title={t("dashboard.noRooms")} />
            ) : null}
          </div>
        </GlassPanel>
      </div>

      <CreateRoomModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        isSubmitting={createRoom.isPending}
        onSubmit={async (payload) => {
          const room = await createRoom.mutateAsync({
            name: payload.name,
            visibility: payload.visibility,
          });
          setCreateOpen(false);
          if (room.invite_code) {
            setInviteInfo({
              roomId: room.id,
              code: room.invite_code,
              expires: room.invite_expires,
            });
          } else {
            router.push(`/rooms/${room.id}`);
          }
        }}
      />

      <ShareInviteModal
        open={!!inviteInfo}
        onClose={() => setInviteInfo(null)}
        roomId={inviteInfo?.roomId ?? ""}
        code={inviteInfo?.code ?? ""}
        expires={inviteInfo?.expires}
        onEnterRoom={() => {
          if (inviteInfo) router.push(`/rooms/${inviteInfo.roomId}`);
        }}
      />

      <JoinRoomModal
        open={joinOpen}
        onClose={() => setJoinOpen(false)}
        isSubmitting={acceptInvite.isPending}
        error={joinError}
        initialCode={joinFromUrl}
        onSubmit={async (code) => {
          try {
            const res = await acceptInvite.mutateAsync(code);
            setJoinOpen(false);
            router.push(`/rooms/${res.room_id}`);
          } catch (e) {
            setJoinError(e);
          }
        }}
      />
    </div>
  );
}
