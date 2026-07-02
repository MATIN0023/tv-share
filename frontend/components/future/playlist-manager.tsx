"use client";

import { useCallback, useState } from "react";
import {
  GripVertical,
  ListVideo,
  Pause,
  Play,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/providers/i18n-provider";
import type { FuturePlaylistItem } from "./types";

const MOCK_PLAYLIST: FuturePlaylistItem[] = [
  {
    id: "1",
    title: "قسمت ۱ — شروع ماجرا",
    duration: "42:18",
    status: "ready",
  },
  {
    id: "2",
    title: "قسمت ۲ — پیچش داستان",
    duration: "38:05",
    status: "ready",
  },
  {
    id: "3",
    title: "قسمت ۳ — در حال پردازش",
    duration: "—",
    status: "processing",
  },
];

type PlaylistManagerProps = {
  className?: string;
  initialItems?: FuturePlaylistItem[];
  currentIndex?: number;
  onReorder?: (items: FuturePlaylistItem[]) => void;
};

export function PlaylistManager({
  className,
  initialItems = MOCK_PLAYLIST,
  currentIndex: initialCurrent = 0,
  onReorder,
}: PlaylistManagerProps) {
  const { t } = useTranslation();
  const [items, setItems] = useState(initialItems);
  const [currentIndex, setCurrentIndex] = useState(initialCurrent);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const reorder = useCallback(
    (fromId: string, toId: string) => {
      if (fromId === toId) return;
      setItems((prev) => {
        const fromIdx = prev.findIndex((i) => i.id === fromId);
        const toIdx = prev.findIndex((i) => i.id === toId);
        if (fromIdx < 0 || toIdx < 0) return prev;
        const next = [...prev];
        const [moved] = next.splice(fromIdx, 1);
        next.splice(toIdx, 0, moved);
        onReorder?.(next);
        return next;
      });
    },
    [onReorder]
  );

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const addMockItem = () => {
    const title =
      newTitle.trim() || t("future.videoFallback", { n: items.length + 1 });
    setItems((prev) => [
      ...prev,
      {
        id: `mock-${Date.now()}`,
        title,
        duration: "00:00",
        status: "ready",
      },
    ]);
    setNewTitle("");
  };

  return (
    <section
      className={cn(
        "liquid-glass rounded-2xl border border-white/10 p-4 md:p-5",
        className
      )}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <ListVideo className="size-5 text-primary" />
          <div>
            <h2 className="text-base font-semibold md:text-lg">
              {t("future.playlistTitle")}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t("future.playlistCount", { count: items.length })}
            </p>
          </div>
        </div>
        <span className="rounded-lg bg-primary/15 px-2 py-1 text-xs text-primary">
          {t("future.nowPlayingItem", {
            current: currentIndex + 1,
            total: items.length || 1,
          })}
        </span>
      </div>

      <ul className="space-y-2" role="list">
        {items.map((item, index) => {
          const isActive = index === currentIndex;
          const isDragging = dragId === item.id;
          const isOver = dragOverId === item.id && dragId !== item.id;

          return (
            <li
              key={item.id}
              draggable
              onDragStart={() => setDragId(item.id)}
              onDragEnd={() => {
                setDragId(null);
                setDragOverId(null);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverId(item.id);
              }}
              onDragLeave={() => setDragOverId(null)}
              onDrop={() => {
                if (dragId) reorder(dragId, item.id);
                setDragOverId(null);
                setDragId(null);
              }}
              className={cn(
                "group flex items-center gap-2 rounded-xl border px-2 py-2 transition",
                isActive
                  ? "border-primary/50 bg-primary/10"
                  : "border-white/10 bg-white/5 hover:border-white/20",
                isDragging && "opacity-50",
                isOver && "border-primary/40 ring-1 ring-primary/30"
              )}
            >
              <button
                type="button"
                className="cursor-grab touch-none rounded p-1 text-muted-foreground active:cursor-grabbing"
                aria-label={t("future.reorder")}
              >
                <GripVertical className="size-4" />
              </button>

              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-black/30 text-xs font-bold text-white/80">
                {index + 1}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.title}</p>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{item.duration}</span>
                  {item.status === "processing" ? (
                    <span className="text-amber-400">{t("future.processing")}</span>
                  ) : item.status === "error" ? (
                    <span className="text-red-400">{t("future.error")}</span>
                  ) : (
                    <span className="text-emerald-400/80">{t("future.ready")}</span>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
                <button
                  type="button"
                  title={isActive ? t("room.playing") : t("future.playItem")}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "rounded-lg p-1.5 hover:bg-white/10",
                    isActive && "text-primary"
                  )}
                >
                  {isActive ? (
                    <Pause className="size-4" />
                  ) : (
                    <Play className="size-4" />
                  )}
                </button>
                <button
                  type="button"
                  title={t("common.delete")}
                  onClick={() => removeItem(item.id)}
                  className="rounded-lg p-1.5 text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {t("future.emptyPlaylist")}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder={t("future.newVideoTitle")}
          className="min-w-[12rem] flex-1 rounded-xl border border-white/15 bg-transparent px-3 py-2 text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter") addMockItem();
          }}
        />
        <button
          type="button"
          onClick={addMockItem}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-sm text-white"
        >
          <Plus className="size-4" />
          {t("future.add")}
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 px-3 py-2 text-sm hover:bg-white/5"
        >
          <Upload className="size-4" />
          {t("common.upload")}
        </button>
      </div>
    </section>
  );
}
