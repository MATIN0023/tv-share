 "use client";

import { useState } from "react";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { SectionHeader } from "@/components/dashboard/section-header";
import { Clock3, Film, Users, Video } from "lucide-react";
import { StatCard } from "@/components/dashboard/shared/stat-card";
import { ContinueWatchingCard } from "@/components/dashboard/cards/continue-watching-card";
import { LiveRoomCard } from "@/components/dashboard/cards/live-room-card";
import { CreateRoomModal } from "@/components/dashboard/modals/create-room-modal";
import { UploadVideoModal } from "@/components/dashboard/modals/upload-video-modal";
import { ConfirmActionModal } from "@/components/dashboard/modals/confirm-action-modal";

const stats = [
  { title: "واچ‌پارتی فعال", value: "۳", change: "+۱ امروز", icon: Users },
  { title: "مدت تماشا (هفته)", value: "۱۷ ساعت", change: "+۱۲٪", icon: Clock3 },
  { title: "فیلم ذخیره‌شده", value: "۴۸", change: "+۵ جدید", icon: Film },
];

const activities = [
  "با موفقیت به روم «Interstellar Night» پیوستید.",
  "فیلم «The Batman» به کتابخانه شما اضافه شد.",
  "دوست جدید: «مهدی موسوی» درخواست شما را پذیرفت.",
  "اشتراک شما ۶ روز دیگر تمدید می‌شود.",
];

export default function DashboardPage() {
  const [createRoomOpen, setCreateRoomOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <div>
      <SectionHeader
        title="نمای کلی"
        description="تصویر کلی سریع از وضعیت حساب، تعاملات دوستان، واچ‌پارتی‌ها و پیشنهادها."
      />

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:mb-6">
        {stats.map((item) => {
          return (
            <StatCard
              key={item.title}
              title={item.title}
              value={item.value}
              hint={item.change}
              icon={item.icon}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <GlassPanel
          title="عملکرد هفتگی"
          description="نرخ تعامل شما در روم‌ها نسبت به هفته گذشته رشد داشته و مشارکت دوستان بیشتر شده است."
          className="xl:col-span-2"
        >
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <ContinueWatchingCard title="Dune: Part Two" progress={78} />
            <ContinueWatchingCard title="Oppenheimer" progress={24} />
          </div>
        </GlassPanel>

        <GlassPanel title="Quick Actions" description="اقدام‌های سریع داشبورد">
          <div className="mt-3 space-y-2">
            <button
              type="button"
              onClick={() => setCreateRoomOpen(true)}
              className="w-full rounded-xl border border-white/20 px-3 py-2 text-sm"
            >
              ساخت اتاق جدید
            </button>
            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              className="w-full rounded-xl border border-white/20 px-3 py-2 text-sm"
            >
              دعوت دوست
            </button>
            <button
              type="button"
              onClick={() => setUploadOpen(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm text-white"
            >
              <Video className="size-4" />
              آپلود ویدیو
            </button>
          </div>
        </GlassPanel>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2 md:mt-6">
        <GlassPanel
          title="Friends Live Rooms"
          description="اتاق‌هایی که دوستان شما همین حالا داخل آن هستند."
        >
          <div className="mt-3 space-y-2">
            <LiveRoomCard roomName="Interstellar Night" friendName="مهدی موسوی" viewers="5" />
            <LiveRoomCard roomName="Marvel Marathon" friendName="الهام رضایی" viewers="7" />
          </div>
        </GlassPanel>
        <GlassPanel
          title="فعالیت‌های اخیر"
          description="آخرین تغییرات حساب شما در ۲۴ ساعت گذشته."
        >
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {activities.map((activity) => (
              <li key={activity} className="rounded-xl border border-white/10 px-3 py-2">
                {activity}
              </li>
            ))}
          </ul>
        </GlassPanel>
      </div>

      <CreateRoomModal open={createRoomOpen} onClose={() => setCreateRoomOpen(false)} />
      <UploadVideoModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
      <ConfirmActionModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="دعوت دوست"
        description="در نسخه متصل به API این بخش با شماره یا یوزرنیم ارسال دعوت انجام می‌دهد."
        confirmLabel="ارسال دعوت"
      />
    </div>
  );
}
