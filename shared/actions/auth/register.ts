"use server";

import { UserRole } from "@prisma/client";
import { hash } from "bcrypt";

import type { AuthActionState } from "@/shared/actions/auth/login";
import { prisma } from "@/shared/server/db/prisma";
import { registerSchema } from "@/shared/lib/auth-schemas";

export async function register(formData: FormData): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    displayName: formData.get("displayName"),
    phone: formData.get("phone"),
    locale: formData.get("locale") ?? "es"
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Revisa los datos del registro.",
      errors: parsed.error.flatten().fieldErrors
    };
  }

  const email = parsed.data.email.toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    return {
      success: false,
      message: "Ya existe una cuenta con ese correo."
    };
  }

  const passwordHash = await hash(parsed.data.password, 12);

  await prisma.$transaction(async (tx) => {
    const role = await tx.role.upsert({
      where: { name: UserRole.ARTESANA },
      update: {},
      create: {
        name: UserRole.ARTESANA,
        description: "Rol de artesanas en la plataforma"
      }
    });

    await tx.user.create({
      data: {
        email,
        passwordHash,
        locale: parsed.data.locale,
        profile: {
          create: {
            firstName: parsed.data.firstName,
            lastName: parsed.data.lastName,
            displayName: parsed.data.displayName,
            phone: parsed.data.phone || null,
            locale: parsed.data.locale
          }
        },
        userRoles: {
          create: [{ roleId: role.id }]
        }
      }
    });
  });

  return {
    success: true,
    message: "Registro exitoso. Ahora puedes iniciar sesión.",
    redirectTo: "/login"
  };
}
