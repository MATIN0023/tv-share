"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { SectionHeader } from "@/components/dashboard/section-header";
import { Users, Wifi, Plus } from "lucide-react";
import { RoomsTable } from "@/components/dashboard/tables/rooms-table";
import { CreateRoomModal } from "@/components/dashboard/modals/create-room-modal";
import { JoinRoomModal } from "@/components/dashboard/modals/join-room-modal";
import { EmptyState } from "@/components/dashboard/shared/empty-state";
import { ErrorState } from "@/components/dashboard/shared/error-state";
import { DashboardSkeleton } from "@/components/dashboard/shared/skeleton";
import { useAcceptInvitation, useCreateRoom, useRooms } from "@/hooks/use-rooms";
import { ApiError } from "@/lib/api";
import { formatFaDate } from "@/lib/utils/format-date";

export default function RoomsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const router = useRouter();

  const { data: rooms, isLoading, isError, refetch } = useRooms();
  const createRoom = useCreateRoom();
  const acceptInvite = useAcceptInvitation();

  const rows = useMemo(
    () =>
      (rooms ?? []).map((room) => ({
        id: room.id,
        name: room.name,
        members: "—",
        status: room.is_playing ? "Active" : room.status ?? "—",
        startAt: room.created_at ? formatFaDate(room.created_at) : "—",
      })),
    [rooms]
  );

  return (
    <div>
      <SectionHeader
        title="روم‌ها / واچ پارتی"
        description="ساخت، پیوستن با کد دعوت و مدیریت اتاق‌ها"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassPanel title="ساخت روم">
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="mt-3 inline-flex items-center gap-2 rounded-xl liquid-glass px-3 py-2 text-sm"
          >
            <Plus className="size-4" />
            ایجاد واچ‌پارتی
          </button>
          <button
            type="button"
            onClick={() => {
              setJoinError(null);
              setJoinOpen(true);
            }}
            className="mt-2 inline-flex rounded-xl border border-white/20 px-3 py-2 text-sm"
          >
            پیوستن با کد
          </button>
        </GlassPanel>

        <GlassPanel title="اتاق‌های ثبت‌شده">
          <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-500">
            <Wifi className="size-4" />
            {rooms?.length ?? 0} اتاق
          </div>
        </GlassPanel>

        <GlassPanel title="در حال پخش">
          <div className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="size-4" />
            فعال: {rooms?.filter((r) => r.is_playing).length ?? 0}
          </div>
        </GlassPanel>
      </div>

      <div className="mt-4 md:mt-6">
        <GlassPanel title="لیست روم‌ها">
          <div className="mt-3">
            {isLoading ? <DashboardSkeleton /> : null}
            {isError ? (
              <ErrorState
                title="خطا در دریافت اتاق‌ها"
                onRetry={() => refetch()}
              />
            ) : null}
            {!isLoading && !isError && rows.length ? <RoomsTable rows={rows} /> : null}
            {!isLoading && !isError && !rows.length ? (
              <EmptyState title="اتاقی وجود ندارد" />
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
          router.push(`/rooms/${room.id}`);
        }}
      />
      <JoinRoomModal
        open={joinOpen}
        onClose={() => setJoinOpen(false)}
        isSubmitting={acceptInvite.isPending}
        error={joinError}
        onSubmit={async (code) => {
          try {
            const res = await acceptInvite.mutateAsync(code);
            setJoinOpen(false);
            router.push(`/rooms/${res.room_id}`);
          } catch (e) {
            setJoinError(
              e instanceof ApiError ? e.message : "کد دعوت نامعتبر است"
            );
          }
        }}
      />
    </div>
  );
}
