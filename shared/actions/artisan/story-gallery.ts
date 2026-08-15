"use server";

import { StoryService } from "@/shared/services/story.service";
import { requireRole } from "@/shared/server/auth/helpers";
import { storyGalleryFileSchema, storyGalleryMoveSchema } from "@/shared/validations";

type ActionResult = {
  ok: boolean;
  message: string;
};

export async function addStoryGalleryImageAction(fileId: string): Promise<ActionResult> {
  try {
    const session = await requireRole("ARTESANA");
    const parsed = storyGalleryFileSchema.safeParse({ fileId });

    if (!parsed.success) {
      return { ok: false, message: "Selecciona una imagen valida." };
    }

    await new StoryService().addGalleryImage(session.user.id, parsed.data.fileId);
    return { ok: true, message: "Imagen agregada a tu galeria." };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "No fue posible agregar la imagen."
    };
  }
}

export async function removeStoryGalleryImageAction(
  fileId: string
): Promise<ActionResult> {
  try {
    const session = await requireRole("ARTESANA");
    const parsed = storyGalleryFileSchema.safeParse({ fileId });

    if (!parsed.success) {
      return { ok: false, message: "Selecciona una imagen valida." };
    }

    await new StoryService().removeGalleryImage(session.user.id, parsed.data.fileId);
    return { ok: true, message: "Imagen retirada de tu galeria." };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "No fue posible retirar la imagen."
    };
  }
}

export async function moveStoryGalleryImageAction(
  fileId: string,
  direction: "up" | "down"
): Promise<ActionResult> {
  try {
    const session = await requireRole("ARTESANA");
    const parsed = storyGalleryMoveSchema.safeParse({ fileId, direction });

    if (!parsed.success) {
      return { ok: false, message: "Selecciona una imagen valida." };
    }

    await new StoryService().moveGalleryImage(
      session.user.id,
      parsed.data.fileId,
      parsed.data.direction
    );
    return { ok: true, message: "Galeria ordenada." };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "No fue posible ordenar la galeria."
    };
  }
}
