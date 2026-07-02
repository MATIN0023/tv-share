"use client";

import { useRef, useState } from "react";
import { Link2, Cloud, Upload } from "lucide-react";
import { ModalShell } from "./modal-shell";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/providers/i18n-provider";

type UploadTab = "url" | "file" | "cdn";

interface UploadVideoModalProps {
  open: boolean;
  onClose: () => void;
  isSubmitting?: boolean;
  maxSizeMb?: number;
  onSubmit?: (payload: {
    title: string;
    original_url: string;
    source?: UploadTab;
  }) => void | Promise<void>;
}

export function UploadVideoModal({
  open,
  onClose,
  isSubmitting = false,
  maxSizeMb,
  onSubmit,
}: UploadVideoModalProps) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<UploadTab>("url");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const tabs: { id: UploadTab; icon: typeof Link2; label: string }[] = [
    { id: "url", icon: Link2, label: t("modals.uploadTabUrl") },
    { id: "file", icon: Upload, label: t("modals.uploadTabFile") },
    { id: "cdn", icon: Cloud, label: t("modals.uploadTabCdn") },
  ];

  const reset = () => {
    setTitle("");
    setUrl("");
    setFile(null);
    setTab("url");
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;

    let finalUrl = url.trim();

    if (tab === "file") {
      if (!file) return;
      finalUrl = URL.createObjectURL(file);
    }

    if (!finalUrl) return;

    await onSubmit?.({
      title: title.trim(),
      original_url: finalUrl,
      source: tab,
    });
    reset();
    onClose();
  };

  const canSubmit =
    title.trim() && (tab === "file" ? !!file : !!url.trim());

  return (
    <ModalShell
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title={t("dashboard.uploadVideo")}
      description={
        maxSizeMb
          ? t("modals.uploadVideoDescMax", { max: maxSizeMb })
          : t("modals.uploadVideoDesc")
      }
    >
      <div className="mb-4 flex gap-1 rounded-xl border border-white/10 p-1">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition sm:text-sm",
              tab === id
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <Input
          placeholder={t("modals.videoTitle")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {tab === "url" ? (
          <>
            <Input
              placeholder={t("modals.videoUrlPlaceholder")}
              dir="ltr"
              className="text-left"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">{t("modals.uploadUrlHint")}</p>
          </>
        ) : null}

        {tab === "cdn" ? (
          <>
            <Input
              placeholder={t("modals.cdnUrlPlaceholder")}
              dir="ltr"
              className="text-left"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">{t("modals.uploadCdnHint")}</p>
          </>
        ) : null}

        {tab === "file" ? (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,.m3u8"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setFile(f);
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-white/20 py-8 text-sm text-muted-foreground hover:border-primary/40 hover:bg-primary/5"
            >
              <Upload className="size-8 text-primary/70" />
              {file?.name ?? t("modals.chooseFile")}
            </button>
            <p className="text-xs text-muted-foreground">{t("modals.uploadFileHint")}</p>
          </>
        ) : null}

        <button
          type="button"
          disabled={isSubmitting || !canSubmit}
          onClick={handleSubmit}
          className="w-full rounded-xl bg-primary px-3 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {isSubmitting ? t("modals.uploading") : t("modals.registerVideo")}
        </button>
      </div>
    </ModalShell>
  );
}
