"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Maximize2,
  MessageSquare,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { cueAtTime, type SubtitleCue } from "@/lib/subtitles/parse-srt";
import { useTranslation } from "@/providers/i18n-provider";

export type PlaybackState = {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
};

type WatchPlayerProps = {
  src?: string;
  isOwner: boolean;
  playback: PlaybackState;
  subtitles?: SubtitleCue[];
  onPlay?: () => void;
  onPause?: () => void;
  onSeek?: (time: number) => void;
  onTimeUpdate?: (time: number, duration: number) => void;
  onToggleChat?: () => void;
  chatOpen?: boolean;
  reactionOverlay?: React.ReactNode;
  className?: string;
};

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function WatchPlayer({
  src,
  isOwner,
  playback,
  subtitles = [],
  onPlay,
  onPause,
  onSeek,
  onTimeUpdate,
  onToggleChat,
  chatOpen,
  reactionOverlay,
  className,
}: WatchPlayerProps) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(false);
  const [localTime, setLocalTime] = useState(0);
  const [localDuration, setLocalDuration] = useState(0);
  const [subtitleText, setSubtitleText] = useState<string | null>(null);
  const syncingRef = useRef(false);

  const duration = playback.duration || localDuration || 0;
  const currentTime = isOwner ? localTime : playback.currentTime || localTime;
  const isPlaying = playback.isPlaying;

  // Non-owner: sync from room state
  useEffect(() => {
    const video = videoRef.current;
    if (!video || isOwner || syncingRef.current) return;

    syncingRef.current = true;
    const drift = Math.abs(video.currentTime - playback.currentTime);
    if (drift > 1.5) {
      video.currentTime = playback.currentTime;
    }
    if (playback.isPlaying && video.paused) {
      void video.play().catch(() => undefined);
    } else if (!playback.isPlaying && !video.paused) {
      video.pause();
    }
    syncingRef.current = false;
  }, [isOwner, playback.currentTime, playback.isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTime = () => {
      setLocalTime(video.currentTime);
      setLocalDuration(video.duration || 0);
      setSubtitleText(cueAtTime(subtitles, video.currentTime));
      onTimeUpdate?.(video.currentTime, video.duration || 0);
    };

    video.addEventListener("timeupdate", onTime);
    video.addEventListener("loadedmetadata", onTime);
    return () => {
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("loadedmetadata", onTime);
    };
  }, [subtitles, onTimeUpdate, src]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
      onPlay?.();
    } else {
      video.pause();
      onPause?.();
    }
  }, [onPlay, onPause]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = Number(e.target.value);
    const video = videoRef.current;
    if (video) {
      video.currentTime = t;
      setLocalTime(t);
    }
    if (isOwner) {
      onSeek?.(t);
    }
  };

  const toggleFullscreen = () => {
    const el = videoRef.current?.parentElement;
    if (!el) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void el.requestFullscreen();
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        if (isOwner) togglePlay();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOwner, togglePlay]);

  if (!src) {
    return (
      <div
        className={cn(
          "flex aspect-video items-center justify-center rounded-2xl border border-dashed border-white/20 bg-black/40 text-sm text-muted-foreground",
          className
        )}
      >
        {t("room.noVideoConfigured")}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-black shadow-2xl",
        className
      )}
    >
      <video
        ref={videoRef}
        src={src}
        controls={false}
        className="aspect-video w-full bg-black object-contain"
        playsInline
        muted={muted}
        onClick={() => isOwner && togglePlay()}
      />

      {subtitleText ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-16 z-10 flex justify-center px-4">
          <p className="max-w-2xl rounded-lg bg-black/75 px-4 py-2 text-center text-sm leading-relaxed text-white">
            {subtitleText}
          </p>
        </div>
      ) : null}

      {reactionOverlay}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3 pb-3 pt-10 opacity-100 transition lg:opacity-0 lg:group-hover:opacity-100">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          disabled={!isOwner}
          onChange={handleSeek}
          className="mb-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/25 accent-primary disabled:cursor-default"
          aria-label={t("room.videoProgress")}
        />

        <div className="flex items-center gap-2 text-white">
          {isOwner ? (
            <button
              type="button"
              onClick={togglePlay}
              className="rounded-lg p-2 hover:bg-white/10"
              aria-label={isPlaying ? t("room.pause") : t("room.play")}
            >
              {isPlaying ? <Pause className="size-5" /> : <Play className="size-5" />}
            </button>
          ) : (
            <span className="rounded-lg bg-white/10 px-2 py-1 text-xs">
              {isPlaying ? t("room.playing") : t("room.paused")}
            </span>
          )}

          <span className="text-xs tabular-nums text-white/80">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="flex-1" />

          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            className="rounded-lg p-2 hover:bg-white/10"
            aria-label={muted ? t("room.unmute") : t("room.mute")}
          >
            {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </button>

          {onToggleChat ? (
            <button
              type="button"
              onClick={onToggleChat}
              className={cn(
                "rounded-lg p-2 hover:bg-white/10 lg:hidden",
                chatOpen && "bg-primary/30"
              )}
              aria-label={t("room.chat")}
            >
              <MessageSquare className="size-4" />
            </button>
          ) : null}

          <button
            type="button"
            onClick={toggleFullscreen}
            className="rounded-lg p-2 hover:bg-white/10"
            aria-label={t("room.fullscreen")}
          >
            <Maximize2 className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
