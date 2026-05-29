"use client";

import { ModalShell } from "./modal-shell";
import { Input } from "@/components/ui/input";

interface UpgradePlanModalProps {
  open: boolean;
  onClose: () => void;
}

export function UpgradePlanModal({ open, onClose }: UpgradePlanModalProps) {
  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="ارتقای پلن"
      description="پلن موردنظر را انتخاب و پرداخت را تکمیل کنید."
    >
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2 text-sm">
          <button type="button" className="rounded-xl border border-white/20 px-2 py-2">
            Free
          </button>
          <button type="button" className="rounded-xl border border-primary px-2 py-2 text-primary">
            Pro
          </button>
          <button type="button" className="rounded-xl border border-white/20 px-2 py-2">
            Family
          </button>
        </div>
        <Input placeholder="کد تخفیف" />
        <button type="button" className="w-full rounded-xl bg-primary px-3 py-2 text-sm text-white">
          اتصال به درگاه پرداخت
        </button>
      </div>
    </ModalShell>
  );
}
