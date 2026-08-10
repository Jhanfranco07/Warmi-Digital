"use server";

import { randomBytes } from "crypto";

import type { AuthActionState } from "@/shared/actions/auth/login";
import { prisma } from "@/shared/server/db/prisma";
import { forgotPasswordSchema } from "@/shared/lib/auth-schemas";

export async function requestPasswordReset(formData: FormData): Promise<AuthActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email")
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Ingresa un correo valido.",
      errors: parsed.error.flatten().fieldErrors
    };
  }

  const genericMessage =
    "Si el correo existe, recibiras instrucciones para restablecer la contrasena.";

  const user = await prisma.user.findFirst({
    where: {
      email: parsed.data.email.toLowerCase(),
      deletedAt: null
    }
  });

  if (!user) {
    return {
      success: true,
      message: genericMessage
    };
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt
    }
  });

  return {
    success: true,
    message: genericMessage,
    resetToken: process.env.NODE_ENV === "production" ? undefined : token
  };
}
