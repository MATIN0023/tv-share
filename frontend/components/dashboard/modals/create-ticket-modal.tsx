"use client";

import { useState } from "react";
import { ModalShell } from "./modal-shell";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/providers/i18n-provider";

const CATEGORIES = [
  { value: "technical", key: "modals.categoryTechnical" },
  { value: "billing", key: "modals.categoryBilling" },
  { value: "account", key: "modals.categoryAccount" },
  { value: "report", key: "modals.categoryReport" },
  { value: "other", key: "modals.categoryOther" },
] as const;

interface CreateTicketModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (payload: { subject: string; category: string; message: string }) => void;
}

export function CreateTicketModal({ open, onClose, onSubmit }: CreateTicketModalProps) {
  const { t } = useTranslation();
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<string>("technical");
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
      title={t("modals.newTicket")}
      description={t("modals.newTicketDesc")}
    >
      <div className="space-y-3">
        <Input
          placeholder={t("modals.ticketSubject")}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
        >
          {CATEGORIES.map(({ value, key }) => (
            <option key={value} value={value}>
              {t(key)}
            </option>
          ))}
        </select>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("modals.ticketBodyPlaceholder")}
          rows={4}
          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none"
        />
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full rounded-xl bg-primary px-3 py-2 text-sm text-white"
        >
          {t("modals.submitTicket")}
        </button>
      </div>
    </ModalShell>
  );
}
