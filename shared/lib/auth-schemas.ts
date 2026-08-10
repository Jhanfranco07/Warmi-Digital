import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email({ message: "Ingresa un correo valido." })
  .max(254, "El correo es demasiado largo.");

export const passwordSchema = z
  .string()
  .min(8, "La contrasena debe tener al menos 8 caracteres.")
  .max(128, "La contrasena es demasiado larga.")
  .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, "La contrasena debe incluir letras y numeros.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "La contrasena es requerida.")
});

export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "La confirmacion es requerida."),
    firstName: z.string().trim().min(2, "El nombre es requerido.").max(80),
    lastName: z.string().trim().min(2, "El apellido es requerido.").max(80),
    displayName: z.string().trim().min(2, "El nombre visible es requerido.").max(140),
    phone: z.string().trim().max(40).optional(),
    locale: z.string().trim().min(2).max(8).default("es")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contrasenas deben coincidir.",
    path: ["confirmPassword"]
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "El token es requerido."),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "La confirmacion es requerida.")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contrasenas deben coincidir.",
    path: ["confirmPassword"]
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "La contrasena actual es requerida."),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "La confirmacion es requerida.")
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contrasenas deben coincidir.",
    path: ["confirmPassword"]
  });

export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(2, "El nombre es requerido.").max(80),
  lastName: z.string().trim().min(2, "El apellido es requerido.").max(80),
  displayName: z.string().trim().min(2, "El nombre visible es requerido.").max(140),
  phone: z.string().trim().max(40).optional(),
  locale: z.string().trim().min(2).max(8).optional()
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
