"use server";

import { hash } from "bcrypt";
import { revalidatePath } from "next/cache";

import { UserRepository } from "@/shared/repositories/user.repository";
import { requireRole } from "@/shared/server/auth/helpers";
import {
  adminChangeRoleSchema,
  adminCreateUserSchema,
  adminUserIdSchema
} from "@/shared/validations/admin-user-schemas";

export type AdminActionState = {
  ok: boolean;
  message: string;
};

const userRepository = new UserRepository();

function actionResult(ok: boolean, message: string): AdminActionState {
  return { ok, message };
}

function revalidateAdminUsers() {
  revalidatePath("/admin");
  revalidatePath("/admin/usuarios");
}

export async function createAdminUser(
  _previousState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const session = await requireRole("ADMIN");
  const parsed = adminCreateUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    return actionResult(false, parsed.error.issues[0]?.message ?? "Datos invalidos.");
  }

  const existing = await userRepository.findByEmail(parsed.data.email);

  if (existing) {
    return actionResult(false, "Ya existe una cuenta registrada con ese correo.");
  }

  const passwordHash = await hash(parsed.data.password, 10);

  await userRepository.createWithRole({
    name: parsed.data.name,
    email: parsed.data.email,
    passwordHash,
    role: parsed.data.role
  });

  revalidateAdminUsers();

  return actionResult(
    true,
    `Usuario creado correctamente por ${session.user.email ?? "administracion"}.`
  );
}

export async function activateAdminUser(
  _previousState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireRole("ADMIN");
  const parsed = adminUserIdSchema.safeParse({ userId: formData.get("userId") });

  if (!parsed.success) {
    return actionResult(false, "Usuario invalido.");
  }

  await userRepository.activate(parsed.data.userId);
  revalidateAdminUsers();

  return actionResult(true, "Cuenta activada correctamente.");
}

export async function deactivateAdminUser(
  _previousState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const session = await requireRole("ADMIN");
  const parsed = adminUserIdSchema.safeParse({ userId: formData.get("userId") });

  if (!parsed.success) {
    return actionResult(false, "Usuario invalido.");
  }

  if (parsed.data.userId === session.user.id) {
    return actionResult(false, "No puedes desactivar tu propia cuenta administrativa.");
  }

  await userRepository.deactivate(parsed.data.userId);
  revalidateAdminUsers();

  return actionResult(true, "Cuenta desactivada correctamente.");
}

export async function changeAdminUserRole(
  _previousState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const session = await requireRole("ADMIN");
  const parsed = adminChangeRoleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role")
  });

  if (!parsed.success) {
    return actionResult(false, parsed.error.issues[0]?.message ?? "Datos invalidos.");
  }

  if (parsed.data.userId === session.user.id && parsed.data.role !== "ADMIN") {
    return actionResult(false, "No puedes quitarte el rol ADMIN desde este panel.");
  }

  await userRepository.replacePrimaryRole(parsed.data.userId, parsed.data.role);
  revalidateAdminUsers();

  return actionResult(true, "Rol actualizado correctamente.");
}
