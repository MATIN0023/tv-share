"use client";

import { useState } from "react";
import { SectionHeader } from "@/components/dashboard/section-header";
import {
  PlaylistManager,
  RoomRolesModalTrigger,
  VoiceChatIndicator,
} from "@/components/future";
import { useTranslation } from "@/providers/i18n-provider";

/**
 * Preview page for future Phase 3/4 UI components (no backend).
 * Route: /future-ui — remove or protect before production if undesired.
 */
export default function FutureUiPreviewPage() {
  const [showVoice, setShowVoice] = useState(true);
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-4 md:p-8">
      <SectionHeader
        title={t("future.pageTitle")}
        description={t("future.pageDesc")}
      />

      <div className="flex flex-wrap gap-3">
        <RoomRolesModalTrigger />
        <button
          type="button"
          onClick={() => setShowVoice((v) => !v)}
          className="rounded-xl border border-white/20 px-4 py-2 text-sm hover:bg-white/5"
        >
          {showVoice ? t("future.hide") : t("future.show")} {t("future.voiceChat")}
        </button>
      </div>

      <PlaylistManager />

      {showVoice ? (
        <div className="grid gap-4 md:grid-cols-2">
          <VoiceChatIndicator />
          <VoiceChatIndicator compact simulateActivity />
        </div>
      ) : null}
    </div>
  );
}
