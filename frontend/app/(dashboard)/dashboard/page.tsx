"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { SectionHeader } from "@/components/dashboard/section-header";
import { LabeledField } from "@/components/admin/labeled-field";
import { Clock3, Film, Users, Video } from "lucide-react";
import { StatCard } from "@/components/dashboard/shared/stat-card";
import { ContinueWatchingCard } from "@/components/dashboard/cards/continue-watching-card";
import { LiveRoomCard } from "@/components/dashboard/cards/live-room-card";
import { CreateRoomModal } from "@/components/dashboard/modals/create-room-modal";
import { UploadVideoModal } from "@/components/dashboard/modals/upload-video-modal";
import { ConfirmActionModal } from "@/components/dashboard/modals/confirm-action-modal";
import { Input } from "@/components/ui/input";
import { DashboardSkeleton } from "@/components/dashboard/shared/skeleton";
import { useFeed, useWatchHistory } from "@/hooks/use-feed";
import { useFriends, useSendFriendRequest, useUsers } from "@/hooks/use-friends";
import { useNotifications } from "@/hooks/use-notifications";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { useCreateRoom, useRooms } from "@/hooks/use-rooms";
import { useUploadVideo, useVideos } from "@/hooks/use-videos";
import { formatFaNumber } from "@/lib/utils/format-date";
import { toast } from "@/lib/toast";

