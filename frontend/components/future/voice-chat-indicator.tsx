"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Headphones,
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/providers/i18n-provider";
import type { VoiceChatParticipant } from "./types";

const MOCK_PARTICIPANTS: VoiceChatParticipant[] = [
  { id: "1", name: "شما", isSpeaking: false, isMuted: false, level: 0 },
  { id: "2", name: "سارا", isSpeaking: true, isMuted: false, level: 72 },
  { id: "3", name: "علی", isSpeaking: false, isMuted: true, level: 0 },
  { id: "4", name: "مریم", isSpeaking: true, isMuted: false, level: 45 },
];

function VoiceLevelBars({
  level,
  active,
  className,
}: {
  level: number;
  active: boolean;
  className?: string;
}) {
  const bars = [0.35, 0.6, 0.85, 1, 0.7, 0.5, 0.3];
  return (
    <div className={cn("flex items-end gap-0.5", className)}>
      {bars.map((scale, i) => {
        const h = active
          ? Math.max(4, Math.min(16, (level / 100) * 16 * scale + 4))
          : 4;
        return (
          <span
            key={i}
            className={cn(
              "w-0.5 rounded-full transition-all duration-150",
              active ? "bg-emerald-400" : "bg-white/20"
            )}
            style={{ height: `${h}px` }}
          />
        );
      })}
    </div>
  );
}

type VoiceChatIndicatorProps = {
  className?: string;
  participants?: VoiceChatParticipant[];
  /** Simulate live speaking levels */
  simulateActivity?: boolean;
  compact?: boolean;
};

export function VoiceChatIndicator({
  className,
  participants: initial = MOCK_PARTICIPANTS,
  simulateActivity = true,
  compact = false,
}: VoiceChatIndicatorProps) {
  const { t } = useTranslation();
  const [participants, setParticipants] = useState(initial);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [connected, setConnected] = useState(true);

  useEffect(() => {
    if (!simulateActivity) return;
    const id = setInterval(() => {
      setParticipants((prev) =>
        prev.map((p) => {
          if (p.isMuted) return { ...p, isSpeaking: false, level: 0 };
          const speaking = Math.random() > 0.55;
          return {
            ...p,
            isSpeaking: speaking,
            level: speaking ? 30 + Math.random() * 70 : 0,
          };
        })
      );
    }, 400);
    return () => clearInterval(id);
  }, [simulateActivity]);

  const activeSpeakers = useMemo(
    () => participants.filter((p) => p.isSpeaking && !p.isMuted),
    [participants]
  );

  if (compact) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/60 px-3 py-1.5 backdrop-blur-md",
          className
        )}
      >
        <span
          className={cn(
            "size-2 rounded-full",
            connected ? "animate-pulse bg-emerald-400" : "bg-red-400"
          )}
        />
        <Mic className="size-3.5 text-primary" />
        <span className="text-xs">
          {activeSpeakers.length > 0
            ? t("future.speakingCount", { count: activeSpeakers.length })
            : t("future.voiceChat")}
        </span>
      </div>
    );
  }

  return (
    <aside
      className={cn(
        "liquid-glass flex w-full max-w-sm flex-col rounded-2xl border border-white/10 p-4",
        className
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex size-8 items-center justify-center rounded-full",
              connected ? "bg-emerald-500/20" : "bg-red-500/20"
            )}
          >
            <Volume2
              className={cn(
                "size-4",
                connected ? "text-emerald-400" : "text-red-400"
              )}
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold">{t("future.voiceChatTitle")}</h3>
            <p className="text-xs text-muted-foreground">
              {connected ? t("future.connectedDemo") : t("room.disconnected")}
            </p>
          </div>
        </div>
        <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] text-muted-foreground">
          MOCK
        </span>
      </div>

      <ul className="mb-4 max-h-48 space-y-2 overflow-y-auto">
        {participants.map((p) => (
          <li
            key={p.id}
            className={cn(
              "flex items-center gap-2 rounded-xl border px-2 py-2 transition",
              p.isSpeaking && !p.isMuted
                ? "border-emerald-500/40 bg-emerald-500/10"
                : "border-white/10 bg-white/5"
            )}
          >
            <div
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                p.isSpeaking && !p.isMuted
                  ? "ring-2 ring-emerald-400/50 ring-offset-1 ring-offset-transparent"
                  : ""
              )}
            >
              {p.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{p.name}</p>
              <p className="text-[10px] text-muted-foreground">
                {p.isMuted
                  ? t("room.mute")
                  : p.isSpeaking
                    ? t("future.speaking")
                    : t("future.silent")}
              </p>
            </div>
            <VoiceLevelBars
              level={p.level ?? 0}
              active={Boolean(p.isSpeaking && !p.isMuted)}
            />
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-center gap-2 border-t border-white/10 pt-3">
        <button
          type="button"
          onClick={() => setIsMuted((m) => !m)}
          title={isMuted ? t("future.turnOnMic") : t("room.mute")}
          className={cn(
            "rounded-xl p-3 transition",
            isMuted
              ? "bg-red-500/20 text-red-400"
              : "bg-white/10 hover:bg-white/15"
          )}
        >
          {isMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
        </button>
        <button
          type="button"
          onClick={() => setIsDeafened((d) => !d)}
          title={isDeafened ? t("future.listen") : t("future.deafen")}
          className={cn(
            "rounded-xl p-3 transition",
            isDeafened
              ? "bg-amber-500/20 text-amber-400"
              : "bg-white/10 hover:bg-white/15"
          )}
        >
          {isDeafened ? (
            <VolumeX className="size-5" />
          ) : (
            <Headphones className="size-5" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setConnected((c) => !c)}
          title={t("future.toggleConnection")}
          className={cn(
            "rounded-xl p-3 transition",
            !connected
              ? "bg-red-600 text-white"
              : "bg-white/10 hover:bg-red-500/20 hover:text-red-400"
          )}
        >
          <PhoneOff className="size-5" />
        </button>
      </div>
    </aside>
  );
}

/** Floating pill shown over the video player in room UI */
export function VoiceChatFloatingBadge({
  className,
}: {
  className?: string;
}) {
  return (
    <VoiceChatIndicator compact simulateActivity className={className} />
  );
}
