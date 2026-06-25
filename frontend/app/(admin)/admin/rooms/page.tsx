"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminSectionHeader } from "@/components/admin/admin-section-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AdminConfirmDialog } from "@/components/admin/confirm-dialog";
import { PaginationBar } from "@/components/admin/pagination-bar";
import { DebouncedSearchField } from "@/components/forms/debounced-search-field";
import { Radio, Trash2, XCircle } from "lucide-react";
import {
  useAdminLiveRooms,
  useAdminRooms,
  useCloseAdminRoom,
  useDeleteAdminVideo,
} from "@/hooks/use-admin";
import { formatFaDate } from "@/lib/utils/format-date";

function RoomsContent() {
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

  const [closeId, setCloseId] = useState<string | null>(null);
  const [deleteVideoId, setDeleteVideoId] = useState<string | null>(null);

  const rooms = roomsQ.data?.items ?? [];
  const live = liveQ.data?.rooms ?? [];
  const total = roomsQ.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 15));

  return (
    <div>
      <AdminSectionHeader
        title="اتاق‌ها و محتوا"
        description="مشاهده اتاق‌های زنده، مدیریت اتاق‌ها و حذف ویدیو"
      />

      <AdminPanel title={`اتاق‌های زنده (${live.length})`} className="mb-4">
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
                  <span>{room.is_playing ? "در حال پخش" : "متوقف"}</span>
                  {room.video_id ? (
                    <button
                      type="button"
                      onClick={() => setDeleteVideoId(String(room.video_id))}
                      className="text-red-400"
                    >
                      حذف ویدیو
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setCloseId(room.id)}
                    className="text-orange-400"
                  >
                    بستن اتاق
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-zinc-500">اتاق زنده‌ای وجود ندارد</p>
          )}
        </div>
      </AdminPanel>

      <AdminPanel title="همه اتاق‌ها">
        <div className="mb-4">
          <DebouncedSearchField
            placeholder="جستجو نام یا شناسه اتاق..."
            value={searchDraft}
            onDebouncedChange={applySearch}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="text-zinc-500">
              <tr>
                <th className="py-2 text-right">شناسه</th>
                <th className="py-2 text-right">نام</th>
                <th className="py-2 text-right">مالک</th>
                <th className="py-2 text-right">وضعیت</th>
                <th className="py-2 text-right">پخش</th>
                <th className="py-2 text-right">ویدیو</th>
                <th className="py-2 text-right">به‌روزرسانی</th>
                <th className="py-2 text-right">عملیات</th>
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
                    {room.owner_id?.slice(-8) ?? "—"}
                  </td>
                  <td className="py-2">{room.status}</td>
                  <td className="py-2">{room.is_playing ? "بله" : "خیر"}</td>
                  <td className="py-2 font-mono text-xs" dir="ltr">
                    {room.video_id ? room.video_id.slice(-8) : "—"}
                  </td>
                  <td className="py-2 text-xs text-zinc-500">
                    {formatFaDate(room.updated_at)}
                  </td>
                  <td className="py-2">
                    <button
                      type="button"
                      onClick={() => setCloseId(room.id)}
                      className="text-orange-400"
                      title="بستن اتاق"
                    >
                      <XCircle className="size-4" />
                    </button>
                    {room.video_id ? (
                      <button
                        type="button"
                        onClick={() => setDeleteVideoId(String(room.video_id))}
                        className="mr-2 text-red-400"
                        title="حذف ویدیو"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rooms.length && !roomsQ.isLoading ? (
            <p className="py-6 text-center text-zinc-500">اتاقی یافت نشد</p>
          ) : null}
        </div>
        <PaginationBar page={page} totalPages={totalPages} total={total} />
      </AdminPanel>

      <AdminConfirmDialog
        open={!!closeId}
        onClose={() => setCloseId(null)}
        title="بستن اتاق"
        variant="danger"
        confirmLabel="بستن"
        onConfirm={async () => {
          if (closeId) await closeMut.mutateAsync(closeId);
        }}
      />
      <AdminConfirmDialog
        open={!!deleteVideoId}
        onClose={() => setDeleteVideoId(null)}
        title="حذف ویدیو"
        variant="danger"
        confirmLabel="حذف"
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
