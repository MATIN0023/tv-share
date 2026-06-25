"use client";

import { useEffect, useState } from "react";
import { AdminSectionHeader } from "@/components/admin/admin-section-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AdminConfirmDialog } from "@/components/admin/confirm-dialog";
import { ToggleSwitch } from "@/components/admin/toggle-switch";
import { Input } from "@/components/ui/input";
import {
  useAdminSettings,
  useSetMaintenanceMode,
  useUpdateAdminSettings,
} from "@/hooks/use-admin";

export default function AdminSettingsPage() {
  const settingsQ = useAdminSettings();
  const updateMut = useUpdateAdminSettings();
  const maintenanceMut = useSetMaintenanceMode();

  const [siteName, setSiteName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportPhone, setSupportPhone] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [maxUpload, setMaxUpload] = useState(500);
  const [maintenanceConfirm, setMaintenanceConfirm] = useState(false);
  const [pendingMaintenance, setPendingMaintenance] = useState(false);

  useEffect(() => {
    if (settingsQ.data) {
      const s = settingsQ.data;
      setSiteName(s.site_name);
      setSupportEmail(s.support_email);
      setSupportPhone(s.support_phone ?? "");
      setAnnouncement(s.announcement_text ?? "");
      setMaxUpload(s.max_upload_size_mb || 500);
    }
  }, [settingsQ.data]);

  const s = settingsQ.data;

  const handleMaintenanceToggle = (enabled: boolean) => {
    setPendingMaintenance(enabled);
    setMaintenanceConfirm(true);
  };

  return (
    <div>
      <AdminSectionHeader
        title="تنظیمات سیستم"
        description="کنترل دسترسی، پرداخت، اعلان‌ها و رفتار کلی پلتفرم"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AdminPanel title="اطلاعات عمومی">
          <div className="space-y-3">
            <div>
              <label className="text-xs text-zinc-500">نام سایت</label>
              <Input
                className="mt-1 border-zinc-700 bg-zinc-950"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500">ایمیل پشتیبانی</label>
              <Input
                className="mt-1 border-zinc-700 bg-zinc-950"
                dir="ltr"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500">تلفن پشتیبانی</label>
              <Input
                className="mt-1 border-zinc-700 bg-zinc-950"
                dir="ltr"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500">اعلان سراسری (نمایش در داشبورد)</label>
              <textarea
                className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                rows={3}
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500">حداکثر حجم آپلود (مگابایت)</label>
              <Input
                type="number"
                className="mt-1 border-zinc-700 bg-zinc-950"
                value={maxUpload}
                onChange={(e) => setMaxUpload(Number(e.target.value))}
              />
            </div>
            <button
              type="button"
              disabled={updateMut.isPending}
              onClick={() =>
                updateMut.mutate({
                  site_name: siteName,
                  support_email: supportEmail,
                  support_phone: supportPhone,
                  announcement_text: announcement,
                  max_upload_size_mb: maxUpload,
                })
              }
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm text-zinc-950 disabled:opacity-50"
            >
              ذخیره تنظیمات عمومی
            </button>
          </div>
        </AdminPanel>

        <AdminPanel title="دسترسی و سرویس‌ها">
          <div className="space-y-3 text-sm">
            <ToggleSwitch
              label="ورود کاربران"
              description="غیرفعال = هیچ کس نمی‌تواند وارد شود"
              checked={s?.login_enabled ?? true}
              disabled={updateMut.isPending}
              onChange={(v) => updateMut.mutate({ login_enabled: v })}
            />
            <ToggleSwitch
              label="ثبت‌نام جدید"
              checked={s?.signup_enabled ?? true}
              disabled={updateMut.isPending}
              onChange={(v) => updateMut.mutate({ signup_enabled: v })}
            />
            <ToggleSwitch
              label="پرداخت آنلاین"
              checked={s?.payment_enabled ?? true}
              disabled={updateMut.isPending}
              onChange={(v) => updateMut.mutate({ payment_enabled: v })}
            />
            <ToggleSwitch
              label="ورود با OTP"
              checked={s?.otp_enabled ?? true}
              disabled={updateMut.isPending}
              onChange={(v) => updateMut.mutate({ otp_enabled: v })}
            />
            <ToggleSwitch
              label="اتاق مهمان"
              checked={s?.allow_guest_rooms ?? true}
              disabled={updateMut.isPending}
              onChange={(v) => updateMut.mutate({ allow_guest_rooms: v })}
            />
            <ToggleSwitch
              label="حالت تعمیرات"
              description="فقط مدیران به API دسترسی دارند"
              danger
              checked={s?.maintenance_mode ?? false}
              disabled={maintenanceMut.isPending}
              onChange={handleMaintenanceToggle}
            />
          </div>
        </AdminPanel>
      </div>

      <AdminConfirmDialog
        open={maintenanceConfirm}
        onClose={() => setMaintenanceConfirm(false)}
        title={pendingMaintenance ? "فعال‌سازی حالت تعمیرات" : "خروج از حالت تعمیرات"}
        description={
          pendingMaintenance
            ? "کاربران عادی نمی‌توانند از سرویس استفاده کنند. ادامه می‌دهید؟"
            : "سرویس برای همه کاربران باز می‌شود."
        }
        variant={pendingMaintenance ? "danger" : "primary"}
        confirmLabel="تأیید"
        onConfirm={async () => {
          await maintenanceMut.mutateAsync(pendingMaintenance);
        }}
      />
    </div>
  );
}
