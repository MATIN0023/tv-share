"use client";

import { useMemo, useState } from "react";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { SectionHeader } from "@/components/dashboard/section-header";
import { UserPlus, MessageCircle } from "lucide-react";
import { SearchField } from "@/components/forms/search-field";
import { FriendsTable } from "@/components/dashboard/tables/friends-table";
import { ConfirmActionModal } from "@/components/dashboard/modals/confirm-action-modal";
import { EmptyState } from "@/components/dashboard/shared/empty-state";
import { ErrorState } from "@/components/dashboard/shared/error-state";
import { DashboardSkeleton } from "@/components/dashboard/shared/skeleton";
import { Input } from "@/components/ui/input";
import {
  useAcceptFriendRequest,
  useBlockUser,
  useBlockedUsers,
  useFriendRequests,
  useFriends,
  useRejectFriendRequest,
  useSendFriendRequest,
  useUsers,
} from "@/hooks/use-friends";
import { useMe } from "@/hooks/use-me";
import { formatFaDate } from "@/lib/utils/format-date";

type Tab = "friends" | "received" | "sent" | "blocked";

export default function FriendsPage() {
  const [tab, setTab] = useState<Tab>("friends");
  const [search, setSearch] = useState("");
  const [blockOpen, setBlockOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [blockTargetId, setBlockTargetId] = useState("");
  const [inviteUserId, setInviteUserId] = useState("");

  const { data: me } = useMe();
  const friendsQ = useFriends();
  const requestsQ = useFriendRequests();
  const blockedQ = useBlockedUsers();
  const usersQ = useUsers();
  const acceptReq = useAcceptFriendRequest();
  const rejectReq = useRejectFriendRequest();
  const sendReq = useSendFriendRequest();
  const blockUserMut = useBlockUser();

  const userNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const u of usersQ.data?.users ?? []) {
      map.set(u.id, u.display_name || u.phone_number);
    }
    return map;
  }, [usersQ.data]);

  const filteredRows = useMemo(() => {
    const q = search.toLowerCase();
    if (tab === "friends") {
      return (friendsQ.data?.friends ?? [])
        .filter(
          (f) =>
            f.friend_name.toLowerCase().includes(q) ||
            f.friend_id.toLowerCase().includes(q)
        )
        .map((f) => ({
          id: f.friend_id,
          name: f.friend_name || "کاربر",
          subtitle: f.friend_id.slice(-8),
          status: "دوست",
        }));
    }
    if (tab === "received") {
      return (requestsQ.data?.pending ?? [])
        .filter(
          (r) =>
            r.from_user_id.toLowerCase().includes(q) ||
            (userNameMap.get(r.from_user_id) ?? "").includes(search)
        )
        .map((r) => ({
          id: r.from_user_id,
          name: userNameMap.get(r.from_user_id) ?? r.from_user_id.slice(-8),
          subtitle: formatFaDate(r.created_at),
          status: "درخواست دریافتی",
        }));
    }
    if (tab === "blocked") {
      return (blockedQ.data?.users ?? [])
        .filter(
          (u) =>
            (u.display_name ?? "").includes(search) ||
            u.phone_number.includes(search)
        )
        .map((u) => ({
          id: u.id,
          name: u.display_name || u.phone_number,
          subtitle: u.phone_number,
          status: "مسدود",
        }));
    }
    return [];
  }, [
    tab,
    search,
    friendsQ.data,
    requestsQ.data,
    blockedQ.data,
    userNameMap,
  ]);

  const isLoading =
    friendsQ.isLoading || requestsQ.isLoading || blockedQ.isLoading;
  const isError = friendsQ.isError || requestsQ.isError || blockedQ.isError;

  const tabs: { key: Tab; label: string }[] = [
    { key: "friends", label: "دوستان من" },
    { key: "received", label: "درخواست‌های دریافتی" },
    { key: "sent", label: "درخواست‌های ارسالی" },
    { key: "blocked", label: "مسدودها" },
  ];

  return (
    <div>
      <SectionHeader
        title="دوستان"
        description="مدیریت لیست دوستان، درخواست‌ها و کاربران مسدود — داده از API"
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
        <GlassPanel title="دعوت دوست" description="با شناسه کاربر درخواست دوستی بفرست.">
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="mt-3 inline-flex items-center gap-2 rounded-xl liquid-glass px-3 py-2 text-sm"
          >
            <UserPlus className="size-4" />
            ارسال درخواست
          </button>
          <button
            type="button"
            onClick={() => setBlockOpen(true)}
            className="mt-2 inline-flex rounded-xl border border-red-400/30 px-3 py-2 text-sm text-red-400"
          >
            بلاک با شناسه
          </button>
        </GlassPanel>
        <GlassPanel
          title="آمار"
          description={`${friendsQ.data?.friends.length ?? 0} دوست · ${requestsQ.data?.pending.length ?? 0} درخواست`}
        />
        <GlassPanel title="جستجوی کاربران" description="GET /api/users">
          <div className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <MessageCircle className="size-4" />
            {usersQ.data?.users.length ?? 0} کاربر در سیستم
          </div>
        </GlassPanel>
      </div>

      <div className="mt-4 md:mt-6">
        <GlassPanel title="لیست" description="داده زنده از /api/friends">
          <div className="mt-3">
            <SearchField
              placeholder="جستجو..."
              value={search}
              onChange={setSearch}
            />
          </div>
          <div className="mt-3">
            {isLoading ? <DashboardSkeleton /> : null}
            {isError ? (
              <ErrorState
                title="خطا در دریافت دوستان"
                onRetry={() => {
                  friendsQ.refetch();
                  requestsQ.refetch();
                  blockedQ.refetch();
                }}
              />
            ) : null}
            {tab === "sent" ? (
              <EmptyState
                title="درخواست ارسالی"
                description="API فعلاً فقط درخواست‌های دریافتی را برمی‌گرداند."
              />
            ) : null}
            {!isLoading && !isError && tab !== "sent" && filteredRows.length ? (
              <FriendsTable
                rows={filteredRows}
                showActions={
                  tab === "received"
                    ? "requests"
                    : tab === "blocked"
                      ? "blocked"
                      : "friends"
                }
                onAccept={(id) => acceptReq.mutate(id)}
                onReject={(id) => rejectReq.mutate(id)}
                onBlock={(id) => {
                  setBlockTargetId(id);
                  setBlockOpen(true);
                }}
              />
            ) : null}
            {!isLoading && !isError && tab !== "sent" && !filteredRows.length ? (
              <EmptyState title="موردی یافت نشد" />
            ) : null}
          </div>
        </GlassPanel>
      </div>

      <ConfirmActionModal
        open={blockOpen}
        onClose={() => setBlockOpen(false)}
        title="تایید بلاک کاربر"
        description="شناسه کاربر را وارد کنید یا از لیست انتخاب کنید."
        confirmLabel="بلاک"
        onConfirm={() => {
          const id = blockTargetId.trim();
          if (id) blockUserMut.mutate(id);
          setBlockOpen(false);
        }}
      >
        <Input
          placeholder="شناسه کاربر"
          dir="ltr"
          className="mt-2 text-left"
          value={blockTargetId}
          onChange={(e) => setBlockTargetId(e.target.value)}
        />
      </ConfirmActionModal>

      <ConfirmActionModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="ارسال درخواست دوستی"
        description="شناسه کاربر مقصد (از لیست /api/users)"
        confirmLabel="ارسال"
        onConfirm={() => {
          if (inviteUserId.trim()) sendReq.mutate(inviteUserId.trim());
          setInviteOpen(false);
        }}
      >
        <Input
          placeholder="user_id"
          dir="ltr"
          className="mt-2 text-left"
          value={inviteUserId}
          onChange={(e) => setInviteUserId(e.target.value)}
        />
        {me ? (
          <p className="mt-2 text-xs text-muted-foreground" dir="ltr">
            شما: {me.id}
          </p>
        ) : null}
      </ConfirmActionModal>
    </div>
  );
}
