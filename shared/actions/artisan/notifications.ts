"use server";

import { revalidatePath } from "next/cache";

import { NotificationRepository } from "@/shared/repositories/notification.repository";
import { requireRole } from "@/shared/server/auth/helpers";
import { notificationReadSchema } from "@/shared/validations";

type ActionResult = {
  ok: boolean;
  message: string;
};

export async function markArtisanNotificationReadAction(
  notificationId: string
): Promise<ActionResult> {
  const session = await requireRole("ARTESANA");
  const parsed = notificationReadSchema.safeParse({ notificationId });

  if (!parsed.success) {
    return { ok: false, message: "Selecciona una notificacion valida." };
  }

  await new NotificationRepository().markRead(
    parsed.data.notificationId,
    session.user.id
  );
  revalidatePath("/artesana");
  return { ok: true, message: "Notificacion marcada como leida." };
}

export async function markAllArtisanNotificationsReadAction(): Promise<ActionResult> {
  const session = await requireRole("ARTESANA");
  await new NotificationRepository().markAllRead(session.user.id);
  revalidatePath("/artesana");
  return { ok: true, message: "Notificaciones marcadas como leidas." };
}
