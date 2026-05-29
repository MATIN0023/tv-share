"use client";

import { useState } from "react";
import { AdminSectionHeader } from "@/components/admin/admin-section-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { Input } from "@/components/ui/input";

export default function AdminSettingsPage() {
  const [siteName, setSiteName] = useState("MovieSync");
  const [loginEnabled, setLoginEnabled] = useState(true);
  const [signupEnabled, setSignupEnabled] = useState(true);
  const [maintenance, setMaintenance] = useState(false);

  return (
    <div>
      <AdminSectionHeader
        title="تنظیمات سیستم"
        description="تنظیمات عمومی، ورود/ثبت‌نام و حالت تعمیرات."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AdminPanel title="عمومی">
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
              <label className="text-xs text-zinc-500">URL لوگو</label>
              <Input
                className="mt-1 border-zinc-700 bg-zinc-950"
                placeholder="https://..."
                dir="ltr"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500">قوانین و مقررات</label>
              <textarea
                rows={4}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-sm"
                placeholder="متن قوانین..."
              />
            </div>
            <button
              type="button"
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm text-zinc-950"
            >
              ذخیره تنظیمات
            </button>
          </div>
        </AdminPanel>

        <AdminPanel title="دسترسی و نگهداری">
          <div className="space-y-4">
            <label className="flex items-center justify-between rounded-lg border border-zinc-800 px-3 py-3 text-sm">
              <span>ورود کاربران</span>
              <input
                type="checkbox"
                checked={loginEnabled}
                onChange={(e) => setLoginEnabled(e.target.checked)}
              />
            </label>
            <label className="flex items-center justify-between rounded-lg border border-zinc-800 px-3 py-3 text-sm">
              <span>ثبت‌نام جدید</span>
              <input
                type="checkbox"
                checked={signupEnabled}
                onChange={(e) => setSignupEnabled(e.target.checked)}
              />
            </label>
            <label className="flex items-center justify-between rounded-lg border border-amber-900/40 bg-amber-950/20 px-3 py-3 text-sm">
              <span>حالت تعمیرات (Maintenance)</span>
              <input
                type="checkbox"
                checked={maintenance}
                onChange={(e) => setMaintenance(e.target.checked)}
              />
            </label>
            {maintenance ? (
              <p className="text-xs text-amber-400">
                در این حالت کاربران عادی به سایت دسترسی ندارند؛ فقط ادمین.
              </p>
            ) : null}
          </div>
        </AdminPanel>
      </div>
    </div>
  );
}
