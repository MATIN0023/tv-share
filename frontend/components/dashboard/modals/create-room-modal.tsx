"use client";

import { useState } from "react";
import { ModalShell } from "./modal-shell";
import { Input } from "@/components/ui/input";
import { DateTimeField } from "@/components/forms/date-time-field";

interface CreateRoomModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateRoomModal({ open, onClose }: CreateRoomModalProps) {
  const [isPrivate, setIsPrivate] = useState(true);
  const [startAt, setStartAt] = useState("");

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="ساخت اتاق جدید"
      description="تنظیمات اتاق را مشخص کنید."
    >
      <div className="space-y-3">
        <Input placeholder="نام اتاق" />
        <Input placeholder="نام فیلم انتخابی" />
        <DateTimeField value={startAt} onChange={setStartAt} />
        {startAt ? (
          <p className="text-xs text-muted-foreground" dir="ltr">
            ISO: {startAt}
          </p>
        ) : null}
        <div className="flex items-center justify-between rounded-xl border border-white/10 p-3 text-sm">
          <span>نوع اتاق</span>
          <button
            type="button"
            onClick={() => setIsPrivate((prev) => !prev)}
            className="rounded-lg border border-white/20 px-2 py-1"
          >
            {isPrivate ? "خصوصی" : "عمومی"}
          </button>
        </div>
        {isPrivate ? <Input placeholder="رمز اتاق" dir="ltr" className="text-left" /> : null}
        <div className="grid grid-cols-2 gap-2">
          <button type="button" className="rounded-xl border border-white/20 px-3 py-2 text-sm">
            چت فعال
          </button>
          <button type="button" className="rounded-xl border border-white/20 px-3 py-2 text-sm">
            میکروفن فعال
          </button>
        </div>
        <button type="button" className="w-full rounded-xl bg-primary px-3 py-2 text-sm text-white">
          ایجاد اتاق
        </button>
      </div>
    </ModalShell>
  );
}
