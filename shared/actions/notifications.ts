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

function revalidateNotificationSurfaces() {
  notificationPaths.forEach((path) => revalidatePath(path));
  revalidatePath("/artesana", "layout");
  revalidatePath("/facilitadora", "layout");
}

export async function markNotificationReadAction(formData: FormData) {
  const session = await requireAuth();
  const notificationId = String(formData.get("notificationId") ?? "");

  if (!notificationId) {
    return;
  }

  await new NotificationRepository().markRead(notificationId, session.user.id);
  revalidateNotificationSurfaces();
}

export async function markAllNotificationsReadAction() {
  const session = await requireAuth();

  await new NotificationRepository().markAllRead(session.user.id);
  revalidateNotificationSurfaces();
}
