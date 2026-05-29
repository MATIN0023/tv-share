"use client";

import { useMemo, useState } from "react";
import { AdminSectionHeader } from "@/components/admin/admin-section-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { SearchField } from "@/components/forms/search-field";
import { ConfirmActionModal } from "@/components/dashboard/modals/confirm-action-modal";
import { Input } from "@/components/ui/input";
import { UserPlus, Ban, Pencil, Gift } from "lucide-react";

type UserRow = {
  id: string;
  name: string;
  phone: string;
  role: "user" | "admin";
  plan: string;
  status: "فعال" | "محدود";
};

const initialUsers: UserRow[] = [
  { id: "u1", name: "علی رضایی", phone: "09123456789", role: "user", plan: "طلایی", status: "فعال" },
  { id: "u2", name: "مهدی موسوی", phone: "09121112222", role: "user", plan: "پایه", status: "فعال" },
  { id: "u3", name: "مدیر سیستم", phone: "09120000000", role: "admin", plan: "—", status: "فعال" },
  { id: "u4", name: "کاربر مشکوک", phone: "09309998877", role: "user", plan: "پایه", status: "محدود" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [banOpen, setBanOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({ name: "", phone: "", plan: "پایه" });

  const pageSize = 10;
  const filtered = useMemo(
    () =>
      users.filter(
        (u) =>
          u.name.includes(search) ||
          u.phone.includes(search) ||
          u.id.includes(search)
      ),
    [users, search]
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <AdminSectionHeader
        title="مدیریت کاربران"
        description="جستجو، CRUD، تغییر نقش، بن و تخصیص پلن."
        action={
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-zinc-950"
          >
            <UserPlus className="size-4" />
            کاربر جدید
          </button>
        }
      />

      <AdminPanel>
        <div className="mb-4">
          <SearchField
            placeholder="جستجو نام، موبایل، شناسه..."
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
          />
        </div>

        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-zinc-800/50 text-zinc-500">
              <tr>
                <th className="px-3 py-2 text-right">نام</th>
                <th className="px-3 py-2 text-right">موبایل</th>
                <th className="px-3 py-2 text-right">نقش</th>
                <th className="px-3 py-2 text-right">پلن</th>
                <th className="px-3 py-2 text-right">وضعیت</th>
                <th className="px-3 py-2 text-right">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((user) => (
                <tr key={user.id} className="border-t border-zinc-800">
                  <td className="px-3 py-2">{user.name}</td>
                  <td className="px-3 py-2" dir="ltr">
                    {user.phone}
                  </td>
                  <td className="px-3 py-2">{user.role === "admin" ? "ادمین" : "کاربر"}</td>
                  <td className="px-3 py-2">{user.plan}</td>
                  <td className="px-3 py-2">{user.status}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className="text-xs text-zinc-400 hover:text-amber-400">
                        <Pencil className="inline size-3" /> ویرایش
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setUsers((prev) =>
                            prev.map((u) =>
                              u.id === user.id ? { ...u, plan: "طلایی (هدیه)" } : u
                            )
                          )
                        }
                        className="text-xs text-emerald-500"
                      >
                        <Gift className="inline size-3" /> هدیه پلن
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedId(user.id);
                          setBanOpen(true);
                        }}
                        className="text-xs text-red-400"
                      >
                        <Ban className="inline size-3" /> بن
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-zinc-500">
          <span>
            صفحه {page} از {totalPages} — {filtered.length} کاربر
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded border border-zinc-700 px-2 py-1 disabled:opacity-40"
            >
              قبلی
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded border border-zinc-700 px-2 py-1 disabled:opacity-40"
            >
              بعدی
            </button>
          </div>
        </div>
      </AdminPanel>

      {createOpen ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900 p-5">
            <h3 className="font-semibold">افزودن کاربر</h3>
            <div className="mt-4 space-y-3">
              <Input
                placeholder="نام"
                value={newUser.name}
                onChange={(e) => setNewUser((s) => ({ ...s, name: e.target.value }))}
              />
              <Input
                placeholder="09123456789"
                dir="ltr"
                value={newUser.phone}
                onChange={(e) => setNewUser((s) => ({ ...s, phone: e.target.value }))}
              />
              <select
                value={newUser.plan}
                onChange={(e) => setNewUser((s) => ({ ...s, plan: e.target.value }))}
                className="h-8 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 text-sm"
              >
                <option>پایه</option>
                <option>نقره‌ای</option>
                <option>طلایی</option>
              </select>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="flex-1 rounded-lg border border-zinc-700 py-2 text-sm"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={() => {
                  setUsers((prev) => [
                    {
                      id: `u${prev.length + 1}`,
                      name: newUser.name,
                      phone: newUser.phone,
                      role: "user",
                      plan: newUser.plan,
                      status: "فعال",
                    },
                    ...prev,
                  ]);
                  setCreateOpen(false);
                  setNewUser({ name: "", phone: "", plan: "پایه" });
                }}
                className="flex-1 rounded-lg bg-amber-500 py-2 text-sm text-zinc-950"
              >
                ذخیره
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmActionModal
        open={banOpen}
        onClose={() => setBanOpen(false)}
        title="مسدودسازی کاربر"
        description="کاربر انتخاب‌شده محدود می‌شود و دسترسی به اتاق‌ها قطع خواهد شد."
        confirmLabel="تایید بن"
      />
    </div>
  );
}
