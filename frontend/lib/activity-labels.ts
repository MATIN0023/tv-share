/** Persian labels for audit / activity log actions. */
export const ACTIVITY_ACTION_LABELS: Record<string, string> = {
  login: "ورود به حساب",
  report_create: "ثبت گزارش تخلف",
  user_create: "ایجاد کاربر",
  user_update: "ویرایش کاربر",
  user_delete: "حذف کاربر",
  user_ban: "مسدودسازی کاربر",
  user_unban: "رفع مسدودیت کاربر",
  user_reset_password: "تغییر رمز کاربر",
  plan_create: "ایجاد پلن",
  plan_update: "ویرایش پلن",
  discount_create: "ایجاد کد تخفیف",
  discount_update: "ویرایش کد تخفیف",
  discount_delete: "حذف کد تخفیف",
  room_close: "بستن اتاق",
  maintenance_toggle: "تغییر حالت تعمیرات",
  settings_update: "به‌روزرسانی تنظیمات",
  report_resolve: "رسیدگی به گزارش",
};

export const TARGET_TYPE_LABELS: Record<string, string> = {
  user: "کاربر",
  room: "اتاق",
  video: "ویدیو",
  message: "پیام",
  plan: "پلن",
  discount: "کد تخفیف",
  settings: "تنظیمات",
};

export function activityActionLabel(action: string): string {
  return ACTIVITY_ACTION_LABELS[action] ?? action;
}

export function targetTypeLabel(type?: string): string {
  if (!type) return "—";
  return TARGET_TYPE_LABELS[type] ?? type;
}
