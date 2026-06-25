"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { SectionHeader } from "@/components/dashboard/section-header";
import { ErrorState } from "@/components/dashboard/shared/error-state";
import { DashboardSkeleton } from "@/components/dashboard/shared/skeleton";
import { useMe } from "@/hooks/use-me";
import {
  usePauseRoom,
  usePlayRoom,
  useRoom,
  useRoomMessages,
} from "@/hooks/use-rooms";
import { useRoomWebSocket } from "@/hooks/use-room-ws";
import { formatFaDate } from "@/lib/utils/format-date";
import type { WsMessage } from "@/lib/api/types";

export default function RoomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: me } = useMe();
  const roomQ = useRoom(id);
  const messagesQ = useRoomMessages(id);
  const playMut = usePlayRoom();
  const pauseMut = usePauseRoom();
  const [chatLog, setChatLog] = useState<WsMessage[]>([]);
  const [chatInput, setChatInput] = useState("");

  const { connected, sendChat } = useRoomWebSocket({
    roomId: id,
    userId: me?.id ?? "",
    enabled: Boolean(me?.id),
    onMessage: (msg) => {
      if (msg.type === "chat" || msg.type === "room_state") {
        setChatLog((prev) => [...prev.slice(-49), msg]);
      }
    },
  });

  const isOwner = me?.id === roomQ.data?.owner_id;

  const allMessages = useMemo(() => {
    const rest = (messagesQ.data ?? []).map((m) => ({
      type: "chat" as const,
      text: m.content,
      from: m.sender_name,
      time: formatFaDate(m.timestamp),
    }));
    return [...rest, ...chatLog.filter((m) => m.type === "chat")];
  }, [messagesQ.data, chatLog]);

  if (roomQ.isLoading) return <DashboardSkeleton />;
  if (roomQ.isError || !roomQ.data) {
    return (
      <ErrorState
        title="اتاق یافت نشد"
        onRetry={() => roomQ.refetch()}
      />
    );
  }

  const room = roomQ.data;

  return (
    <div>
      <SectionHeader
        title={room.name}
        description={`اتاق · ${room.visibility} · WebSocket ${connected ? "متصل" : "قطع"}`}
      />

      <div className="mb-4">
        <Link href="/rooms" className="text-sm text-primary hover:underline">
          ← بازگشت به لیست
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassPanel title="پخش" className="lg:col-span-2">
          {room.video_path ? (
            <video
              src={room.video_path}
              controls
              className="mt-3 w-full rounded-xl"
            />
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              ویدیویی تنظیم نشده — PUT /api/rooms/{"{id}"}/video
            </p>
          )}
          {isOwner ? (
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => playMut.mutate(id)}
                className="rounded-xl bg-primary px-3 py-2 text-sm text-white"
              >
                Play API
              </button>
              <button
                type="button"
                onClick={() => pauseMut.mutate(id)}
                className="rounded-xl border border-white/20 px-3 py-2 text-sm"
              >
                Pause API
              </button>
            </div>
          ) : null}
          <p className="mt-2 text-xs text-muted-foreground">
            وضعیت: {room.is_playing ? "در حال پخش" : "متوقف"} · WS: /ws
          </p>
        </GlassPanel>

        <GlassPanel title="چت اتاق">
          <div className="mt-3 max-h-64 space-y-2 overflow-y-auto text-sm">
            {allMessages.length ? (
              allMessages.map((m, i) => (
                <div key={i} className="rounded-lg border border-white/10 px-2 py-1">
                  <span className="text-primary">{m.from ?? "—"}</span>: {m.text}
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">پیامی نیست</p>
            )}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="پیام..."
              className="flex-1 rounded-lg border border-input bg-transparent px-2 py-1 text-sm"
            />
            <button
              type="button"
              onClick={() => {
                if (chatInput.trim()) {
                  sendChat(chatInput.trim());
                  setChatInput("");
                }
              }}
              className="rounded-lg bg-primary px-3 py-1 text-sm text-white"
            >
              ارسال
            </button>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
