"use client";

import { useMemo, useState } from "react";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { SectionHeader } from "@/components/dashboard/section-header";
import { UserPlus, MessageCircle } from "lucide-react";
import { SearchField } from "@/components/forms/search-field";
import { FriendsTable } from "@/components/dashboard/tables/friends-table";
import { ConfirmActionModal } from "@/components/dashboard/modals/confirm-action-modal";
import { EmptyState } from "@/components/dashboard/shared/empty-state";
import { QueryError } from "@/components/dashboard/shared/query-error";
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
import { useTranslation } from "@/providers/i18n-provider";

type Tab = "friends" | "received" | "sent" | "blocked";

export default function FriendsPage() {
  const { t } = useTranslation();
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
          name: f.friend_name || t("dashboard.userFallback"),
          subtitle: f.friend_id.slice(-8),
          status: t("dashboard.friend"),
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
          status: t("dashboard.receivedRequest"),
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
          status: t("dashboard.blockedStatus"),
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
    t,
  ]);

  const isLoading =
    friendsQ.isLoading || requestsQ.isLoading || blockedQ.isLoading;
  const isError = friendsQ.isError || requestsQ.isError || blockedQ.isError;
  const loadError = friendsQ.error ?? requestsQ.error ?? blockedQ.error;

  const tabs: { key: Tab; label: string }[] = [
    { key: "friends", label: t("dashboard.myFriends") },
    { key: "received", label: t("dashboard.receivedRequests") },
    { key: "sent", label: t("dashboard.sentRequests") },
    { key: "blocked", label: t("dashboard.blocked") },
  ];

  return (
    <div>
      <SectionHeader
        title={t("dashboard.friendsTitle")}
        description={t("dashboard.friendsDesc")}
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
        <GlassPanel title={t("dashboard.inviteFriend")} description={t("dashboard.inviteFriendDesc")}>
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="mt-3 inline-flex items-center gap-2 rounded-xl liquid-glass px-3 py-2 text-sm"
          >
            <UserPlus className="size-4" />
            {t("dashboard.sendRequest")}
          </button>
          <button
            type="button"
            onClick={() => setBlockOpen(true)}
            className="mt-2 inline-flex rounded-xl border border-red-400/30 px-3 py-2 text-sm text-red-400"
          >
            {t("dashboard.blockById")}
          </button>
        </GlassPanel>
        <GlassPanel
          title={t("dashboard.stats")}
          description={t("dashboard.friendsStats", {
            friends: friendsQ.data?.friends.length ?? 0,
            requests: requestsQ.data?.pending.length ?? 0,
          })}
        />
        <GlassPanel title={t("dashboard.searchUsers")} description="GET /api/users">
          <div className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <MessageCircle className="size-4" />
            {t("dashboard.usersInSystem", {
              count: usersQ.data?.users.length ?? 0,
            })}
          </div>
        </GlassPanel>
      </div>

      <div className="mt-4 md:mt-6">
        <GlassPanel title={t("dashboard.list")} description={t("dashboard.liveDataHint")}>
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
                context="friends.load"
                onRetry={() => {
                  friendsQ.refetch();
                  requestsQ.refetch();
                  blockedQ.refetch();
                }}
              />
            ) : null}
            {tab === "sent" ? (
              <EmptyState
                title={t("dashboard.sentRequest")}
                description={t("dashboard.sentRequestsNote")}
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
              <EmptyState title={t("dashboard.nothingFound")} />
            ) : null}
          </div>
        </GlassPanel>
      </div>

      <ConfirmActionModal
        open={blockOpen}
        onClose={() => setBlockOpen(false)}
        title={t("dashboard.confirmBlockUser")}
        description={t("dashboard.blockUserDesc")}
        confirmLabel={t("dashboard.block")}
        onConfirm={() => {
          const id = blockTargetId.trim();
          if (id) blockUserMut.mutate(id);
          setBlockOpen(false);
        }}
      >
        <Input
          placeholder={t("dashboard.userId")}
          dir="ltr"
          className="mt-2 text-left"
          value={blockTargetId}
          onChange={(e) => setBlockTargetId(e.target.value)}
        />
      </ConfirmActionModal>

      <ConfirmActionModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title={t("dashboard.sendFriendRequest")}
        description={t("dashboard.targetUserHint")}
        confirmLabel={t("dashboard.send")}
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
            {t("dashboard.youLabel", { id: me.id })}
          </p>
        ) : null}
      </ConfirmActionModal>
    </div>
  );
}
