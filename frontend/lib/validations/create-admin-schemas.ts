import * as z from "zod";
import type { TranslateFn } from "@/lib/i18n";

export function createAdminSchemas(t: TranslateFn) {
  const iranianPhoneSchema = z
    .string()
    .regex(/^09\d{9}$/, t("validation.phoneInvalid"));

  const passwordSchema = z
    .string()
    .min(8, t("validation.passwordMin"))
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      t("validation.passwordComplexity")
    );

  const adminCreateUserSchema = z.object({
    display_name: z.string().min(2, t("adminValidation.displayNameMin")),
    phone_number: iranianPhoneSchema,
    password: passwordSchema,
    role: z.enum(["user", "admin", "superadmin"]),
    subscription_plan: z.enum(["free", "premium"]),
  });

  const adminEditUserSchema = z.object({
    display_name: z.string().min(2, t("adminValidation.displayNameMin")),
    phone_number: iranianPhoneSchema,
    role: z.enum(["user", "admin", "superadmin"]),
    subscription_plan: z.enum(["free", "premium"]),
    is_active: z.boolean(),
  });

  const adminPlanSchema = z.object({
    slug: z.string().optional(),
    name: z.string().min(2, t("adminValidation.planNameRequired")),
    description: z.string().optional(),
    price: z.number().min(0),
    currency: z.string().min(1),
    duration_days: z.number().min(0),
    features: z.string().optional(),
    is_active: z.boolean(),
  });

  const adminDiscountSchema = z.object({
    code: z
      .string()
      .min(3, t("adminValidation.codeMin"))
      .max(32)
      .regex(/^[A-Za-z0-9_-]+$/, t("adminValidation.codeFormat")),
    description: z.string().optional(),
    discount_type: z.enum(["percent", "fixed"]),
    discount_percent: z.number().min(0).max(100).optional(),
    discount_amount: z.number().min(0).optional(),
    max_uses: z.number().min(0),
    valid_from: z.string().min(1, t("adminValidation.validFromRequired")),
    valid_until: z.string().min(1, t("adminValidation.validUntilRequired")),
    is_active: z.boolean(),
  });

  const userReportSchema = z.object({
    target_type: z.enum(["user", "room", "video", "message"]),
    target_id: z.string().min(1, t("adminValidation.targetIdRequired")),
    reason: z.string().min(5, t("adminValidation.reasonMin")),
  });

  return {
    adminCreateUserSchema,
    adminEditUserSchema,
    adminPlanSchema,
    adminDiscountSchema,
    userReportSchema,
  };
}

export type AdminCreateUserForm = z.infer<
  ReturnType<typeof createAdminSchemas>["adminCreateUserSchema"]
>;
export type AdminEditUserForm = z.infer<
  ReturnType<typeof createAdminSchemas>["adminEditUserSchema"]
>;
export type AdminPlanForm = z.infer<
  ReturnType<typeof createAdminSchemas>["adminPlanSchema"]
>;
export type AdminDiscountForm = z.infer<
  ReturnType<typeof createAdminSchemas>["adminDiscountSchema"]
>;
