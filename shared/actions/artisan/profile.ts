"use server";

import { revalidatePath } from "next/cache";
import { compare, hash } from "bcrypt";
import { FileType } from "@prisma/client";

import { ArtisanRepository } from "@/shared/repositories/artisan.repository";
import { FileRepository } from "@/shared/repositories/file.repository";
import { requireRole } from "@/shared/server/auth/helpers";
import {
  artisanProfileSchema,
  avatarUpdateSchema,
  passwordChangeSchema
} from "@/shared/validations";

type ActionResult = {
  ok: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function updateArtisanProfileAction(
  _previousState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireRole("ARTESANA");
  const craftTypeIds = formData.getAll("craftTypeIds").map(String);
  const parsed = artisanProfileSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    displayName: formData.get("displayName"),
    phone: formData.get("phone"),
    bio: formData.get("bio"),
    communityId: formData.get("communityId"),
    craftTypeIds
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Revisa los datos de tu perfil.",
      errors: parsed.error.flatten().fieldErrors
    };
  }

  await new ArtisanRepository().updateProfile(session.user.id, parsed.data);
  revalidatePath("/artesana/perfil");
  revalidatePath("/artesana/mi-historia");
  revalidatePath("/artesana/dashboard");

  return { ok: true, message: "Perfil actualizado." };
}

export async function updateArtisanAvatarAction(fileId: string): Promise<ActionResult> {
  try {
    const session = await requireRole("ARTESANA");
    const parsed = avatarUpdateSchema.safeParse({ fileId });

    if (!parsed.success) {
      return { ok: false, message: "Selecciona una imagen valida." };
    }

    const file = await new FileRepository().findOwnedByType(
      parsed.data.fileId,
      session.user.id,
      FileType.IMAGE
    );

    if (!file) {
      return { ok: false, message: "La imagen seleccionada no pertenece a tu cuenta." };
    }

    await new ArtisanRepository().updateAvatar(session.user.id, file.url);
    revalidatePath("/artesana/perfil");
    revalidatePath("/artesana/dashboard");

    return { ok: true, message: "Foto actualizada." };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "No fue posible actualizar la foto."
    };
  }
}

export async function changeArtisanPasswordAction(
  _previousState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireRole("ARTESANA");
  const parsed = passwordChangeSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword")
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Revisa los datos de contrasena.",
      errors: parsed.error.flatten().fieldErrors
    };
  }

  const repository = new ArtisanRepository();
  const user = await repository.findProfile(session.user.id);

  if (!user?.passwordHash) {
    return { ok: false, message: "Tu cuenta no tiene contrasena local configurada." };
  }

  const matches = await compare(parsed.data.currentPassword, user.passwordHash);

  if (!matches) {
    return { ok: false, message: "La contrasena actual no es correcta." };
  }

  await repository.updatePasswordHash(
    session.user.id,
    await hash(parsed.data.newPassword, 12)
  );

  return { ok: true, message: "Contrasena actualizada." };
}
