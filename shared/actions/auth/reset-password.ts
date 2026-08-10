"use server";

import { hash } from "bcrypt";

import type { AuthActionState } from "@/shared/actions/auth/login";
import { prisma } from "@/shared/server/db/prisma";
import { resetPasswordSchema } from "@/shared/lib/auth-schemas";

export async function resetPassword(formData: FormData): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword")
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Revisa la nueva contrasena.",
      errors: parsed.error.flatten().fieldErrors
    };
  }

  const reset = await prisma.passwordResetToken.findUnique({
    where: { token: parsed.data.token }
  });

  if (!reset || reset.expiresAt < new Date() || reset.usedAt) {
    return {
      success: false,
      message: "El enlace de restablecimiento no es valido o expiro."
    };
  }

  const passwordHash = await hash(parsed.data.password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: reset.userId },
      data: { passwordHash }
    }),
    prisma.passwordResetToken.update({
      where: { token: parsed.data.token },
      data: { usedAt: new Date() }
    })
  ]);

  return {
    success: true,
    message: "Contrasena restablecida correctamente.",
    redirectTo: "/login"
  };
}
