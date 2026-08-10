"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/shared/server/auth/auth";
import {
  getDefaultRouteForRole,
  getRequiredRolesForPath,
  hasRole
} from "@/shared/server/auth/rbac";
import { loginSchema } from "@/shared/lib/auth-schemas";
import { prisma } from "@/shared/server/db/prisma";

export type AuthActionState = {
  success: boolean;
  message?: string;
  redirectTo?: string;
  resetToken?: string;
  errors?: Record<string, string[]>;
};

export async function login(formData: FormData): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!parsed.success) {
    return {
      success: false,
      message: "Revisa los datos ingresados.",
      errors: parsed.error.flatten().fieldErrors
    };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      redirect: false
    });

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
      include: {
        userRoles: {
          include: { role: true }
        }
      }
    });
    const roles = user?.userRoles.map((assignment) => assignment.role.name) ?? [];
    const requestedPath =
      callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
        ? callbackUrl
        : null;
    const requiredRoles = requestedPath ? getRequiredRolesForPath(requestedPath) : null;
    const redirectTo =
      requestedPath && (!requiredRoles || hasRole({ roles }, requiredRoles))
        ? requestedPath
        : getDefaultRouteForRole(roles[0]);

    return {
      success: true,
      message: "Ingreso exitoso.",
      redirectTo
    };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        message: "Correo o contrasena incorrectos."
      };
    }

    throw error;
  }
}
