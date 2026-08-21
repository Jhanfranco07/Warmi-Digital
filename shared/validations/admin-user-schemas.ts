import { UserRole } from "@prisma/client";
import { z } from "zod";

export const adminUserRoleSchema = z.nativeEnum(UserRole);

export const adminCreateUserSchema = z.object({
  name: z.string().trim().min(2, "Ingresa un nombre."),
  email: z.string().trim().email("Ingresa un correo valido.").toLowerCase(),
  role: adminUserRoleSchema,
  password: z
    .string()
    .min(8, "La contrasena temporal debe tener al menos 8 caracteres.")
});

export const adminChangeRoleSchema = z.object({
  userId: z.string().uuid("Usuario invalido."),
  role: adminUserRoleSchema
});

export const adminUserIdSchema = z.object({
  userId: z.string().uuid("Usuario invalido.")
});
