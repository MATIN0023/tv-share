import * as z from "zod";

export const iranianPhoneSchema = z
  .string()
  .regex(/^09\d{9}$/, "شماره موبایل معتبر نیست (مثال: 09123456789)");

export const passwordSchema = z
  .string()
  .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "رمز عبور باید شامل حروف بزرگ، کوچک و عدد باشد"
  );

export const loginSchema = z.object({
  phone: iranianPhoneSchema,
  password: passwordSchema,
});

export const signupSchema = z
  .object({
    name: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد"),
    phone: iranianPhoneSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "تکرار رمز عبور الزامی است"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "رمز عبور و تکرار آن یکسان نیستند",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
