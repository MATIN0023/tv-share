 "use client";

import { useMemo, useState } from "react";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { SectionHeader } from "@/components/dashboard/section-header";
import { PlayCircle, Star, History, Search } from "lucide-react";
import { VideosTable } from "@/components/dashboard/tables/videos-table";
import { UploadVideoModal } from "@/components/dashboard/modals/upload-video-modal";
import { SearchField } from "@/components/forms/search-field";
import { EmptyState } from "@/components/dashboard/shared/empty-state";

const items = [
  { title: "Dune: Part Two", progress: "۷۸٪", type: "Watchlist", status: "Transcoded" },
  { title: "The Batman", progress: "۱۰۰٪", type: "Favorites", status: "Ready" },
  { title: "Oppenheimer", progress: "۲۱٪", type: "Uploaded", status: "HLS Processing" },
  { title: "Interstellar", progress: "۶۴٪", type: "History", status: "Ready" },
];

export default function LibraryPage() {
  const [tab, setTab] = useState<"Uploaded" | "Favorites" | "Watchlist" | "History">(
    "Uploaded"
  );
  const [search, setSearch] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);

  const filteredRows = useMemo(
    () =>
      items
        .filter((item) => item.type === tab)
        .filter((item) => item.title.toLowerCase().includes(search.toLowerCase()))
        .map((item) => ({
          title: item.title,
          progress: item.progress,
          status: item.status,
        })),
    [search, tab]
  );

  return (
    <div>
      <SectionHeader
        title="ویدیوها / کتابخانه من"
        description="مشاهده لیست فیلم‌ها، ادامه تماشا، علاقه‌مندی‌ها و تاریخچه."
      />
      <div className="mb-4 flex flex-wrap gap-2 md:mb-6">
        {(["Uploaded", "Favorites", "Watchlist", "History"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`rounded-xl border px-3 py-2 text-sm ${
              tab === item ? "border-primary text-primary" : "border-white/20"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassPanel title="ادامه تماشا" description="۳ عنوان ناتمام در این هفته.">
          <div className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <PlayCircle className="size-4" />
            آخرین تماشا: ۲ ساعت پیش
          </div>
        </GlassPanel>
        <GlassPanel title="علاقه‌مندی‌ها" description="۱۲ فیلم نشان‌شده با ستاره.">
          <div className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Star className="size-4" />
            ۴ فیلم جدید اضافه شد
          </div>
        </GlassPanel>
        <GlassPanel title="تاریخچه" description="سوابق تماشا در ۳۰ روز اخیر.">
          <div className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <History className="size-4" />
            ۲۶ عنوان مشاهده‌شده
          </div>
        </GlassPanel>
      </div>

      <div className="mt-4 md:mt-6">
        <GlassPanel title="جستجو در کتابخانه" description="فیلتر سریع بین فیلم‌ها و سریال‌های ذخیره‌شده.">
          <div className="mt-3">
            <SearchField
              placeholder="جستجو بر اساس عنوان، ژانر یا سال..."
              value={search}
              onChange={setSearch}
            />
          </div>
          <div className="mt-3">
            {filteredRows.length ? (
              <VideosTable rows={filteredRows} />
            ) : (
              <EmptyState
                title="ویدیویی برای نمایش نیست"
                description="فیلتر یا جستجو را تغییر بده یا ویدیوی جدید آپلود کن."
              />
            )}
          </div>
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="mt-3 rounded-xl bg-primary px-3 py-2 text-sm text-white"
          >
            آپلود ویدیو جدید
          </button>
        </GlassPanel>
      </div>

      <UploadVideoModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </div>
  );
}