export default function DashboardPage() {
  const [createRoomOpen, setCreateRoomOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteUserId, setInviteUserId] = useState("");

  const router = useRouter();
  const { data: settings } = usePublicSettings();
  const roomsQ = useRooms();
  const friendsQ = useFriends();
  const usersQ = useUsers();
  const videosQ = useVideos();
  const historyQ = useWatchHistory();
  const feedQ = useFeed();
  const notificationsQ = useNotifications();
  const createRoom = useCreateRoom();
  const uploadMut = useUploadVideo();
  const sendFriend = useSendFriendRequest();

  const canCreateRoom = settings?.maintenance_mode !== true;
  const canUpload = settings?.maintenance_mode !== true;
  const maxUploadMb = settings?.max_upload_size_mb ?? 500;

  const activeRooms = roomsQ.data?.filter((r) => r.is_playing).length ?? 0;
  const users = usersQ.data?.users ?? [];

  const stats = useMemo(
    () => [
      {
        title: "اتاق‌های فعال",
        value: formatFaNumber(activeRooms),
        change: `${formatFaNumber(roomsQ.data?.length ?? 0)} اتاق کل`,
        icon: Users,
      },
      {
        title: "دوستان",
        value: formatFaNumber(friendsQ.data?.friends.length ?? 0),
        change: "لیست دوستان",
        icon: Clock3,
      },
      {
        title: "ویدیوها",
        value: formatFaNumber(videosQ.data?.videos.length ?? 0),
        change: "کتابخانه شخصی",
        icon: Film,
      },
    ],
    [activeRooms, roomsQ.data, friendsQ.data, videosQ.data]
  );

  const continueWatching = (historyQ.data ?? []).slice(0, 2).map((h) => ({
    title: h.room_name || "تماشا",
    progress:
      h.duration > 0 ? Math.round((h.last_position / h.duration) * 100) : 0,
  }));

  const liveFeed = (feedQ.data ?? []).slice(0, 2);
  const activities = (notificationsQ.data?.notifications ?? [])
    .slice(0, 4)
    .map((n) => `${n.title}: ${n.body}`);

  const loading =
    roomsQ.isLoading ||
    friendsQ.isLoading ||
    videosQ.isLoading ||
    historyQ.isLoading;

  if (loading) return <DashboardSkeleton />;

  return (
    <div>
      <SectionHeader
        title="نمای کلی"
        description={
          settings?.site_name
            ? `خوش آمدید به ${settings.site_name}`
            : "آمار اتاق‌ها، دوستان و ویدیوهای شما"
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 md:mb-6">
        {stats.map((item) => (
          <StatCard
            key={item.title}
            title={item.title}
            value={item.value}
            hint={item.change}
            icon={item.icon}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <GlassPanel title="ادامه تماشا" className="xl:col-span-2">
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {continueWatching.length ? (
              continueWatching.map((c) => (
                <ContinueWatchingCard
                  key={c.title}
                  title={c.title}
                  progress={c.progress}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">تاریخچه‌ای ثبت نشده</p>
            )}
          </div>
        </GlassPanel>

        <GlassPanel title="اقدام سریع">
          <div className="mt-3 space-y-2">
            <button
              type="button"
              disabled={!canCreateRoom}
              onClick={() => setCreateRoomOpen(true)}
              className="w-full rounded-xl border border-white/20 px-3 py-2 text-sm disabled:opacity-40"
            >
              ساخت اتاق تماشا
            </button>
            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              className="w-full rounded-xl border border-white/20 px-3 py-2 text-sm"
            >
              درخواست دوستی
            </button>
            <button
              type="button"
              disabled={!canUpload}
              onClick={() => setUploadOpen(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm text-white disabled:opacity-40"
            >
              <Video className="size-4" />
              آپلود ویدیو
            </button>
            {!canCreateRoom || !canUpload ? (
              <p className="text-xs text-amber-400">
                برخی اقدامات به‌دلیل حالت تعمیرات غیرفعال شده‌اند.
              </p>
            ) : null}
          </div>
        </GlassPanel>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2 md:mt-6">
        <GlassPanel title="فید عمومی">
          <div className="mt-3 space-y-2">
            {liveFeed.length ? (
              liveFeed.map((f) => (
                <LiveRoomCard
                  key={f.room_id}
                  roomName={f.room_name}
                  friendName={f.owner_name}
                  viewers="—"
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">اتاق عمومی فعالی نیست</p>
            )}
          </div>
        </GlassPanel>
        <GlassPanel title="اعلان‌های اخیر">
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {activities.length ? (
              activities.map((activity) => (
                <li key={activity} className="rounded-xl border border-white/10 px-3 py-2">
                  {activity}
                </li>
              ))
            ) : (
              <li className="rounded-xl border border-white/10 px-3 py-2">
                اعلانی نیست
              </li>
            )}
          </ul>
        </GlassPanel>
      </div>

      <CreateRoomModal
        open={createRoomOpen}
        onClose={() => setCreateRoomOpen(false)}
        isSubmitting={createRoom.isPending}
        onSubmit={async (payload) => {
          const room = await createRoom.mutateAsync({
            name: payload.name,
            visibility: payload.visibility,
          });
          router.push(`/rooms/${room.id}`);
        }}
      />
      <UploadVideoModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        isSubmitting={uploadMut.isPending}
        onSubmit={async (p) => {
          await uploadMut.mutateAsync(p);
        }}
        maxSizeMb={maxUploadMb}
      />
      <ConfirmActionModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="درخواست دوستی"
        description="کاربری را از لیست انتخاب کنید"
        confirmLabel="ارسال"
        onConfirm={() => {
          if (!inviteUserId.trim()) {
            toast.error("لطفاً یک کاربر انتخاب کنید");
            return;
          }
          sendFriend.mutate(inviteUserId.trim());
          setInviteOpen(false);
        }}
      >
        <LabeledField label="کاربر" hint="از بین کاربران ثبت‌شده در سامانه">
          <select
            className="mt-2 w-full rounded-xl border border-white/20 bg-transparent px-3 py-2 text-sm"
            value={inviteUserId}
            onChange={(e) => setInviteUserId(e.target.value)}
          >
            <option value="">— انتخاب کنید —</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.display_name ?? u.phone_number}
              </option>
            ))}
          </select>
        </LabeledField>
      </ConfirmActionModal>
    </div>
  );
}
