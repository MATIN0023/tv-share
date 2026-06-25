"use client";

import { useState } from "react";
import { ModalShell } from "./modal-shell";
import { Input } from "@/components/ui/input";

interface UploadVideoModalProps {
  open: boolean;
  onClose: () => void;
  isSubmitting?: boolean;
  maxSizeMb?: number;
  onSubmit?: (payload: { title: string; original_url: string }) => void | Promise<void>;
}

export function UploadVideoModal({
  open,
  onClose,
  isSubmitting = false,
  maxSizeMb,
  onSubmit,
}: UploadVideoModalProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  const handleSubmit = async () => {
    if (!title.trim() || !url.trim()) return;
    await onSubmit?.({ title: title.trim(), original_url: url.trim() });
    setTitle("");
    setUrl("");
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="آپلود ویدیو"
      description={
        maxSizeMb
          ? `عنوان و URL ویدیو را وارد کنید. حداکثر حجم مجاز: ${maxSizeMb} مگابایت`
          : "عنوان و URL ویدیو را وارد کنید."
      }
    >
      <div className="space-y-3">
        <Input
          placeholder="عنوان ویدیو"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Input
          placeholder="URL ویدیو (original_url)"
          dir="ltr"
          className="text-left"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          type="button"
          disabled={isSubmitting || !title.trim() || !url.trim()}
          onClick={handleSubmit}
          className="w-full rounded-xl bg-primary px-3 py-2 text-sm text-white disabled:opacity-50"
        >
          {isSubmitting ? "در حال آپلود..." : "ثبت ویدیو"}
        </button>
      </div>
    </ModalShell>
  );
}
