"use client";

import { useState, Suspense, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdminSectionHeader } from "@/components/admin/admin-section-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AdminConfirmDialog } from "@/components/admin/confirm-dialog";
import { PaginationBar } from "@/components/admin/pagination-bar";
import { DebouncedSearchField } from "@/components/forms/debounced-search-field";
import { LabeledField } from "@/components/admin/labeled-field";
import { Input } from "@/components/ui/input";
import { UserPlus, Pencil, Ban, Trash2, KeyRound } from "lucide-react";
import {
  useAdminUsers,
  useBanAdminUser,
  useCreateAdminUser,
  useDeleteAdminUser,
  useResetAdminUserPassword,
  useUpdateAdminUser,
} from "@/hooks/use-admin";
import {
  adminCreateUserSchema,
  adminEditUserSchema,
  type AdminCreateUserForm,
  type AdminEditUserForm,
} from "@/lib/validations/admin";
import { formatFaDate } from "@/lib/utils/format-date";
import type { UserProfile } from "@/lib/api/types";

const PAGE_SIZE = 15;

function UsersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";
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
      router.replace(`/admin/users?${params.toString()}`);
    },
    [router, searchParams]
  );

  const usersQ = useAdminUsers({ page, limit: PAGE_SIZE, search: search || undefined });
  const createMut = useCreateAdminUser();
  const updateMut = useUpdateAdminUser();
  const banMut = useBanAdminUser();
  const deleteMut = useDeleteAdminUser();
  const resetMut = useResetAdminUserPassword();

  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserProfile | null>(null);
  const [banUser, setBanUser] = useState<UserProfile | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [resetId, setResetId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const createForm = useForm<AdminCreateUserForm>({
    resolver: zodResolver(adminCreateUserSchema),
    defaultValues: {
      display_name: "",
      phone_number: "",
      password: "",
      role: "user",
      subscription_plan: "free",
    },
  });

  const editForm = useForm<AdminEditUserForm>({
    resolver: zodResolver(adminEditUserSchema),
  });

  const rows = usersQ.data?.items ?? [];
  const total = usersQ.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const statusBadge = (u: UserProfile) =>
    u.is_active === false ? (
      <span className="text-red-400">مسدود</span>
    ) : (
      <span className="text-emerald-400">فعال</span>
    );

  return (
    <div>
      <AdminSectionHeader
        title="مدیریت کاربران"
        description={
          usersQ.isLoading
            ? "در حال بارگذاری..."
            : `نمایش ${rows.length} از ${total} کاربر`
        }
        action={
          <button
            type="button"
            onClick={() => {
              createForm.reset();
              setCreateOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-zinc-950"
          >
            <UserPlus className="size-4" />
            کاربر جدید
          </button>
        }
      />

      {usersQ.isError ? (
        <p className="mb-4 text-red-400">
          خطا در بارگذاری کاربران —{" "}
          <button type="button" className="underline" onClick={() => usersQ.refetch()}>
            تلاش مجدد
          </button>
        </p>
      ) : null}

      <AdminPanel>
        <div className="mb-4">
          <DebouncedSearchField
            placeholder="جستجو: نام، موبایل، نقش یا شناسه کاربر..."
            value={searchDraft}
            onDebouncedChange={applySearch}
          />
        </div>

        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          <table className="w-full min-w-[960px] text-sm">
            <thead className="bg-zinc-900 text-zinc-500">
              <tr>
                <th className="px-3 py-2 text-right">شناسه</th>
                <th className="px-3 py-2 text-right">نام</th>
                <th className="px-3 py-2 text-right">موبایل</th>
                <th className="px-3 py-2 text-right">نقش</th>
                <th className="px-3 py-2 text-right">پلن</th>
                <th className="px-3 py-2 text-right">وضعیت</th>
                <th className="px-3 py-2 text-right">تاریخ عضویت</th>
                <th className="px-3 py-2 text-right">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {usersQ.isLoading ? (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-zinc-500">
                    در حال بارگذاری...
                  </td>
                </tr>
              ) : rows.length ? (
                rows.map((u) => (
                  <tr key={u.id} className="border-t border-zinc-800">
                    <td className="px-3 py-2 font-mono text-xs text-zinc-500" dir="ltr">
                      {u.id.slice(-8)}
                    </td>
                    <td className="px-3 py-2">{u.display_name ?? "—"}</td>
                    <td className="px-3 py-2" dir="ltr">
                      {u.phone_number}
                    </td>
                    <td className="px-3 py-2">{u.role}</td>
                    <td className="px-3 py-2">{u.subscription_plan ?? "free"}</td>
                    <td className="px-3 py-2">{statusBadge(u)}</td>
                    <td className="px-3 py-2 text-xs text-zinc-500">
                      {formatFaDate(u.created_at)}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          title="ویرایش"
                          onClick={() => {
                            setEditUser(u);
                            editForm.reset({
                              display_name: u.display_name ?? "",
                              phone_number: u.phone_number,
                              role: (u.role as AdminEditUserForm["role"]) ?? "user",
                              subscription_plan:
                                (u.subscription_plan as AdminEditUserForm["subscription_plan"]) ??
                                "free",
                              is_active: u.is_active !== false,
                            });
                          }}
                          className="text-amber-400"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          type="button"
                          title="مسدود / آزاد"
                          onClick={() => setBanUser(u)}
                          className="text-orange-400"
                        >
                          <Ban className="size-4" />
                        </button>
                        <button
                          type="button"
                          title="تغییر رمز"
                          onClick={() => {
                            setResetId(u.id);
                            setNewPassword("");
                          }}
                          className="text-sky-400"
                        >
                          <KeyRound className="size-4" />
                        </button>
                        <button
                          type="button"
                          title="حذف"
                          onClick={() => setDeleteId(u.id)}
                          className="text-red-400"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-zinc-500">
                    کاربری یافت نشد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <PaginationBar page={page} totalPages={totalPages} total={total} />
      </AdminPanel>

      <AdminConfirmDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="ایجاد کاربر جدید"
        description="اطلاعات کاربر را با دقت وارد کنید"
        confirmLabel="ایجاد کاربر"
        onConfirm={createForm.handleSubmit(async (data) => {
          await createMut.mutateAsync({
            phone_number: data.phone_number,
            password: data.password,
            display_name: data.display_name,
            role: data.role,
            subscription_plan: data.subscription_plan,
          });
        })}
      >
        <div className="space-y-3 text-sm">
          <LabeledField
            label="نام نمایشی"
            error={createForm.formState.errors.display_name?.message}
          >
            <Input className="border-zinc-700 bg-zinc-950" {...createForm.register("display_name")} />
          </LabeledField>
          <LabeledField
            label="شماره موبایل"
            hint="فرمت: 09123456789"
            error={createForm.formState.errors.phone_number?.message}
          >
            <Input dir="ltr" className="border-zinc-700 bg-zinc-950" {...createForm.register("phone_number")} />
          </LabeledField>
          <LabeledField
            label="رمز عبور"
            hint="حداقل ۸ کاراکتر با حروف بزرگ، کوچک و عدد"
            error={createForm.formState.errors.password?.message}
          >
            <Input type="password" className="border-zinc-700 bg-zinc-950" {...createForm.register("password")} />
          </LabeledField>
          <LabeledField label="نقش کاربر">
            <select className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-2" {...createForm.register("role")}>
              <option value="user">کاربر عادی</option>
              <option value="admin">مدیر</option>
              <option value="superadmin">مدیر ارشد</option>
            </select>
          </LabeledField>
          <LabeledField label="پلن اشتراک اولیه">
            <select className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-2" {...createForm.register("subscription_plan")}>
              <option value="free">رایگان</option>
              <option value="premium">پریمیوم</option>
            </select>
          </LabeledField>
        </div>
      </AdminConfirmDialog>

      <AdminConfirmDialog
        open={!!editUser}
        onClose={() => setEditUser(null)}
        title="ویرایش کاربر"
        confirmLabel="ذخیره تغییرات"
        onConfirm={editForm.handleSubmit(async (data) => {
          if (!editUser) return;
          await updateMut.mutateAsync({
            id: editUser.id,
            body: data,
          });
        })}
      >
        <div className="space-y-3 text-sm">
          <LabeledField
            label="نام نمایشی"
            error={editForm.formState.errors.display_name?.message}
          >
            <Input className="border-zinc-700 bg-zinc-950" {...editForm.register("display_name")} />
          </LabeledField>
          <LabeledField
            label="شماره موبایل"
            error={editForm.formState.errors.phone_number?.message}
          >
            <Input dir="ltr" className="border-zinc-700 bg-zinc-950" {...editForm.register("phone_number")} />
          </LabeledField>
          <LabeledField label="نقش">
            <select className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-2" {...editForm.register("role")}>
              <option value="user">کاربر عادی</option>
              <option value="admin">مدیر</option>
              <option value="superadmin">مدیر ارشد</option>
            </select>
          </LabeledField>
          <LabeledField label="پلن اشتراک">
            <select className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-2" {...editForm.register("subscription_plan")}>
              <option value="free">رایگان</option>
              <option value="premium">پریمیوم</option>
            </select>
          </LabeledField>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...editForm.register("is_active")} />
            حساب فعال (غیرفعال = مسدود)
          </label>
        </div>
      </AdminConfirmDialog>

      <AdminConfirmDialog
        open={!!banUser}
        onClose={() => setBanUser(null)}
        title={banUser?.is_active === false ? "رفع مسدودیت" : "مسدود کردن کاربر"}
        description={`کاربر: ${banUser?.display_name ?? banUser?.phone_number}`}
        variant="danger"
        confirmLabel={banUser?.is_active === false ? "رفع مسدودیت" : "مسدود کردن"}
        onConfirm={async () => {
          if (!banUser) return;
          await banMut.mutateAsync({
            id: banUser.id,
            banned: banUser.is_active !== false,
          });
        }}
      />

      <AdminConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="حذف کاربر"
        description="این عملیات غیرقابل بازگشت است."
        variant="danger"
        confirmLabel="حذف قطعی"
        onConfirm={async () => {
          if (deleteId) await deleteMut.mutateAsync(deleteId);
        }}
      />

      <AdminConfirmDialog
        open={!!resetId}
        onClose={() => setResetId(null)}
        title="تغییر رمز عبور"
        description="رمز جدید حداقل ۸ کاراکتر با حروف بزرگ، کوچک و عدد"
        confirmLabel="تغییر رمز"
        onConfirm={async () => {
          if (resetId && newPassword.length >= 8) {
            await resetMut.mutateAsync({ id: resetId, password: newPassword });
          }
        }}
      >
        <Input
          type="password"
          placeholder="رمز جدید"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </AdminConfirmDialog>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<p className="text-zinc-500">در حال بارگذاری...</p>}>
      <UsersPageContent />
    </Suspense>
  );
}
