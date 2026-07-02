"use client";

import { useTranslation } from "@/providers/i18n-provider";

interface ModalShellProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function ModalShell({
  open,
  title,
  description,
  onClose,
  children,
}: ModalShellProps) {
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="liquid-glass w-full max-w-xl rounded-2xl border border-white/20 p-4 md:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            {description ? (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/20 px-3 py-1.5 text-sm"
          >
            {t("common.close")}
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
