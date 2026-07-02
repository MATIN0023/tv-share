"use client";

import { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdminError } from "@/components/admin/admin-error";
import { AdminSectionHeader } from "@/components/admin/admin-section-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AdminConfirmDialog } from "@/components/admin/confirm-dialog";
import { LabeledField } from "@/components/admin/labeled-field";
import { DateTimeField } from "@/components/forms/date-time-field";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  useAdminDiscounts,
  useAdminPlans,
  useCreateAdminDiscount,
  useDeleteAdminDiscount,
  useUpdateAdminDiscount,
} from "@/hooks/use-admin";
import {
  createAdminSchemas,
  type AdminDiscountForm,
} from "@/lib/validations/create-admin-schemas";
import { formatFaDate } from "@/lib/utils/format-date";
import type { DiscountCode } from "@/lib/api/types";
import { useTranslation } from "@/providers/i18n-provider";

export default function AdminCouponsPage() {
  const { t } = useTranslation();
  const discountsQ = useAdminDiscounts();
  const plansQ = useAdminPlans();
  const createMut = useCreateAdminDiscount();
  const updateMut = useUpdateAdminDiscount();
  const deleteMut = useDeleteAdminDiscount();

  const schemas = useMemo(() => createAdminSchemas(t), [t]);

  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<DiscountCode | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [allPlans, setAllPlans] = useState(true);
  const [selectedPlanSlugs, setSelectedPlanSlugs] = useState<string[]>([]);

  const form = useForm<AdminDiscountForm>({
    resolver: zodResolver(schemas.adminDiscountSchema),
    defaultValues: {
      code: "",
      discount_type: "percent",
      discount_percent: 10,
      discount_amount: 50000,
      max_uses: 100,
      valid_from: "",
      valid_until: "",
      is_active: true,
    },
  });

  const discountType = form.watch("discount_type");
  const plans = (plansQ.data?.plans ?? []).filter((p) => p.slug !== "free");
  const discounts = discountsQ.data ?? [];

  const openCreate = () => {
    setEdit(null);
    setAllPlans(true);
    setSelectedPlanSlugs([]);
    form.reset({
      code: "",
      description: "",
      discount_type: "percent",
      discount_percent: 10,
      discount_amount: 50000,
      max_uses: 100,
      valid_from: new Date().toISOString(),
      valid_until: new Date(Date.now() + 30 * 86400000).toISOString(),
      is_active: true,
    });
    setOpen(true);
  };

  const openEdit = (d: DiscountCode) => {
    setEdit(d);
    const slugs = d.plan_slugs ?? [];
    setAllPlans(slugs.length === 0);
    setSelectedPlanSlugs(slugs);
    form.reset({
      code: d.code,
      description: d.description ?? "",
      discount_type: d.discount_type,
      discount_percent: d.discount_percent ?? 10,
      discount_amount: d.discount_amount ?? 0,
      max_uses: d.max_uses,
      valid_from: d.valid_from,
      valid_until: d.valid_until,
      is_active: d.is_active,
    });
    setOpen(true);
  };

  const togglePlanSlug = (slug: string) => {
    setSelectedPlanSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const onSubmit = async (data: AdminDiscountForm) => {
    const body = {
      code: data.code.toUpperCase(),
      description: data.description,
      discount_type: data.discount_type,
      discount_percent: data.discount_type === "percent" ? data.discount_percent ?? 0 : 0,
      discount_amount: data.discount_type === "fixed" ? data.discount_amount ?? 0 : 0,
      max_uses: data.max_uses,
      valid_from: data.valid_from,
      valid_until: data.valid_until,
      plan_slugs: allPlans ? [] : selectedPlanSlugs,
      is_active: data.is_active,
    };
    if (edit) {
      await updateMut.mutateAsync({ id: edit.id, body });
    } else {
      await createMut.mutateAsync(body);
    }
  };

  return (
    <div>
      <AdminSectionHeader
        title={t("adminPages.couponsTitle")}
        description={t("adminPages.couponsDesc")}
        action={
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-zinc-950"
          >
            <Plus className="size-4" />
            {t("adminPages.newCoupon")}
          </button>
        }
      />

      {discountsQ.isError ? (
        <AdminError
          error={discountsQ.error}
          context="admin.coupons"
          onRetry={() => discountsQ.refetch()}
          className="mb-4"
        />
      ) : null}

      <AdminPanel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="text-zinc-500">
              <tr>
                <th className="py-2 text-right">{t("tables.code")}</th>
                <th className="py-2 text-right">{t("tables.type")}</th>
                <th className="py-2 text-right">{t("adminPages.value")}</th>
                <th className="py-2 text-right">{t("adminPages.usage")}</th>
                <th className="py-2 text-right">{t("adminPages.plansCol")}</th>
                <th className="py-2 text-right">{t("adminPages.validity")}</th>
                <th className="py-2 text-right">{t("common.status")}</th>
                <th className="py-2 text-right">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {discounts.map((d) => (
                <tr key={d.id} className="border-t border-zinc-800">
                  <td className="py-2 font-mono text-amber-400" dir="ltr">
                    {d.code}
                  </td>
                  <td className="py-2">
                    {d.discount_type === "percent"
                      ? t("adminPages.percentType")
                      : t("adminPages.fixedAmount")}
                  </td>
                  <td className="py-2">
                    {d.discount_type === "percent"
                      ? `${d.discount_percent}%`
                      : `${(d.discount_amount ?? 0).toLocaleString("fa-IR")} ${t("adminPages.toman")}`}
                  </td>
                  <td className="py-2">
                    {d.used_count} / {d.max_uses || "∞"}
                  </td>
                  <td className="py-2 text-xs">
                    {(d.plan_slugs ?? []).length
                      ? d.plan_slugs!.join(", ")
                      : t("adminPages.allPlans")}
                  </td>
                  <td className="py-2 text-xs text-zinc-500">
                    {formatFaDate(d.valid_from)} — {formatFaDate(d.valid_until)}
                  </td>
                  <td className="py-2">
                    {d.is_active ? t("adminPages.active") : t("adminPages.inactive")}
                  </td>
                  <td className="py-2">
                    <button type="button" onClick={() => openEdit(d)} className="text-amber-400">
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteId(d.id)}
                      className="mr-2 text-red-400"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!discounts.length && !discountsQ.isLoading ? (
            <p className="py-6 text-center text-zinc-500">{t("adminPages.noCoupons")}</p>
          ) : null}
        </div>
      </AdminPanel>

      <AdminConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        title={edit ? t("adminPages.editCoupon") : t("adminPages.newCouponTitle")}
        confirmLabel={t("common.save")}
        onConfirm={form.handleSubmit(onSubmit)}
      >
        <div className="max-h-[70vh] space-y-3 overflow-y-auto text-sm">
          <LabeledField
            label={t("adminPages.couponCode")}
            hint={t("adminPages.couponCodeHint")}
            error={form.formState.errors.code?.message}
          >
            <Input dir="ltr" className="border-zinc-700 bg-zinc-950" {...form.register("code")} />
          </LabeledField>

          <LabeledField
            label={t("adminPages.internalDesc")}
            hint={t("adminPages.internalDescHint")}
          >
            <Input className="border-zinc-700 bg-zinc-950" {...form.register("description")} />
          </LabeledField>

          <LabeledField label={t("adminPages.discountType")}>
            <div className="flex gap-2">
              {(["percent", "fixed"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => form.setValue("discount_type", type)}
                  className={`flex-1 rounded-lg border px-3 py-2 ${
                    discountType === type
                      ? "border-amber-500 text-amber-400"
                      : "border-zinc-700 text-zinc-400"
                  }`}
                >
                  {type === "percent" ? t("adminPages.percentLabel") : t("adminPages.fixedAmount")}
                </button>
              ))}
            </div>
          </LabeledField>

          {discountType === "percent" ? (
            <LabeledField
              label={t("adminPages.discountPercent")}
              hint={t("adminPages.percentRange")}
              error={form.formState.errors.discount_percent?.message}
            >
              <Input
                type="number"
                min={0}
                max={100}
                className="border-zinc-700 bg-zinc-950"
                {...form.register("discount_percent", { valueAsNumber: true })}
              />
            </LabeledField>
          ) : (
            <LabeledField
              label={t("adminPages.discountAmount")}
              hint={t("adminPages.discountAmountHint")}
              error={form.formState.errors.discount_amount?.message}
            >
              <Input
                type="number"
                min={0}
                className="border-zinc-700 bg-zinc-950"
                {...form.register("discount_amount", { valueAsNumber: true })}
              />
            </LabeledField>
          )}

          <LabeledField
            label={t("adminPages.maxUses")}
            hint={t("adminPages.unlimited")}
            error={form.formState.errors.max_uses?.message}
          >
            <Input
              type="number"
              min={0}
              className="border-zinc-700 bg-zinc-950"
              {...form.register("max_uses", { valueAsNumber: true })}
            />
          </LabeledField>

          <Controller
            control={form.control}
            name="valid_from"
            render={({ field }) => (
              <LabeledField label={t("adminPages.validFrom")} error={form.formState.errors.valid_from?.message}>
                <DateTimeField value={field.value} onChange={field.onChange} />
              </LabeledField>
            )}
          />
          <Controller
            control={form.control}
            name="valid_until"
            render={({ field }) => (
              <LabeledField label={t("adminPages.validUntil")} error={form.formState.errors.valid_until?.message}>
                <DateTimeField value={field.value} onChange={field.onChange} />
              </LabeledField>
            )}
          />

          <LabeledField
            label={t("adminPages.planRestriction")}
            hint={t("adminPages.planRestrictionHint")}
          >
            <label className="mb-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={allPlans}
                onChange={(e) => setAllPlans(e.target.checked)}
              />
              {t("adminPages.allPaidPlans")}
            </label>
            {!allPlans ? (
              <div className="space-y-1 rounded-lg border border-zinc-800 p-2">
                {plans.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedPlanSlugs.includes(p.slug)}
                      onChange={() => togglePlanSlug(p.slug)}
                    />
                    {p.name} — {p.price.toLocaleString("fa-IR")} {t("adminPages.toman")}
                  </label>
                ))}
              </div>
            ) : null}
          </LabeledField>

          <label className="flex items-center gap-2">
            <input type="checkbox" {...form.register("is_active")} />
            {t("adminPages.couponActive")}
          </label>
        </div>
      </AdminConfirmDialog>

      <AdminConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title={t("adminPages.deleteCoupon")}
        variant="danger"
        confirmLabel={t("common.delete")}
        onConfirm={async () => {
          if (deleteId) await deleteMut.mutateAsync(deleteId);
        }}
      />
    </div>
  );
}
