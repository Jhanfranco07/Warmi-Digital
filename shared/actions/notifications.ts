"use server";

import { revalidatePath } from "next/cache";

import { NotificationRepository } from "@/shared/repositories/notification.repository";
import { requireAuth } from "@/shared/server/auth/helpers";

const notificationPaths = [
  "/artesana/notificaciones",
  "/facilitadora/notificaciones",
  "/artesana/dashboard",
  "/facilitadora/dashboard"
];

export async function markNotificationReadAction(formData: FormData) {
  const session = await requireAuth();
  const notificationId = String(formData.get("notificationId") ?? "");

  if (!notificationId) {
    return;
  }

  await new NotificationRepository().markRead(notificationId, session.user.id);
  notificationPaths.forEach((path) => revalidatePath(path));
}

export async function markAllNotificationsReadAction() {
  const session = await requireAuth();

  await new NotificationRepository().markAllRead(session.user.id);
  notificationPaths.forEach((path) => revalidatePath(path));
}
