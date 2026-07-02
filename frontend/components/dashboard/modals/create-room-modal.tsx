"use client";

import { useState } from "react";
import { ModalShell } from "./modal-shell";
import { Input } from "@/components/ui/input";
import { DateTimeField } from "@/components/forms/date-time-field";
import { useTranslation } from "@/providers/i18n-provider";

interface CreateRoomModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (payload: {
    name: string;
    visibility: string;
    scheduledAt?: string;
  }) => void | Promise<void>;
  isSubmitting?: boolean;
}

export function CreateRoomModal({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
}: CreateRoomModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [startAt, setStartAt] = useState("");

  const handleSubmit = async () => {
    if (!name.trim()) return;
    await onSubmit?.({
      name: name.trim(),
      visibility: isPrivate ? "private" : "public",
      scheduledAt: startAt || undefined,
    });
    setName("");
    setStartAt("");
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={t("modals.createRoomTitle")}
      description={t("modals.createRoomDesc")}
    >
      <div className="space-y-3">
        <Input
          placeholder={t("dashboard.roomName")}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <DateTimeField value={startAt} onChange={setStartAt} />
        <div className="flex items-center justify-between rounded-xl border border-white/10 p-3 text-sm">
          <span>{t("modals.roomType")}</span>
          <button
            type="button"
            onClick={() => setIsPrivate((prev) => !prev)}
            className="rounded-lg border border-white/20 px-2 py-1"
          >
            {isPrivate ? t("dashboard.private") : t("dashboard.public")}
          </button>
        </div>
        <button
          type="button"
          disabled={isSubmitting || !name.trim()}
          onClick={handleSubmit}
          className="w-full rounded-xl bg-primary px-3 py-2 text-sm text-white disabled:opacity-50"
        >
          {isSubmitting ? t("modals.creatingRoom") : t("modals.createRoomBtn")}
        </button>
      </div>
    </ModalShell>
  );
}
