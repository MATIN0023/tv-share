"use client";

import { useState } from "react";
import { ModalShell } from "@/components/dashboard/modals/modal-shell";
import { Loader2 } from "lucide-react";

interface AdminConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  onConfirm: () => void | Promise<void>;
  children?: React.ReactNode;
}

export function AdminConfirmDialog({
  open,
  onClose,
  title,
  description,
  confirmLabel = "تأیید",
  cancelLabel = "انصراف",
  variant = "primary",
  onConfirm,
  children,
}: AdminConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell open={open} onClose={onClose} title={title} description={description}>
      {children}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={onClose}
          className="rounded-xl border border-zinc-700 px-3 py-2 text-sm text-zinc-300 disabled:opacity-50"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={handleConfirm}
          className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm text-white disabled:opacity-50 ${
            variant === "danger" ? "bg-red-600" : "bg-amber-500 text-zinc-950"
          }`}
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : null}
          {confirmLabel}
        </button>
      </div>
    </ModalShell>
  );
}
