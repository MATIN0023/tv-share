"use client";

import { useState, Suspense, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdminError } from "@/components/admin/admin-error";
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
  createAdminSchemas,
  type AdminCreateUserForm,
  type AdminEditUserForm,
} from "@/lib/validations/create-admin-schemas";
import { formatFaDate } from "@/lib/utils/format-date";
import type { UserProfile } from "@/lib/api/types";
import { AppLoader } from "@/components/ui/app-loader";
import { useTranslation } from "@/providers/i18n-provider";

const PAGE_SIZE = 15;

function UsersPageContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";
  const [searchDraft, setSearchDraft] = useState(search);

  const schemas = useMemo(() => createAdminSchemas(t), [t]);

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
    resolver: zodResolver(schemas.adminCreateUserSchema),
    defaultValues: {
      display_name: "",
      phone_number: "",
      password: "",
      role: "user",
      subscription_plan: "free",
    },
  });

  const editForm = useForm<AdminEditUserForm>({
    resolver: zodResolver(schemas.adminEditUserSchema),
  });

  const rows = usersQ.data?.items ?? [];
  const total = usersQ.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const statusBadge = (u: UserProfile) =>
    u.is_active === false ? (
      <span className="text-red-400">{t("adminPages.banned")}</span>
    ) : (
      <span className="text-emerald-400">{t("adminPages.active")}</span>
    );

  return (
    <div>
      <AdminSectionHeader
        title={t("adminPages.usersTitle")}
        description={
          usersQ.isLoading
            ? t("common.loading")
            : `${t("adminPages.showing")} ${rows.length} ${t("adminPages.of")} ${total} ${t("adminPages.userUnit")}`
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
            {t("adminPages.newUser")}
          </button>
        }
      />

      {usersQ.isError ? (
        <AdminError
          error={usersQ.error}
          context="admin.users"
          onRetry={() => usersQ.refetch()}
          className="mb-4"
        />
      ) : null}

      <AdminPanel>
        <div className="mb-4">
          <DebouncedSearchField
            placeholder={t("adminPages.searchUsers")}
            value={searchDraft}
            onDebouncedChange={applySearch}
          />
        </div>

        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          <table className="w-full min-w-[960px] text-sm">
            <thead className="bg-zinc-900 text-zinc-500">
              <tr>
                <th className="px-3 py-2 text-right">{t("tables.userId")}</th>
                <th className="px-3 py-2 text-right">{t("tables.name")}</th>
                <th className="px-3 py-2 text-right">{t("adminPages.mobile")}</th>
                <th className="px-3 py-2 text-right">{t("adminPages.role")}</th>
                <th className="px-3 py-2 text-right">{t("adminPages.plan")}</th>
                <th className="px-3 py-2 text-right">{t("common.status")}</th>
                <th className="px-3 py-2 text-right">{t("adminPages.joinedAt")}</th>
                <th className="px-3 py-2 text-right">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {usersQ.isLoading ? (
                <tr>
                  <td colSpan={8} className="px-3 py-2">
                    <AppLoader variant="inline" className="py-4" showLabel={false} />
                  </td>
                </tr>
              ) : rows.length ? (
                rows.map((u) => (
                  <tr key={u.id} className="border-t border-zinc-800">
                    <td className="px-3 py-2 font-mono text-xs text-zinc-500" dir="ltr">
                      {u.id.slice(-8)}
                    </td>
                    <td className="px-3 py-2">{u.display_name ?? t("common.dash")}</td>
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
                          title={t("adminPages.edit")}
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
                          title={t("adminPages.banUnban")}
                          onClick={() => setBanUser(u)}
                          className="text-orange-400"
                        >
                          <Ban className="size-4" />
                        </button>
                        <button
                          type="button"
                          title={t("adminPages.changePassword")}
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
                          title={t("common.delete")}
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
                    {t("adminPages.noUsersFound")}
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
        title={t("adminPages.createUserTitle")}
        description={t("adminPages.createUserDesc")}
        confirmLabel={t("adminPages.createUser")}
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
            label={t("auth.displayName")}
            error={createForm.formState.errors.display_name?.message}
          >
            <Input className="border-zinc-700 bg-zinc-950" {...createForm.register("display_name")} />
          </LabeledField>
          <LabeledField
            label={t("auth.phone")}
            hint={t("adminPages.phoneFormat")}
            error={createForm.formState.errors.phone_number?.message}
          >
            <Input dir="ltr" className="border-zinc-700 bg-zinc-950" {...createForm.register("phone_number")} />
          </LabeledField>
          <LabeledField
            label={t("auth.password")}
            hint={t("adminPages.passwordHint")}
            error={createForm.formState.errors.password?.message}
          >
            <Input type="password" className="border-zinc-700 bg-zinc-950" {...createForm.register("password")} />
          </LabeledField>
          <LabeledField label={t("adminPages.userRole")}>
            <select className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-2" {...createForm.register("role")}>
              <option value="user">{t("adminPages.regularUser")}</option>
              <option value="admin">{t("adminPages.roleAdmin")}</option>
              <option value="superadmin">{t("adminPages.roleSuperadmin")}</option>
            </select>
          </LabeledField>
          <LabeledField label={t("adminPages.initialPlan")}>
            <select className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-2" {...createForm.register("subscription_plan")}>
              <option value="free">{t("adminPages.free")}</option>
              <option value="premium">{t("adminPages.premium")}</option>
            </select>
          </LabeledField>
        </div>
      </AdminConfirmDialog>

      <AdminConfirmDialog
        open={!!editUser}
        onClose={() => setEditUser(null)}
        title={t("adminPages.editUser")}
        confirmLabel={t("adminPages.saveChanges")}
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
            label={t("auth.displayName")}
            error={editForm.formState.errors.display_name?.message}
          >
            <Input className="border-zinc-700 bg-zinc-950" {...editForm.register("display_name")} />
          </LabeledField>
          <LabeledField
            label={t("auth.phone")}
            error={editForm.formState.errors.phone_number?.message}
          >
            <Input dir="ltr" className="border-zinc-700 bg-zinc-950" {...editForm.register("phone_number")} />
          </LabeledField>
          <LabeledField label={t("adminPages.role")}>
            <select className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-2" {...editForm.register("role")}>
              <option value="user">{t("adminPages.regularUser")}</option>
              <option value="admin">{t("adminPages.roleAdmin")}</option>
              <option value="superadmin">{t("adminPages.roleSuperadmin")}</option>
            </select>
          </LabeledField>
          <LabeledField label={t("adminPages.subscriptionPlan")}>
            <select className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-2" {...editForm.register("subscription_plan")}>
              <option value="free">{t("adminPages.free")}</option>
              <option value="premium">{t("adminPages.premium")}</option>
            </select>
          </LabeledField>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...editForm.register("is_active")} />
            {t("adminPages.accountActive")}
          </label>
        </div>
      </AdminConfirmDialog>

      <AdminConfirmDialog
        open={!!banUser}
        onClose={() => setBanUser(null)}
        title={banUser?.is_active === false ? t("adminPages.unban") : t("adminPages.banUser")}
        description={`${t("adminPages.userPrefix")} ${banUser?.display_name ?? banUser?.phone_number}`}
        variant="danger"
        confirmLabel={banUser?.is_active === false ? t("adminPages.unban") : t("adminPages.ban")}
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
        title={t("adminPages.deleteUser")}
        description={t("adminPages.deleteIrreversible")}
        variant="danger"
        confirmLabel={t("adminPages.deleteConfirm")}
        onConfirm={async () => {
          if (deleteId) await deleteMut.mutateAsync(deleteId);
        }}
      />

      <AdminConfirmDialog
        open={!!resetId}
        onClose={() => setResetId(null)}
        title={t("adminPages.changePasswordTitle")}
        description={t("adminPages.newPasswordHint")}
        confirmLabel={t("adminPages.changePasswordBtn")}
        onConfirm={async () => {
          if (resetId && newPassword.length >= 8) {
            await resetMut.mutateAsync({ id: resetId, password: newPassword });
          }
        }}
      >
        <Input
          type="password"
          placeholder={t("adminPages.newPassword")}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </AdminConfirmDialog>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<AppLoader variant="section" />}>
      <UsersPageContent />
    </Suspense>
  );
}
