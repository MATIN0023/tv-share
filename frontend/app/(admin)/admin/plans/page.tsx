"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdminSectionHeader } from "@/components/admin/admin-section-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AdminConfirmDialog } from "@/components/admin/confirm-dialog";
import { PaginationBar } from "@/components/admin/pagination-bar";
import { LabeledField } from "@/components/admin/labeled-field";
import { Input } from "@/components/ui/input";
import { Power, Pencil, Plus } from "lucide-react";
import {
  useAdminPlans,
  useAdminTransactions,
  useCreateAdminPlan,
  useUpdateAdminPlan,
} from "@/hooks/use-admin";
import { adminPlanSchema, type AdminPlanForm } from "@/lib/validations/admin";
import { formatFaDate } from "@/lib/utils/format-date";
import { slugify } from "@/lib/utils/slugify";
import type { Plan } from "@/lib/api/types";

function PlansPageContent() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || "1");
  const [tab, setTab] = useState<"plans" | "invoices">("plans");
  const [togglePlan, setTogglePlan] = useState<Plan | null>(null);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const plansQ = useAdminPlans();
  const txQ = useAdminTransactions({ page, limit: 15 });
  const createMut = useCreateAdminPlan();
  const updateMut = useUpdateAdminPlan();

  const plans = plansQ.data?.plans ?? [];
  const invoices = txQ.data?.items ?? [];
  const total = txQ.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 15));

  const form = useForm<AdminPlanForm>({
    resolver: zodResolver(adminPlanSchema),
    defaultValues: {
      slug: "",
      name: "",
      description: "",
      price: 0,
      currency: "IRR",
      duration_days: 30,
      features: "",
      is_active: true,
    },
  });

  const planName = form.watch("name");
  const slugPreview = editPlan?.slug ?? slugify(planName || "");

  const openEdit = (plan: Plan) => {
    setEditPlan(plan);
    form.reset({
      slug: plan.slug,
      name: plan.name,
      description: plan.description ?? "",
      price: plan.price,
      currency: plan.currency,
      duration_days: plan.duration_days,
      features: (plan.features ?? []).join(", "),
      is_active: plan.is_active,
    });
  };

  const submitPlan = async (data: AdminPlanForm) => {
    const body = {
      slug: editPlan ? editPlan.slug : slugify(data.name) || undefined,
      name: data.name,
      description: data.description,
      price: data.price,
      currency: data.currency,
      duration_days: data.duration_days,
      features: data.features
        ? data.features.split(",").map((f) => f.trim()).filter(Boolean)
        : [],
      is_active: data.is_active,
    };
    if (editPlan) {
      await updateMut.mutateAsync({ id: editPlan.id, body });
    } else {
      await createMut.mutateAsync(body);
    }
  };

  return (
    <div>
      <AdminSectionHeader
        title="پلن‌ها و فاکتورها"
        description="مدیریت اشتراک‌ها و مشاهده فاکتورهای پرداخت"
        action={
          tab === "plans" ? (
            <button
              type="button"
              onClick={() => {
                setEditPlan(null);
                form.reset({
                  slug: "",
                  name: "",
                  price: 0,
                  currency: "IRR",
                  duration_days: 30,
                  is_active: true,
                });
                setCreateOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-zinc-950"
            >
              <Plus className="size-4" />
              پلن جدید
            </button>
          ) : null
        }
      />

      <div className="mb-4 flex gap-2">
        {(["plans", "invoices"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-lg border px-3 py-2 text-sm ${
              tab === t ? "border-amber-500 text-amber-500" : "border-zinc-700"
            }`}
          >
            {t === "plans" ? "پلن‌ها" : "فاکتورها"}
          </button>
        ))}
      </div>

      {tab === "plans" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {plans.map((plan) => (
            <AdminPanel key={plan.id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold">{plan.name}</p>
                    {plan.slug === "free" ? (
                      <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                        پایه
                      </span>
                    ) : null}
                    {!plan.is_active ? (
                      <span className="rounded bg-red-900/40 px-2 py-0.5 text-xs text-red-300">
                        غیرفعال
                      </span>
                    ) : null}
                  </div>
                  <p className="text-amber-400">
                    {plan.price.toLocaleString("fa-IR")} {plan.currency}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {plan.duration_days} روز · {plan.slug}
                  </p>
                  <p className="mt-2 text-xs text-zinc-400">
                    {(plan.features ?? []).join(" · ") || "—"}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(plan)}
                    className="rounded p-2 text-amber-400 hover:bg-zinc-800"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setTogglePlan(plan)}
                    className={`rounded p-2 hover:bg-zinc-800 ${
                      plan.is_active ? "text-emerald-500" : "text-zinc-600"
                    }`}
                    title={plan.is_active ? "غیرفعال کردن" : "فعال کردن"}
                  >
                    <Power className="size-4" />
                  </button>
                </div>
              </div>
            </AdminPanel>
          ))}
        </div>
      ) : (
        <AdminPanel>
          <table className="w-full text-sm">
            <thead className="text-zinc-500">
              <tr>
                <th className="py-2 text-right">شماره فاکتور</th>
                <th className="py-2 text-right">مبلغ</th>
                <th className="py-2 text-right">تخفیف</th>
                <th className="py-2 text-right">وضعیت</th>
                <th className="py-2 text-right">پلن</th>
                <th className="py-2 text-right">تاریخ</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((t) => (
                <tr key={t.id} className="border-t border-zinc-800">
                  <td className="py-2 font-mono text-xs" dir="ltr">
                    {t.gateway_reference}
                  </td>
                  <td className="py-2">{t.amount.toLocaleString("fa-IR")}</td>
                  <td className="py-2">
                    {t.discount_code
                      ? `${t.discount_code} (${(t.discount_amount ?? 0).toLocaleString("fa-IR")})`
                      : "—"}
                  </td>
                  <td className="py-2">{t.status}</td>
                  <td className="py-2">{t.plan_slug ?? "—"}</td>
                  <td className="py-2 text-xs text-zinc-500">
                    {formatFaDate(t.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <PaginationBar page={page} totalPages={totalPages} total={total} />
        </AdminPanel>
      )}

      <AdminConfirmDialog
        open={!!togglePlan}
        onClose={() => setTogglePlan(null)}
        title={togglePlan?.is_active ? "غیرفعال کردن پلن" : "فعال کردن پلن"}
        description={`پلن «${togglePlan?.name}» ${togglePlan?.is_active ? "غیرفعال" : "فعال"} شود؟`}
        variant={togglePlan?.is_active ? "danger" : "primary"}
        confirmLabel="تأیید"
        onConfirm={async () => {
          if (!togglePlan) return;
          await updateMut.mutateAsync({
            id: togglePlan.id,
            body: { is_active: !togglePlan.is_active },
          });
        }}
      />

      <AdminConfirmDialog
        open={createOpen || !!editPlan}
        onClose={() => {
          setCreateOpen(false);
          setEditPlan(null);
        }}
        title={editPlan ? "ویرایش پلن" : "پلن جدید"}
        confirmLabel="ذخیره"
        onConfirm={form.handleSubmit(submitPlan)}
      >
        <div className="max-h-[70vh] space-y-3 overflow-y-auto text-sm">
          <LabeledField
            label="نام پلن"
            hint="عنوانی که کاربر در صفحه اشتراک می‌بیند — مثال: پریمیوم ماهانه"
            error={form.formState.errors.name?.message}
          >
            <Input className="border-zinc-700 bg-zinc-950" {...form.register("name")} />
          </LabeledField>

          <LabeledField
            label="شناسه پلن (slug)"
            hint="به‌صورت خودکار از نام ساخته می‌شود — در API و کدهای تخفیف استفاده می‌شود"
          >
            <Input
              dir="ltr"
              disabled
              className="border-zinc-700 bg-zinc-950 text-zinc-400"
              value={slugPreview || "—"}
              readOnly
            />
          </LabeledField>

          <LabeledField
            label="توضیح کوتاه"
            hint="یک جمله بازاریابی زیر نام پلن — مثال: «تمام امکانات بدون محدودیت»"
          >
            <Input className="border-zinc-700 bg-zinc-950" {...form.register("description")} />
          </LabeledField>

          <LabeledField
            label="قیمت (تومان)"
            hint="مبلغی که کاربر برای خرید این اشتراک می‌پردازد"
            error={form.formState.errors.price?.message}
          >
            <Input
              type="number"
              min={0}
              className="border-zinc-700 bg-zinc-950"
              {...form.register("price", { valueAsNumber: true })}
            />
          </LabeledField>

          <LabeledField
            label="مدت اشتراک (روز)"
            hint="مثال: ۳۰ یعنی یک ماهه"
            error={form.formState.errors.duration_days?.message}
          >
            <Input
              type="number"
              min={1}
              className="border-zinc-700 bg-zinc-950"
              {...form.register("duration_days", { valueAsNumber: true })}
            />
          </LabeledField>

          <LabeledField
            label="ویژگی‌ها"
            hint="لیست مزایا که روی کارت پلن نمایش داده می‌شود — هر مورد را با کاما جدا کنید. مثال: ویدیو نامحدود, اتاق خصوصی, بدون تبلیغ"
          >
            <Input className="border-zinc-700 bg-zinc-950" {...form.register("features")} />
          </LabeledField>

          <label className="flex items-center gap-2">
            <input type="checkbox" {...form.register("is_active")} />
            پلن فعال و قابل خرید است
          </label>
        </div>
      </AdminConfirmDialog>
    </div>
  );
}

export default function AdminPlansPage() {
  return (
    <Suspense>
      <PlansPageContent />
    </Suspense>
  );
}
