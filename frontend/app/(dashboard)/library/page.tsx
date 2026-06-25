"use client";

import { useMemo, useState } from "react";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { SectionHeader } from "@/components/dashboard/section-header";
import { PlayCircle, Star, History } from "lucide-react";
import { VideosTable } from "@/components/dashboard/tables/videos-table";
import { UploadVideoModal } from "@/components/dashboard/modals/upload-video-modal";
import { SearchField } from "@/components/forms/search-field";
import { EmptyState } from "@/components/dashboard/shared/empty-state";
import { ErrorState } from "@/components/dashboard/shared/error-state";
import { DashboardSkeleton } from "@/components/dashboard/shared/skeleton";
import { useFeed, useWatchHistory } from "@/hooks/use-feed";
import { useSchedule } from "@/hooks/use-schedule";
import { useDeleteVideo, useUploadVideo, useVideos } from "@/hooks/use-videos";
import { formatFaDate } from "@/lib/utils/format-date";

type Tab = "uploaded" | "watchlist" | "discover" | "history";

export default function LibraryPage() {
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
          progress: v.process_status === "ready" ? "۱۰۰٪" : "—",
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
          title: h.room_name || h.video_path || "تماشا",
          progress:
            h.duration > 0
              ? `${Math.round((h.last_position / h.duration) * 100)}٪`
              : "—",
          status: formatFaDate(h.watched_at),
        }));
    }
    if (tab === "watchlist") {
      return (scheduleQ.data ?? [])
        .filter((s) => s.title.toLowerCase().includes(q))
        .map((s) => ({
          id: s.id,
          title: s.title,
          progress: s.is_played ? "پخش‌شده" : "زمان‌بندی",
          status: formatFaDate(s.scheduled_for),
        }));
    }
    return (feedQ.data ?? [])
      .filter((f) => f.room_name.toLowerCase().includes(q))
      .map((f) => ({
        id: f.room_id,
        title: f.room_name,
        progress: f.owner_name,
        status: "عمومی",
      }));
  }, [tab, search, videosQ.data, historyQ.data, scheduleQ.data, feedQ.data]);

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

  const tabs: { key: Tab; label: string }[] = [
    { key: "uploaded", label: "آپلودشده" },
    { key: "watchlist", label: "زمان‌بندی" },
    { key: "discover", label: "فید عمومی" },
    { key: "history", label: "تاریخچه" },
  ];

  return (
    <div>
      <SectionHeader
        title="ویدیوها / کتابخانه"
        description="ویدیوها، زمان‌بندی، فید و تاریخچه تماشا از API"
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
        <GlassPanel title="آپلودشده" description={`${videosQ.data?.videos.length ?? 0} ویدیو`}>
          <div className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <PlayCircle className="size-4" />
            GET /api/videos
          </div>
        </GlassPanel>
        <GlassPanel title="زمان‌بندی" description={`${scheduleQ.data?.length ?? 0} مورد`}>
          <div className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Star className="size-4" />
            GET /api/schedule
          </div>
        </GlassPanel>
        <GlassPanel title="تاریخچه" description={`${historyQ.data?.length ?? 0} تماشا`}>
          <div className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <History className="size-4" />
            GET /api/watch-history
          </div>
        </GlassPanel>
      </div>

      <div className="mt-4 md:mt-6">
        <GlassPanel title="لیست" description="فیلتر و جستجو">
          <div className="mt-3">
            <SearchField placeholder="جستجو..." value={search} onChange={setSearch} />
          </div>
          <div className="mt-3">
            {isLoading ? <DashboardSkeleton /> : null}
            {isError ? (
              <ErrorState
                title="خطا در دریافت داده"
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
              <EmptyState title="موردی نیست" />
            ) : null}
          </div>
          {tab === "uploaded" ? (
            <button
              type="button"
              onClick={() => setUploadOpen(true)}
              className="mt-3 rounded-xl bg-primary px-3 py-2 text-sm text-white"
            >
              آپلود ویدیو
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
