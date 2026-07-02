"use client";

import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Upload } from "lucide-react";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { SectionHeader } from "@/components/dashboard/section-header";
import { QueryError } from "@/components/dashboard/shared/query-error";
import { showAppError } from "@/lib/toast";
import { DashboardSkeleton } from "@/components/dashboard/shared/skeleton";
import { ShareInviteModal } from "@/components/dashboard/modals/share-invite-modal";
import {
  FloatingReactions,
  REACTION_EMOJIS,
  type FloatingReaction,
} from "@/components/room/floating-reactions";
import {
  RoomChatDrawer,
  RoomChatPanel,
  type ChatItem,
} from "@/components/room/room-chat-panel";
import { WatchPlayer } from "@/components/room/watch-player";
import { useMe } from "@/hooks/use-me";
import {
  useCreateInvitation,
  usePauseRoom,
  usePlayRoom,
  useRoom,
  useRoomMessages,
  useSeekRoom,
  useUpdateRoomVideo,
} from "@/hooks/use-rooms";
import { useRoomWebSocket } from "@/hooks/use-room-ws";
import { validateSrt, type SubtitleCue } from "@/lib/subtitles/parse-srt";
import { toast } from "@/lib/toast";
import { formatFaDate } from "@/lib/utils/format-date";
import type { WsMessage } from "@/lib/api/types";
import { useTranslation } from "@/providers/i18n-provider";

let reactionSeq = 0;

