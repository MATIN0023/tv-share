"use client";

import { useState } from "react";
import { ModalShell } from "./modal-shell";
import { Input } from "@/components/ui/input";

interface CreateTicketModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (payload: { subject: string; category: string; message: string }) => void;
}

export function CreateTicketModal({ open, onClose, onSubmit }: CreateTicketModalProps) {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("فنی");
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    onSubmit?.({ subject, category, message });
    setSubject("");
    setMessage("");
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="تیکت جدید"
      description="مشکل یا درخواست خود را برای تیم پشتیبانی ارسال کنید."
    >
      <div className="space-y-3">
        <Input
          placeholder="موضوع تیکت"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
        >
          <option value="فنی">فنی</option>
          <option value="مالی">مالی / اشتراک</option>
          <option value="حساب">حساب کاربری</option>
          <option value="گزارش">گزارش تخلف</option>
          <option value="سایر">سایر</option>
        </select>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="شرح کامل مشکل..."
          rows={4}
          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none"
        />
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full rounded-xl bg-primary px-3 py-2 text-sm text-white"
        >
          ارسال تیکت
        </button>
      </div>
    </ModalShell>
  );
}
