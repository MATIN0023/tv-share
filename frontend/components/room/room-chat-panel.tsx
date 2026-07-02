"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/providers/i18n-provider";

const EMOJI_CLASS =
  "font-[family-name:var(--font-emoji)] text-[1.25rem] leading-none";

export type ChatItem = {
  id: string;
  from: string;
  text: string;
  time?: string;
};

type RoomChatPanelProps = {
  messages: ChatItem[];
  input: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
  connected: boolean;
  onReaction?: (emoji: string) => void;
  reactionEmojis?: readonly string[];
  className?: string;
};

export function RoomChatPanel({
  messages,
  input,
  onInputChange,
  onSend,
  connected,
  onReaction,
  reactionEmojis = ["❤️", "😂", "🔥", "👏"],
  className,
}: RoomChatPanelProps) {
  const { t } = useTranslation();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <div className="mb-2 flex items-center justify-between gap-2 border-b border-white/10 pb-2">
        <div>
          <p className="text-sm font-medium">{t("room.liveChat")}</p>
          <p className="text-xs text-muted-foreground">
            {connected ? t("room.connected") : t("room.connecting")}
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto pr-1 text-sm">
        {messages.length ? (
          messages.map((m) => (
            <div
              key={m.id}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-medium text-primary">{m.from}</span>
                {m.time ? (
                  <span className="text-[10px] text-muted-foreground">{m.time}</span>
                ) : null}
              </div>
              <p className="mt-0.5 break-words text-foreground/90">{m.text}</p>
            </div>
          ))
        ) : (
          <p className="py-8 text-center text-muted-foreground">{t("room.firstMessage")}</p>
        )}
        <div ref={bottomRef} />
      </div>

      {onReaction ? (
        <div className="mt-2 flex flex-wrap gap-1">
          {reactionEmojis.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => onReaction(e)}
              className="rounded-lg border border-white/10 px-2 py-1 hover:bg-white/10"
            >
              <span className={EMOJI_CLASS}>{e}</span>
            </button>
          ))}
        </div>
      ) : null}

      <form
        className="mt-2 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          onSend();
        }}
      >
        <input
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={t("room.messagePlaceholder")}
          className="flex-1 rounded-xl border border-white/15 bg-transparent px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={!input.trim() || !connected}
          className="rounded-xl bg-primary px-4 py-2 text-sm text-white disabled:opacity-40"
        >
          {t("dashboard.send")}
        </button>
      </form>
    </div>
  );
}

type RoomChatDrawerProps = RoomChatPanelProps & {
  open: boolean;
  onClose: () => void;
};

export function RoomChatDrawer({ open, onClose, ...panel }: RoomChatDrawerProps) {
  const { t } = useTranslation();
  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label={t("room.closeChat")}
        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        onClick={onClose}
      />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-[min(100%,22rem)] flex-col border-l border-white/10 bg-zinc-950/95 p-4 backdrop-blur lg:hidden">
        <div className="mb-2 flex justify-end">
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-white/10">
            <X className="size-5" />
          </button>
        </div>
        <RoomChatPanel {...panel} className="flex-1" />
      </aside>
    </>
  );
}