export default function RoomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { t } = useTranslation();
  const router = useRouter();
  const { data: me } = useMe();
  const roomQ = useRoom(id);
  const messagesQ = useRoomMessages(id);
  const playMut = usePlayRoom();
  const pauseMut = usePauseRoom();
  const seekMut = useSeekRoom();
  const videoMut = useUpdateRoomVideo();
  const inviteMut = useCreateInvitation();

  const [liveMessages, setLiveMessages] = useState<ChatItem[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);
  const [subtitles, setSubtitles] = useState<SubtitleCue[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [inviteExpires, setInviteExpires] = useState<string | undefined>();
  const [playback, setPlayback] = useState({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
  });
  const seekThrottle = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLiveMessages([]);
    setReactions([]);
    setChatInput("");
    setSubtitles([]);
  }, [id]);

  const pushReaction = useCallback((emoji: string) => {
    const rid = `r-${++reactionSeq}`;
    setReactions((prev) => [
      ...prev.slice(-40),
      { id: rid, emoji, x: 15 + Math.random() * 70 },
    ]);
  }, []);

  const handleWsMessage = useCallback(
    (msg: WsMessage) => {
      if (msg.type === "room_closed") {
        toast.error(t("room.closedByAdmin"));
        router.replace("/rooms");
        return;
      }
      if (msg.type === "chat" && msg.text) {
        const text = msg.text;
        setLiveMessages((prev) => [
          ...prev.slice(-199),
          {
            id: `ws-${Date.now()}-${Math.random()}`,
            from: msg.from ?? t("dashboard.userFallback"),
            text,
            time: msg.time,
          },
        ]);
      }
      if (msg.type === "reaction" && msg.emoji) {
        pushReaction(msg.emoji);
      }
      if (msg.type === "room_state") {
        setPlayback({
          isPlaying: Boolean(msg.is_playing ?? msg.room_info?.is_playing),
          currentTime: msg.current_time ?? msg.room_info?.current_time ?? 0,
          duration: msg.duration ?? msg.room_info?.duration ?? 0,
        });
      }
      if (msg.type === "video_change" && msg.video) {
        roomQ.refetch();
      }
    },
    [pushReaction, roomQ, router, t]
  );

  const { connected, sendChat, sendReaction } = useRoomWebSocket({
    roomId: id,
    enabled: Boolean(me?.id),
    onMessage: handleWsMessage,
  });

  const isOwner = me?.id === roomQ.data?.owner_id;

  const historyMessages = useMemo<ChatItem[]>(
    () =>
      (messagesQ.data ?? []).map((m) => ({
        id: m.id,
        from: m.sender_name,
        text: m.content,
        time: formatFaDate(m.timestamp),
      })),
    [messagesQ.data]
  );

  const allMessages = useMemo(() => {
    const seen = new Set(historyMessages.map((m) => m.id));
    const merged = [...historyMessages];
    for (const m of liveMessages) {
      if (!seen.has(m.id)) merged.push(m);
    }
    return merged;
  }, [historyMessages, liveMessages]);

  const handleSubtitleFile = async (file: File) => {
    const text = await file.text();
    const { cues, errors } = validateSrt(text, file.size);
    if (errors.length) {
      toast.error(errors[0] ?? t("room.invalidSubtitleFile"));
      return;
    }
    if (!cues.length) {
      toast.error(t("room.noValidSubtitles"));
      return;
    }
    setSubtitles(cues);
    toast.success(t("room.subtitlesLoaded", { count: cues.length }));
  };

  const handleSeek = (time: number) => {
    if (!isOwner) return;
    if (seekThrottle.current) clearTimeout(seekThrottle.current);
    seekThrottle.current = setTimeout(() => {
      seekMut.mutate({ id, position: time });
    }, 300);
  };

  const openInvite = async () => {
    try {
      const res = await inviteMut.mutateAsync(id);
      setInviteCode(res.code);
      setInviteExpires(res.expires);
      setInviteOpen(true);
    } catch {
      toast.error(t("room.inviteCreateFailed"));
    }
  };

  if (roomQ.isLoading) return <DashboardSkeleton />;
  if (roomQ.isError || !roomQ.data) {
    return (
      <QueryError
        error={roomQ.error}
        context="rooms.detail"
        onRetry={() => roomQ.refetch()}
      />
    );
  }

  const room = roomQ.data;
  const playerPlayback = {
    isPlaying: playback.isPlaying || Boolean(room.is_playing),
    currentTime: playback.currentTime || room.current_time || 0,
    duration: playback.duration || room.duration || 0,
  };

  const chatPanelProps = {
    messages: allMessages,
    input: chatInput,
    onInputChange: setChatInput,
    onSend: () => {
      if (!chatInput.trim()) return;
      sendChat(chatInput.trim());
      setChatInput("");
    },
    connected,
    onReaction: (emoji: string) => {
      sendReaction(emoji);
      pushReaction(emoji);
    },
    reactionEmojis: REACTION_EMOJIS,
  };

  return (
    <div className="flex min-h-0 flex-col">
      <SectionHeader
        title={room.name}
        description={`${room.visibility === "public" ? t("dashboard.public") : t("dashboard.private")} · ${
          connected ? t("room.online") : t("room.connectingShort")
        }${isOwner ? t("room.youAreOwner") : ""}`}
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Link href="/rooms" className="text-sm text-primary hover:underline">
          {t("room.backToList")}
        </Link>
        {isOwner ? (
          <>
            <button
              type="button"
              onClick={() => void openInvite()}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-3 py-1.5 text-xs hover:bg-white/5"
            >
              <Copy className="size-3.5" />
              {t("room.shareInviteCode")}
            </button>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/15 px-3 py-1.5 text-xs hover:bg-white/5">
              <Upload className="size-3.5" />
              {t("room.loadSubtitles")}
              <input
                type="file"
                accept=".srt,text/plain"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleSubtitleFile(f);
                  e.target.value = "";
                }}
              />
            </label>
          </>
        ) : null}
      </div>

      {isOwner && !room.video_path ? (
        <GlassPanel title={t("room.step1Video")} className="mb-4">
          <p className="mb-3 text-sm text-muted-foreground">
            {t("room.step1VideoDesc")}
          </p>
          <div className="flex flex-wrap gap-2">
            <input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://example.com/video.mp4"
              dir="ltr"
              className="min-w-[16rem] flex-1 rounded-xl border border-white/15 bg-transparent px-3 py-2 text-sm"
            />
            <button
              type="button"
              disabled={!videoUrl.trim() || videoMut.isPending}
              onClick={() => {
                videoMut.mutate(
                  { id, videoUrl: videoUrl.trim() },
                  {
                    onSuccess: () => {
                      toast.success(t("room.videoConfigured"));
                      setVideoUrl("");
                    },
                    onError: () => toast.error(t("room.videoConfigureFailed")),
                  }
                );
              }}
              className="rounded-xl bg-primary px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {videoMut.isPending ? t("room.saving") : t("room.saveVideo")}
            </button>
          </div>
        </GlassPanel>
      ) : null}

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
        <GlassPanel title={t("room.play")} className="min-h-0 p-3 lg:p-4">
          <WatchPlayer
            src={room.video_path}
            isOwner={isOwner}
            playback={playerPlayback}
            subtitles={subtitles}
            onPlay={() => playMut.mutate(id)}
            onPause={() => pauseMut.mutate(id)}
            onSeek={handleSeek}
            onToggleChat={() => setChatDrawerOpen(true)}
            chatOpen={chatDrawerOpen}
            reactionOverlay={
              <FloatingReactions
                reactions={reactions}
                onDone={(rid) =>
                  setReactions((prev) => prev.filter((r) => r.id !== rid))
                }
              />
            }
          />
        </GlassPanel>

        <GlassPanel title={t("room.chat")} className="hidden min-h-[28rem] lg:flex lg:flex-col">
          <RoomChatPanel {...chatPanelProps} className="flex-1" />
        </GlassPanel>
      </div>

      <RoomChatDrawer
        {...chatPanelProps}
        open={chatDrawerOpen}
        onClose={() => setChatDrawerOpen(false)}
      />

      <ShareInviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        roomId={id}
        code={inviteCode}
        expires={inviteExpires}
      />
    </div>
  );
}
