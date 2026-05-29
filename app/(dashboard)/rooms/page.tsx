 "use client";

import { useMemo, useState } from "react";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { SectionHeader } from "@/components/dashboard/section-header";
import { Users, Wifi, Plus } from "lucide-react";
import { RoomsTable } from "@/components/dashboard/tables/rooms-table";
import { CreateRoomModal } from "@/components/dashboard/modals/create-room-modal";
import { JoinRoomModal } from "@/components/dashboard/modals/join-room-modal";
import { EmptyState } from "@/components/dashboard/shared/empty-state";

const rooms = [
  { name: "Interstellar Night", members: "۵/۸", status: "Active", startAt: "الان" },
  { name: "Marvel Marathon", members: "۷/۱۰", status: "Scheduled", startAt: "امشب 22:30" },
  { name: "Anime Weekend", members: "۲/۶", status: "History", startAt: "دیروز" },
];

export default function RoomsPage() {
  const [tab, setTab] = useState<"Active" | "Scheduled" | "History">("Active");
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  const filteredRooms = useMemo(() => rooms.filter((room) => room.status === tab), [tab]);

  return (
    <div>
      <SectionHeader
        title="روم‌ها / واچ پارتی"
        description="ساخت روم جدید، پیوستن با کد، مدیریت کاربران و وضعیت همگام‌سازی پخش."
      />

      <div className="mb-4 flex flex-wrap gap-2 md:mb-6">
        {(["Active", "Scheduled", "History"] as const).map((item) => (
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
        <GlassPanel
          title="ساخت روم"
          description="با یک کلیک، روم جدید بساز و لینک دعوت بفرست."
        >
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="mt-3 inline-flex items-center gap-2 rounded-xl liquid-glass px-3 py-2 text-sm"
          >
            <Plus className="size-4" />
            ایجاد واچ‌پارتی
          </button>
          <button
            type="button"
            onClick={() => setJoinOpen(true)}
            className="mt-2 inline-flex rounded-xl border border-white/20 px-3 py-2 text-sm"
          >
            پیوستن با کد
          </button>
        </GlassPanel>

        <GlassPanel
          title="پایداری اتصال"
          description="وضعیت همگام‌سازی پخش، زیرنویس و چت گروهی."
        >
          <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-500">
            <Wifi className="size-4" />
            اتصال پایدار (۹۹٫۲٪)
          </div>
        </GlassPanel>

        <GlassPanel
          title="اعضای آنلاین"
          description="در حال حاضر ۱۲ دوست آنلاین و آماده پیوستن هستند."
        >
          <div className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="size-4" />
            آنلاین: ۱۲ کاربر
          </div>
        </GlassPanel>
      </div>

      <div className="mt-4 md:mt-6">
        <GlassPanel title="لیست روم‌ها" description="مدیریت سریع روم‌های فعال و زمان‌بندی‌شده.">
          <div className="mt-3">
            {filteredRooms.length ? (
              <RoomsTable rows={filteredRooms} />
            ) : (
              <EmptyState title="اتاقی پیدا نشد" description="برای این تب هنوز داده‌ای وجود ندارد." />
            )}
          </div>
        </GlassPanel>
      </div>

      <div className="mt-4 md:mt-6">
        <GlassPanel
          title="Room Details Drawer (Preview)"
          description="اعضا، کنترل‌های میزبان و وضعیت Sync اینجا نمایش داده می‌شود."
        >
          <div className="mt-3 rounded-xl border border-white/10 p-3 text-sm text-muted-foreground">
            اعضا: علی، مهدی، الهام | Host controls: pause, seek, mute all | Sync: 99.2%
          </div>
        </GlassPanel>
      </div>

      <CreateRoomModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <JoinRoomModal open={joinOpen} onClose={() => setJoinOpen(false)} />
    </div>
  );
}
