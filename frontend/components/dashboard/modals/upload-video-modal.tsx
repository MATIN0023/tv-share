"use client";

import { useState } from "react";
import { ModalShell } from "./modal-shell";
import { Input } from "@/components/ui/input";

interface UploadVideoModalProps {
  open: boolean;
  onClose: () => void;
}

export function UploadVideoModal({ open, onClose }: UploadVideoModalProps) {
  const [step, setStep] = useState(1);

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="آپلود ویدیو"
      description={`مرحله ${step} از 3`}
    >
      <div className="space-y-3">
        {step === 1 ? <Input type="file" /> : null}
        {step === 2 ? (
          <>
            <Input placeholder="عنوان ویدیو" />
            <Input placeholder="ژانر" />
            <Input placeholder="URL پوستر" dir="ltr" className="text-left" />
          </>
        ) : null}
        {step === 3 ? (
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">وضعیت آپلود: 63%</p>
            <div className="h-2 rounded-full bg-white/10">
              <div className="h-2 w-2/3 rounded-full bg-primary" />
            </div>
            <p className="text-muted-foreground">Transcoding (HLS): در حال پردازش...</p>
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setStep((prev) => Math.max(1, prev - 1))}
            className="rounded-xl border border-white/20 px-3 py-2 text-sm"
          >
            قبلی
          </button>
          <button
            type="button"
            onClick={() => setStep((prev) => Math.min(3, prev + 1))}
            className="rounded-xl bg-primary px-3 py-2 text-sm text-white"
          >
            بعدی
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
