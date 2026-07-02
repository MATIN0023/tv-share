"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminSectionHeader } from "@/components/admin/admin-section-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AdminConfirmDialog } from "@/components/admin/confirm-dialog";
import { PaginationBar } from "@/components/admin/pagination-bar";
import { DebouncedSearchField } from "@/components/forms/debounced-search-field";
import { Radio, Trash2, XCircle, Download } from "lucide-react";
import {
  useAdminLiveRooms,
  useAdminRooms,
  useCloseAdminRoom,
  useDeleteAdminRoom,
  useDeleteAdminVideo,
  useExportAdminRoomChat,
} from "@/hooks/use-admin";
import { formatFaDate } from "@/lib/utils/format-date";
import { toast } from "@/lib/toast";
import { useTranslation } from "@/providers/i18n-provider";

function RoomsContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const [searchDraft, setSearchDraft] = useState(search);

  useEffect(() => {
    setSearchDraft(search);
  }, [search]);

  const applySearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) params.set("search", value.trim());
      else params.delete("search");
      params.set("page", "1");
      router.replace(`/admin/rooms?${params.toString()}`);
    },
    [router, searchParams]
  );

  const roomsQ = useAdminRooms({ page, limit: 15, search, status });
  const liveQ = useAdminLiveRooms();
  const closeMut = useCloseAdminRoom();
  const deleteVideo = useDeleteAdminVideo();
  const deleteRoomMut = useDeleteAdminRoom();
  const exportChat = useExportAdminRoomChat();

  const [closeId, setCloseId] = useState<string | null>(null);
  const [deleteRoomId, setDeleteRoomId] = useState<string | null>(null);
  const [deleteVideoId, setDeleteVideoId] = useState<string | null>(null);

  const rooms = roomsQ.data?.items ?? [];
  const live = liveQ.data?.rooms ?? [];
  const total = roomsQ.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 15));

  return (
    <div>
      <AdminSectionHeader
        title={t("adminPages.roomsContentTitle")}
        description={t("adminPages.roomsContentDesc")}
      />

      <AdminPanel
        title={`${t("adminPages.liveRoomsCount")}${live.length})`}
        className="mb-4"
      >
        <div className="space-y-2">
          {live.length ? (
            live.map((room) => (
              <div
                key={room.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-emerald-900/40 bg-emerald-950/20 px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-2">
                  <Radio className="size-4 text-emerald-500" />
                  <span className="font-medium">{room.name}</span>
                  <span className="font-mono text-xs text-zinc-500" dir="ltr">
                    {room.id}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-400">
                  <span>{room.is_playing ? t("adminPages.playing") : t("adminPages.stopped")}</span>
                  {room.video_id ? (
                    <button
                      type="button"
                      onClick={() => setDeleteVideoId(String(room.video_id))}
                      className="text-red-400"
                    >
                      {t("adminPages.deleteVideo")}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setCloseId(room.id)}
                    className="text-orange-400"
                  >
                    {t("adminPages.closeRoom")}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-zinc-500">{t("adminPages.noLiveRooms")}</p>
          )}
        </div>
      </AdminPanel>

      <AdminPanel title={t("adminPages.allRooms")}>
        <div className="mb-4">
          <DebouncedSearchField
            placeholder={t("adminPages.searchRoom")}
            value={searchDraft}
            onDebouncedChange={applySearch}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="text-zinc-500">
              <tr>
                <th className="py-2 text-right">{t("tables.userId")}</th>
                <th className="py-2 text-right">{t("tables.name")}</th>
                <th className="py-2 text-right">{t("adminPages.owner")}</th>
                <th className="py-2 text-right">{t("common.status")}</th>
                <th className="py-2 text-right">{t("adminPages.playingCol")}</th>
                <th className="py-2 text-right">{t("activity.targets.video")}</th>
                <th className="py-2 text-right">{t("adminPages.updatedAt")}</th>
                <th className="py-2 text-right">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id} className="border-t border-zinc-800">
                  <td className="py-2 font-mono text-xs" dir="ltr">
                    {room.id.slice(-10)}
                  </td>
                  <td className="py-2">{room.name}</td>
                  <td className="py-2 font-mono text-xs" dir="ltr">
                    {room.owner_id?.slice(-8) ?? t("common.dash")}
                  </td>
                  <td className="py-2">{room.status}</td>
                  <td className="py-2">{room.is_playing ? t("adminPages.yes") : t("adminPages.no")}</td>
                  <td className="py-2 font-mono text-xs" dir="ltr">
                    {room.video_id ? room.video_id.slice(-8) : t("common.dash")}
                  </td>
                  <td className="py-2 text-xs text-zinc-500">
                    {formatFaDate(room.updated_at)}
                  </td>
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        title={t("adminPages.exportChatZip")}
                        onClick={async () => {
                          try {
                            const blob = await exportChat.mutateAsync({
                              id: room.id,
                              format: "csv",
                              zip: true,
                            });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `chat-${room.id.slice(-8)}.zip`;
                            a.click();
                            URL.revokeObjectURL(url);
                            toast.success(t("adminToast.chatDownloaded"));
                          } catch {
                            toast.error(t("adminToast.chatDownloadFailed"));
                          }
                        }}
                        className="text-zinc-400 hover:text-white"
                      >
                        <Download className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCloseId(room.id)}
                        className="text-orange-400"
                        title={t("adminPages.closeRoom")}
                      >
                        <XCircle className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteRoomId(room.id)}
                        className="text-red-400"
                        title={t("adminPages.deleteRoom")}
                      >
                        <Trash2 className="size-4" />
                      </button>
                      {room.video_id ? (
                        <button
                          type="button"
                          onClick={() => setDeleteVideoId(String(room.video_id))}
                          className="text-red-400"
                          title={t("adminPages.deleteVideo")}
                        >
                          <Trash2 className="size-4 opacity-60" />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rooms.length && !roomsQ.isLoading ? (
            <p className="py-6 text-center text-zinc-500">{t("adminPages.noRoomsFound")}</p>
          ) : null}
        </div>
        <PaginationBar page={page} totalPages={totalPages} total={total} />
      </AdminPanel>

      <AdminConfirmDialog
        open={!!closeId}
        onClose={() => setCloseId(null)}
        title={t("adminPages.closeRoom")}
        variant="danger"
        confirmLabel={t("common.close")}
        onConfirm={async () => {
          if (closeId) await closeMut.mutateAsync(closeId);
        }}
      />
      <AdminConfirmDialog
        open={!!deleteRoomId}
        onClose={() => setDeleteRoomId(null)}
        title={t("adminPages.deleteRoom")}
        variant="danger"
        confirmLabel={t("common.delete")}
        onConfirm={async () => {
          if (deleteRoomId) await deleteRoomMut.mutateAsync(deleteRoomId);
        }}
      />
      <AdminConfirmDialog
        open={!!deleteVideoId}
        onClose={() => setDeleteVideoId(null)}
        title={t("adminPages.deleteVideo")}
        variant="danger"
        confirmLabel={t("common.delete")}
        onConfirm={async () => {
          if (deleteVideoId) await deleteVideo.mutateAsync(deleteVideoId);
        }}
      />
    </div>
  );
}

export default function AdminRoomsPage() {
  return (
    <Suspense>
      <RoomsContent />
    </Suspense>
  );
}
