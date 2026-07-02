"use client";

import { useMemo, useState } from "react";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { SectionHeader } from "@/components/dashboard/section-header";
import { PlayCircle, Star, History } from "lucide-react";
import { VideosTable } from "@/components/dashboard/tables/videos-table";
import { UploadVideoModal } from "@/components/dashboard/modals/upload-video-modal";
import { SearchField } from "@/components/forms/search-field";
import { EmptyState } from "@/components/dashboard/shared/empty-state";
import { QueryError } from "@/components/dashboard/shared/query-error";
import { DashboardSkeleton } from "@/components/dashboard/shared/skeleton";
import { useFeed, useWatchHistory } from "@/hooks/use-feed";
import { useSchedule } from "@/hooks/use-schedule";
import { useDeleteVideo, useUploadVideo, useVideos } from "@/hooks/use-videos";
import { formatFaDate } from "@/lib/utils/format-date";
import { useTranslation } from "@/providers/i18n-provider";

type Tab = "uploaded" | "watchlist" | "discover" | "history";

export default function LibraryPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("uploaded");
  const [search, setSearch] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);

  const videosQ = useVideos();
  const historyQ = useWatchHistory();
  const scheduleQ = useSchedule();
  const feedQ = useFeed();
  const uploadMut = useUploadVideo();
  const deleteMut = useDeleteVideo();

  const filteredRows = useMemo(() => {
    const q = search.toLowerCase();
    if (tab === "uploaded") {
      return (videosQ.data?.videos ?? [])
        .filter((v) => v.title.toLowerCase().includes(q))
        .map((v) => ({
          id: v.id,
          title: v.title,
          progress:
            v.process_status === "ready"
              ? t("dashboard.percentWatchedFull")
              : t("common.dash"),
          status: v.process_status,
        }));
    }
    if (tab === "history") {
      return (historyQ.data ?? [])
        .filter(
          (h) =>
            (h.room_name ?? "").toLowerCase().includes(q) ||
            (h.video_path ?? "").toLowerCase().includes(q)
        )
        .map((h) => ({
          id: h.id,
          title: h.room_name || h.video_path || t("dashboard.watchFallback"),
          progress:
            h.duration > 0
              ? t("dashboard.percentWatched", {
                  percent: Math.round((h.last_position / h.duration) * 100),
                })
              : t("common.dash"),
          status: formatFaDate(h.watched_at),
        }));
    }
    if (tab === "watchlist") {
      return (scheduleQ.data ?? [])
        .filter((s) => s.title.toLowerCase().includes(q))
        .map((s) => ({
          id: s.id,
          title: s.title,
          progress: s.is_played ? t("dashboard.watched") : t("dashboard.schedule"),
          status: formatFaDate(s.scheduled_for),
        }));
    }
    return (feedQ.data ?? [])
      .filter((f) => f.room_name.toLowerCase().includes(q))
      .map((f) => ({
        id: f.room_id,
        title: f.room_name,
        progress: f.owner_name,
        status: t("dashboard.public"),
      }));
  }, [tab, search, videosQ.data, historyQ.data, scheduleQ.data, feedQ.data, t]);

  const isLoading =
    (tab === "uploaded" && videosQ.isLoading) ||
    (tab === "history" && historyQ.isLoading) ||
    (tab === "watchlist" && scheduleQ.isLoading) ||
    (tab === "discover" && feedQ.isLoading);

  const isError =
    (tab === "uploaded" && videosQ.isError) ||
    (tab === "history" && historyQ.isError) ||
    (tab === "watchlist" && scheduleQ.isError) ||
    (tab === "discover" && feedQ.isError);

  const loadError =
    videosQ.error ?? historyQ.error ?? scheduleQ.error ?? feedQ.error;

  const tabs: { key: Tab; label: string }[] = [
    { key: "uploaded", label: t("dashboard.uploaded") },
    { key: "watchlist", label: t("dashboard.schedule") },
    { key: "discover", label: t("dashboard.publicFeedTab") },
    { key: "history", label: t("dashboard.historyTab") },
  ];

  return (
    <div>
      <SectionHeader
        title={t("dashboard.libraryTitle")}
        description={t("dashboard.libraryDesc")}
      />

      <div className="mb-4 flex flex-wrap gap-2 md:mb-6">
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={`rounded-xl border px-3 py-2 text-sm ${
              tab === item.key ? "border-primary text-primary" : "border-white/20"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassPanel
          title={t("dashboard.uploaded")}
          description={t("dashboard.videoCount", {
            count: videosQ.data?.videos.length ?? 0,
          })}
        >
          <div className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <PlayCircle className="size-4" />
            GET /api/videos
          </div>
        </GlassPanel>
        <GlassPanel
          title={t("dashboard.schedule")}
          description={t("dashboard.itemCount", {
            count: scheduleQ.data?.length ?? 0,
          })}
        >
          <div className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Star className="size-4" />
            GET /api/schedule
          </div>
        </GlassPanel>
        <GlassPanel
          title={t("dashboard.historyTab")}
          description={t("dashboard.watchCount", {
            count: historyQ.data?.length ?? 0,
          })}
        >
          <div className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <History className="size-4" />
            GET /api/watch-history
          </div>
        </GlassPanel>
      </div>

      <div className="mt-4 md:mt-6">
        <GlassPanel title={t("dashboard.list")} description={t("dashboard.filterSearch")}>
          <div className="mt-3">
            <SearchField
              placeholder={t("dashboard.searchPlaceholder")}
              value={search}
              onChange={setSearch}
            />
          </div>
          <div className="mt-3">
            {isLoading ? <DashboardSkeleton /> : null}
            {isError ? (
              <QueryError
                error={loadError}
                context="library.load"
                onRetry={() => {
                  videosQ.refetch();
                  historyQ.refetch();
                  scheduleQ.refetch();
                  feedQ.refetch();
                }}
              />
            ) : null}
            {!isLoading && !isError && filteredRows.length ? (
              <VideosTable
                rows={filteredRows}
                onDelete={
                  tab === "uploaded"
                    ? (id) => deleteMut.mutate(id)
                    : undefined
                }
              />
            ) : null}
            {!isLoading && !isError && !filteredRows.length ? (
              <EmptyState title={t("dashboard.noItems")} />
            ) : null}
          </div>
          {tab === "uploaded" ? (
            <button
              type="button"
              onClick={() => setUploadOpen(true)}
              className="mt-3 rounded-xl bg-primary px-3 py-2 text-sm text-white"
            >
              {t("dashboard.uploadVideo")}
            </button>
          ) : null}
        </GlassPanel>
      </div>

      <UploadVideoModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        isSubmitting={uploadMut.isPending}
        onSubmit={async (p) => {
          await uploadMut.mutateAsync(p);
        }}
      />
    </div>
  );
}
