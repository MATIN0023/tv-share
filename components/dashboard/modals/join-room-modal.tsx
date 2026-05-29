"use client";

import { ModalShell } from "./modal-shell";
import { Input } from "@/components/ui/input";

interface JoinRoomModalProps {
  open: boolean;
  onClose: () => void;
}

export function JoinRoomModal({ open, onClose }: JoinRoomModalProps) {
  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="پیوستن با کد"
      description="کد اتاق را وارد کنید."
    >
      <div className="space-y-3">
        <Input placeholder="کد ۶ رقمی اتاق" dir="ltr" className="text-left" />
        <button type="button" className="w-full rounded-xl bg-primary px-3 py-2 text-sm text-white">
          ورود به اتاق
        </button>
      </div>
    </ModalShell>
  );
}
