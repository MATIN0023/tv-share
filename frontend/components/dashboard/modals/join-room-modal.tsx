"use client";

import { useEffect, useState } from "react";
import { ClipboardPaste } from "lucide-react";
import { ModalShell } from "./modal-shell";
import { Input } from "@/components/ui/input";
import { MutationErrorBanner } from "@/components/dashboard/shared/mutation-error-banner";
import type { ErrorContextKey } from "@/lib/errors";
import { toast } from "@/lib/toast";
import { useTranslation } from "@/providers/i18n-provider";

interface JoinRoomModalProps {
  open: boolean;
  onClose: () => void;
  isSubmitting?: boolean;
  onSubmit?: (code: string) => void | Promise<void>;
  error?: unknown;
  errorContext?: ErrorContextKey;
  initialCode?: string;
}

function normalizeCode(raw: string): string {
  let code = raw.trim();
  try {
    if (code.includes("join=")) {
      const url = new URL(code.startsWith("http") ? code : `https://x/?${code}`);
      const join = url.searchParams.get("join");
      if (join) code = join;
    }
  } catch {
    /* not a URL */
  }
  if (code.includes("/")) {
    code = code.slice(code.lastIndexOf("/") + 1);
  }
  if (code.includes("?")) {
    code = code.split("?")[0]!;
  }
  return code.trim().toLowerCase();
}

export function JoinRoomModal({
  open,
  onClose,
  isSubmitting = false,
  onSubmit,
  error,
  errorContext = "rooms.join",
  initialCode = "",
}: JoinRoomModalProps) {
  const { t } = useTranslation();
  const [code, setCode] = useState(initialCode);

  useEffect(() => {
    if (open && initialCode) setCode(initialCode);
  }, [open, initialCode]);

  const handleSubmit = async () => {
    const normalized = normalizeCode(code);
    if (!normalized) return;
    await onSubmit?.(normalized);
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setCode(normalizeCode(text));
      toast.success(t("modals.pastedFromClipboard"));
    } catch {
      toast.error(t("modals.clipboardDenied"));
    }
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={t("modals.joinWithCodeTitle")}
      description={t("modals.joinCodeDesc")}
    >
      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder={t("modals.inviteCodeExample")}
            dir="ltr"
            className="text-left font-mono"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleSubmit();
            }}
          />
          <button
            type="button"
            onClick={() => void pasteFromClipboard()}
            className="shrink-0 rounded-xl border border-white/20 px-3"
            title={t("modals.pasteFromClipboard")}
          >
            <ClipboardPaste className="size-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          {t("modals.joinCodeHint")}
        </p>
        {error ? (
          <MutationErrorBanner error={error} context={errorContext} />
        ) : null}
        <button
          type="button"
          disabled={isSubmitting || !code.trim()}
          onClick={() => void handleSubmit()}
          className="w-full rounded-xl bg-primary px-3 py-2 text-sm text-white disabled:opacity-50"
        >
          {isSubmitting ? t("modals.joiningRoom") : t("modals.enterRoom")}
        </button>
      </div>
    </ModalShell>
  );
}
