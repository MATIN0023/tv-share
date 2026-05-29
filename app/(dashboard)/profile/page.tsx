 "use client";

import { useState } from "react";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { SectionHeader } from "@/components/dashboard/section-header";
import { ShieldCheck, Bell, Smartphone } from "lucide-react";
import { PhoneInputField } from "@/components/forms/phone-input-field";
import { PasswordField } from "@/components/forms/password-field";
import { ConfirmActionModal } from "@/components/dashboard/modals/confirm-action-modal";
import { Input } from "@/components/ui/input";

export default function ProfilePage() {
  const [passwordModal, setPasswordModal] = useState(false);

  return (
    <div>
      <SectionHeader
        title="پروفایل"
        description="مدیریت اطلاعات کاربری، تصویر پروفایل و تنظیمات شخصی."
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassPanel title="Account" description="آواتار، نام نمایشی و شماره موبایل">
          <div className="mt-3 space-y-2">
            <Input placeholder="نام نمایشی" defaultValue="علی رضایی" />
            <PhoneInputField value="09123456789" />
          </div>
        </GlassPanel>
        <GlassPanel title="امنیت حساب" description="تایید دومرحله‌ای غیرفعال است.">
          <div className="mt-3 inline-flex items-center gap-2 text-sm text-amber-500">
            <ShieldCheck className="size-4" />
            پیشنهاد: فعال‌سازی 2FA
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
            آخرین اعلان: ۱۰ دقیقه پیش
          </div>
        </GlassPanel>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:mt-6 xl:grid-cols-2">
        <GlassPanel title="مدیریت دستگاه‌ها" description="دستگاه‌های متصل به حساب کاربری شما.">
          <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 px-3 py-2 text-sm">
            <span className="inline-flex items-center gap-2">
              <Smartphone className="size-4" />
              iPhone 15 Pro
            </span>
            <span className="text-emerald-500">فعال</span>
          </div>
        </GlassPanel>
        <GlassPanel
          title="Room Defaults & Privacy"
          description="تنظیمات پیش‌فرض چت، میکروفن و دسترسی دعوت."
        >
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
        description="در نسخه API این فرم با اعتبارسنجی کامل و ارسال OTP تکمیل می‌شود."
        confirmLabel="ثبت تغییرات"
      />
    </div>
  );
}
