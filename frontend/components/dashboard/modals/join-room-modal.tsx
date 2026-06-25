"use client";

import { useState } from "react";
import { ModalShell } from "./modal-shell";
import { Input } from "@/components/ui/input";

interface JoinRoomModalProps {
  open: boolean;
  onClose: () => void;
  isSubmitting?: boolean;
  onSubmit?: (code: string) => void | Promise<void>;
  error?: string | null;
}

export function JoinRoomModal({
  open,
  onClose,
  isSubmitting = false,
  onSubmit,
  error,
}: JoinRoomModalProps) {
  const [code, setCode] = useState("");

  const handleSubmit = async () => {
    if (!code.trim()) return;
    await onSubmit?.(code.trim());
    setCode("");
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="پیوستن با کد"
      description="کد دعوت اتاق را وارد کنید."
    >
      <div className="space-y-3">
        <Input
          placeholder="کد دعوت"
          dir="ltr"
          className="text-left"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <button
          type="button"
          disabled={isSubmitting || !code.trim()}
          onClick={handleSubmit}
          className="w-full rounded-xl bg-primary px-3 py-2 text-sm text-white disabled:opacity-50"
        >
          {isSubmitting ? "در حال ورود..." : "ورود به اتاق"}
        </button>
      </div>
    </ModalShell>
  );
}
