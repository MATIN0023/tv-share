"use client";

import { ModalShell } from "./modal-shell";
import { useTranslation } from "@/providers/i18n-provider";

interface ConfirmActionModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm?: () => void;
  children?: React.ReactNode;
}

export function ConfirmActionModal({
  open,
  onClose,
  title,
  description,
  confirmLabel,
  onConfirm,
  children,
}: ConfirmActionModalProps) {
  const { t } = useTranslation();

  return (
    <ModalShell open={open} onClose={onClose} title={title} description={description}>
      {children}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-white/20 px-3 py-2 text-sm"
        >
          {t("common.cancel")}
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm?.();
            if (!onConfirm) onClose();
          }}
          className="rounded-xl bg-red-500 px-3 py-2 text-sm text-white"
        >
          {confirmLabel}
        </button>
      </div>
    </ModalShell>
  );
}
