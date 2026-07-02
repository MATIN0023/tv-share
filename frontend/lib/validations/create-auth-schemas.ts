import * as z from "zod";
import type { TranslateFn } from "@/lib/i18n";

export function createAuthSchemas(t: TranslateFn) {
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

  const loginSchema = z.object({
    phone: iranianPhoneSchema,
    password: passwordSchema,
  });

  const signupSchema = z
    .object({
      name: z.string().min(2, t("validation.nameMin")),
      phone: iranianPhoneSchema,
      password: passwordSchema,
      confirmPassword: z.string().min(1, t("validation.confirmRequired")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validation.passwordMismatch"),
      path: ["confirmPassword"],
    });

  return { loginSchema, signupSchema };
}

export type LoginFormValues = z.infer<
  ReturnType<typeof createAuthSchemas>["loginSchema"]
>;
export type SignupFormValues = z.infer<
  ReturnType<typeof createAuthSchemas>["signupSchema"]
>;
