"use client";

import { useEffect, useState } from "react";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { SectionHeader } from "@/components/dashboard/section-header";
import { ShieldCheck, Bell, Smartphone } from "lucide-react";
import { PhoneInputField } from "@/components/forms/phone-input-field";
import { ConfirmActionModal } from "@/components/dashboard/modals/confirm-action-modal";
import { Input } from "@/components/ui/input";
import { useMe } from "@/hooks/use-me";
import { useMyActivity } from "@/hooks/use-activity";
import { updateProfile } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api";
import { DashboardSkeleton } from "@/components/dashboard/shared/skeleton";
import { ErrorState } from "@/components/dashboard/shared/error-state";
import { formatFaDate } from "@/lib/utils/format-date";
import { activityActionLabel, targetTypeLabel } from "@/lib/activity-labels";
import { toast } from "@/lib/toast";

export default function ProfilePage() {
  const [passwordModal, setPasswordModal] = useState(false);
  const { data: me, isLoading, isError, refetch } = useMe();
  const [displayName, setDisplayName] = useState("");
  const queryClient = useQueryClient();

  const activityQ = useMyActivity({ page: 1, limit: 20 });

  useEffect(() => {
    if (me?.display_name) setDisplayName(me.display_name);
  }, [me?.display_name]);

  const saveProfile = useMutation({
    mutationFn: () => updateProfile({ display_name: displayName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.me });
      toast.success("پروفایل ذخیره شد");
    },
    onError: () => toast.error("ذخیره پروفایل ناموفق بود"),
  });

  if (isLoading) return <DashboardSkeleton />;
  if (isError || !me) {
    return (
      <ErrorState
        title="خطا در بارگذاری پروفایل"
        description="اتصال به سرور برقرار نشد."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div>
      <SectionHeader
        title="پروفایل"
        description="نام نمایشی و اطلاعات حساب"
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassPanel title="Account" description="نام نمایشی و موبایل">
          <div className="mt-3 space-y-2">
            <p className="text-sm text-muted-foreground" dir="ltr">
              {me.phone_number}
            </p>
            <Input
              placeholder="نام نمایشی"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <PhoneInputField value={me.phone_number} />
            <button
              type="button"
              onClick={() => saveProfile.mutate()}
              disabled={saveProfile.isPending}
              className="w-full rounded-xl bg-primary px-3 py-2 text-sm text-white"
            >
              {saveProfile.isPending ? "در حال ذخیره..." : "ذخیره پروفایل"}
            </button>
          </div>
        </GlassPanel>
        <GlassPanel title="امنیت حساب" description={`نقش: ${me.role}`}>
          <div className="mt-3 inline-flex items-center gap-2 text-sm text-amber-500">
            <ShieldCheck className="size-4" />
            پلن: {me.subscription_plan ?? "free"}
          </div>
          <button
            type="button"
            onClick={() => setPasswordModal(true)}
            className="mt-3 w-full rounded-xl border border-white/20 px-3 py-2 text-sm"
          >
            تغییر رمز عبور
          </button>
        </GlassPanel>
        <GlassPanel title="Notifications" description="تنظیمات Push / SMS / In-App">
          <div className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Bell className="size-4" />
            به‌زودی از API
          </div>
        </GlassPanel>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:mt-6 xl:grid-cols-2">
        <GlassPanel title="مدیریت دستگاه‌ها" description="نشست‌های فعال">
          <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 px-3 py-2 text-sm">
            <span className="inline-flex items-center gap-2">
              <Smartphone className="size-4" />
              مرورگر فعلی
            </span>
            <span className="text-emerald-500">فعال</span>
          </div>
        </GlassPanel>
        <GlassPanel title="فعالیت‌های اخیر" description="ورود، گزارش‌ها و اقدامات شما">
          <ul className="mt-3 space-y-2 text-sm">
            {(activityQ.data?.items ?? []).length ? (
              activityQ.data!.items.map((log) => (
                <li
                  key={log.id}
                  className="rounded-xl border border-white/10 px-3 py-2 text-muted-foreground"
                >
                  <span className="text-foreground">{activityActionLabel(log.action)}</span>
                  {log.target_type ? (
                    <span className="mr-2 text-xs">
                      — {targetTypeLabel(log.target_type)}
                    </span>
                  ) : null}
                  <span className="mt-1 block text-xs">{formatFaDate(log.created_at)}</span>
                </li>
              ))
            ) : (
              <li className="text-muted-foreground">فعالیتی ثبت نشده</li>
            )}
          </ul>
        </GlassPanel>
        <GlassPanel title="تنظیمات پیش‌فرض اتاق" description="به‌زودی">
          <div className="mt-3 space-y-2 text-sm text-muted-foreground">
            <p>چت پیش‌فرض: باز برای همه</p>
            <p>Auto-join mic: خاموش</p>
            <p>دعوت: فقط دوستان</p>
          </div>
        </GlassPanel>
      </div>

      <ConfirmActionModal
        open={passwordModal}
        onClose={() => setPasswordModal(false)}
        title="تغییر رمز عبور"
        description="در فاز بعد با OTP یا endpoint اختصاصی تکمیل می‌شود."
        confirmLabel="ثبت تغییرات"
      />
    </div>
  );
}
