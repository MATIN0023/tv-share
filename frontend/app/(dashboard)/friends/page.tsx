 "use client";

import { useMemo, useState } from "react";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { SectionHeader } from "@/components/dashboard/section-header";
import { UserPlus, Circle, MessageCircle } from "lucide-react";
import { SearchField } from "@/components/forms/search-field";
import { FriendsTable } from "@/components/dashboard/tables/friends-table";
import { ConfirmActionModal } from "@/components/dashboard/modals/confirm-action-modal";
import { EmptyState } from "@/components/dashboard/shared/empty-state";

const friends = [
  { name: "مهدی موسوی", username: "@mahdi", state: "My Friends", color: "text-emerald-500" },
  { name: "الهام رضایی", username: "@elham", state: "Requests Received", color: "text-primary" },
  { name: "سینا کاظمی", username: "@sina", state: "Blocked Users", color: "text-muted-foreground" },
  { name: "مریم صادقی", username: "@maryam", state: "Requests Sent", color: "text-amber-400" },
];

export default function FriendsPage() {
  const [tab, setTab] = useState<
    "My Friends" | "Requests Received" | "Requests Sent" | "Blocked Users"
  >("My Friends");
  const [search, setSearch] = useState("");
  const [blockOpen, setBlockOpen] = useState(false);

  const filteredRows = useMemo(
    () =>
      friends
        .filter((friend) => friend.state === tab)
        .filter(
          (friend) =>
            friend.name.includes(search) ||
            friend.username.toLowerCase().includes(search.toLowerCase())
        )
        .map((friend) => ({
          name: friend.name,
          username: friend.username,
          status: friend.state,
        })),
    [search, tab]
  );

  return (
    <div>
      <SectionHeader
        title="دوستان"
        description="مدیریت لیست دوستان، درخواست‌های جدید و وضعیت آنلاین."
      />
      <div className="mb-4 flex flex-wrap gap-2 md:mb-6">
        {(["My Friends", "Requests Received", "Requests Sent", "Blocked Users"] as const).map(
          (item) => (
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
          )
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassPanel
          title="دعوت دوست"
          description="با شماره موبایل یا لینک اختصاصی، دوست جدید اضافه کن."
        >
          <button
            type="button"
            className="mt-3 inline-flex items-center gap-2 rounded-xl liquid-glass px-3 py-2 text-sm"
          >
            <UserPlus className="size-4" />
            ارسال دعوت
          </button>
          <button
            type="button"
            onClick={() => setBlockOpen(true)}
            className="mt-2 inline-flex rounded-xl border border-red-400/30 px-3 py-2 text-sm text-red-400"
          >
            بلاک کاربر مزاحم
          </button>
        </GlassPanel>
        <GlassPanel title="فعالیت امروز" description="۴ تعامل جدید با دوستان ثبت شده است." />
        <GlassPanel title="چت سریع" description="برای هماهنگی زمان واچ‌پارتی پیام بده.">
          <div className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <MessageCircle className="size-4" />
            ۳ گفتگوی خوانده‌نشده
          </div>
        </GlassPanel>
      </div>

      <div className="mt-4 md:mt-6">
        <GlassPanel title="لیست دوستان" description="وضعیت لحظه‌ای دوستان شما.">
          <div className="mt-3">
            <SearchField
              placeholder="جستجو با یوزرنیم یا شماره موبایل"
              value={search}
              onChange={setSearch}
            />
          </div>
          <div className="mt-3">
            {filteredRows.length ? (
              <FriendsTable rows={filteredRows} />
            ) : (
              <EmptyState title="کاربری یافت نشد" description="کلیدواژه یا تب را تغییر بده." />
            )}
          </div>
        </GlassPanel>
      </div>

      <ConfirmActionModal
        open={blockOpen}
        onClose={() => setBlockOpen(false)}
        title="تایید بلاک کاربر"
        description="در نسخه متصل به API، کاربر انتخاب‌شده به لیست مسدودها منتقل می‌شود."
        confirmLabel="بلاک"
      />
    </div>
  );
}
