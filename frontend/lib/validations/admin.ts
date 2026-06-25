import * as z from "zod";
import { iranianPhoneSchema, passwordSchema } from "./auth";

export const adminCreateUserSchema = z.object({
  display_name: z.string().min(2, "نام نمایشی حداقل ۲ کاراکتر"),
  phone_number: iranianPhoneSchema,
  password: passwordSchema,
  role: z.enum(["user", "admin", "superadmin"]),
  subscription_plan: z.enum(["free", "premium"]),
});

export const adminEditUserSchema = z.object({
  display_name: z.string().min(2, "نام نمایشی حداقل ۲ کاراکتر"),
  phone_number: iranianPhoneSchema,
  role: z.enum(["user", "admin", "superadmin"]),
  subscription_plan: z.enum(["free", "premium"]),
  is_active: z.boolean(),
});

export const adminPlanSchema = z.object({
  slug: z.string().optional(),
  name: z.string().min(2, "نام پلن الزامی است"),
  description: z.string().optional(),
  price: z.number().min(0),
  currency: z.string().min(1),
  duration_days: z.number().min(0),
  features: z.string().optional(),
  is_active: z.boolean(),
});

export const adminDiscountSchema = z.object({
  code: z
    .string()
    .min(3, "کد حداقل ۳ کاراکتر")
    .max(32)
    .regex(/^[A-Za-z0-9_-]+$/, "فقط حروف انگلیسی، عدد، _ و -"),
  description: z.string().optional(),
  discount_type: z.enum(["percent", "fixed"]),
  discount_percent: z.number().min(0).max(100).optional(),
  discount_amount: z.number().min(0).optional(),
  max_uses: z.number().min(0),
  valid_from: z.string().min(1, "تاریخ شروع الزامی است"),
  valid_until: z.string().min(1, "تاریخ پایان الزامی است"),
  is_active: z.boolean(),
});

export const userReportSchema = z.object({
  target_type: z.enum(["user", "room", "video", "message"]),
  target_id: z.string().min(1, "شناسه هدف الزامی است"),
  reason: z.string().min(5, "دلیل گزارش حداقل ۵ کاراکتر"),
});

export type AdminCreateUserForm = z.infer<typeof adminCreateUserSchema>;
export type AdminEditUserForm = z.infer<typeof adminEditUserSchema>;
export type AdminPlanForm = z.infer<typeof adminPlanSchema>;
export type AdminDiscountForm = z.infer<typeof adminDiscountSchema>;
