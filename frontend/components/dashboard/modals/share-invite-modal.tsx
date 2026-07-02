"use client";

import { useMemo, useState } from "react";
import { Copy, Check } from "lucide-react";
import { ModalShell } from "./modal-shell";
import { formatFaDate } from "@/lib/utils/format-date";
import { toast } from "@/lib/toast";
import { useTranslation } from "@/providers/i18n-provider";

type ShareInviteModalProps = {
  open: boolean;
  onClose: () => void;
  roomId: string;
  code: string;
  expires?: string;
  onEnterRoom?: () => void;
};

export function ShareInviteModal({
  open,
  onClose,
  roomId,
  code,
  expires,
  onEnterRoom,
}: ShareInviteModalProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  const inviteLink = useMemo(() => {
    if (typeof window === "undefined") return code;
    return `${window.location.origin}/rooms?join=${encodeURIComponent(code)}`;
  }, [code]);

  const copy = async (text: string, kind: "code" | "link") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      toast.success(kind === "code" ? t("modals.codeCopied") : t("modals.linkCopied"));
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error(t("modals.copyFailed"));
    }
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={t("modals.inviteToRoom")}
      description={t("modals.inviteDesc")}
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
          <p className="mb-1 text-xs text-muted-foreground">{t("dashboard.inviteCode")}</p>
          <p className="font-mono text-xl tracking-widest" dir="ltr">
            {code}
          </p>
          {expires ? (
            <p className="mt-2 text-xs text-muted-foreground">
              {t("modals.expiresUntil")}
              {formatFaDate(expires)}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => copy(code, "code")}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 px-3 py-2 text-sm"
          >
            {copied === "code" ? <Check className="size-4" /> : <Copy className="size-4" />}
            {t("modals.copyCode")}
          </button>
          <button
            type="button"
            onClick={() => copy(inviteLink, "link")}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 px-3 py-2 text-sm"
          >
            {copied === "link" ? <Check className="size-4" /> : <Copy className="size-4" />}
            {t("dashboard.copyLink")}
          </button>
        </div>

        <p className="text-xs text-muted-foreground" dir="ltr">
          Room ID: {roomId}
        </p>

        <button
          type="button"
          onClick={() => {
            onEnterRoom?.();
            onClose();
          }}
          className="w-full rounded-xl bg-primary px-3 py-2 text-sm text-white"
        >
          {t("modals.enterRoomSetup")}
        </button>
      </div>
    </ModalShell>
  );
}
