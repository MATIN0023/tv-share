"use client";

import { useState } from "react";
import {
  Ban,
  Crown,
  Shield,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { ModalShell } from "@/components/dashboard/modals/modal-shell";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/providers/i18n-provider";
import type { FutureRoomMember } from "./types";

const MOCK_MEMBERS: FutureRoomMember[] = [
  {
    id: "u1",
    name: "شما (مالک)",
    role: "owner",
    isOnline: true,
    isMuted: false,
  },
  {
    id: "u2",
    name: "سارا احمدی",
    role: "cohost",
    isOnline: true,
    isMuted: false,
  },
  {
    id: "u3",
    name: "علی رضایی",
    role: "member",
    isOnline: true,
    isMuted: true,
  },
  {
    id: "u4",
    name: "مریم کریمی",
    role: "member",
    isOnline: false,
    isMuted: false,
  },
];

const ROLE_ICON = {
  owner: Crown,
  cohost: Shield,
  member: Users,
};

type RoomRolesModalProps = {
  open: boolean;
  onClose: () => void;
  members?: FutureRoomMember[];
  currentUserId?: string;
};

export function RoomRolesModal({
  open,
  onClose,
  members: initialMembers = MOCK_MEMBERS,
  currentUserId = "u1",
}: RoomRolesModalProps) {
  const { t } = useTranslation();
  const [members, setMembers] = useState(initialMembers);
  const [confirmKick, setConfirmKick] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const promoteToCohost = (id: string) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id && m.role === "member" ? { ...m, role: "cohost" } : m
      )
    );
    showToast(t("future.promotedCoHost"));
  };

  const demoteToMember = (id: string) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id && m.role === "cohost" ? { ...m, role: "member" } : m
      )
    );
    showToast(t("future.demotedMember"));
  };

  const kickMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setConfirmKick(null);
    showToast(t("future.kickedDemo"));
  };

  const banMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    showToast(t("future.bannedDemo"));
  };

  const canManage = (target: FutureRoomMember) =>
    target.role !== "owner" && target.id !== currentUserId;

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={t("future.rolesTitle")}
      description={t("future.rolesDesc")}
    >
      {toast ? (
        <div className="mb-3 rounded-lg bg-primary/15 px-3 py-2 text-sm text-primary">
          {toast}
        </div>
      ) : null}

      <ul className="max-h-[min(24rem,60vh)] space-y-2 overflow-y-auto">
        {members.map((member) => {
          const RoleIcon = ROLE_ICON[member.role];
          return (
            <li
              key={member.id}
              className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3"
            >
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                  member.isOnline
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-white/10 text-muted-foreground"
                )}
              >
                {member.name.charAt(0)}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{member.name}</p>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <RoleIcon className="size-3" />
                    {member.role === "owner"
                      ? t("future.owner")
                      : member.role === "cohost"
                        ? t("future.coHost")
                        : t("future.member")}
                  </span>
                  <span
                    className={cn(
                      member.isOnline ? "text-emerald-400" : "text-zinc-500"
                    )}
                  >
                    {member.isOnline ? t("room.online") : t("future.offline")}
                  </span>
                  {member.isMuted ? (
                    <span className="text-amber-400">{t("room.mute")}</span>
                  ) : null}
                </div>
              </div>

              {canManage(member) ? (
                <div className="flex flex-wrap gap-1">
                  {member.role === "member" ? (
                    <button
                      type="button"
                      onClick={() => promoteToCohost(member.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-2 py-1 text-xs text-primary hover:bg-primary/20"
                    >
                      <UserPlus className="size-3" />
                      {t("future.coHost")}
                    </button>
                  ) : member.role === "cohost" ? (
                    <button
                      type="button"
                      onClick={() => demoteToMember(member.id)}
                      className="rounded-lg border border-white/20 px-2 py-1 text-xs hover:bg-white/5"
                    >
                      {t("future.demoteRole")}
                    </button>
                  ) : null}

                  {confirmKick === member.id ? (
                    <>
                      <button
                        type="button"
                        onClick={() => kickMember(member.id)}
                        className="rounded-lg bg-amber-600/80 px-2 py-1 text-xs text-white"
                      >
                        {t("future.confirmKick")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmKick(null)}
                        className="rounded-lg border border-white/20 px-2 py-1 text-xs"
                      >
                        {t("common.cancel")}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmKick(member.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-amber-500/30 px-2 py-1 text-xs text-amber-400 hover:bg-amber-500/10"
                    >
                      <UserMinus className="size-3" />
                      {t("future.kick")}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => banMember(member.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10"
                  >
                    <Ban className="size-3" />
                    {t("tables.block")}
                  </button>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-xs text-muted-foreground">{t("future.rolesHint")}</p>
    </ModalShell>
  );
}

/** Trigger button for demos / storybook-style previews */
export function RoomRolesModalTrigger({
  className,
}: {
  className?: string;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm hover:bg-white/5",
          className
        )}
      >
        <Users className="size-4" />
        {t("future.manageMembers")}
      </button>
      <RoomRolesModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
