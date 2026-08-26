import { NotificationCenter } from "@/shared/components/notifications/notification-center";
import { NotificationRepository } from "@/shared/repositories/notification.repository";
import { requireRole } from "@/shared/server/auth/helpers";

export default async function ArtisanNotificationsPage() {
  const session = await requireRole("ARTESANA");
  const notifications = await new NotificationRepository().findRecentForUser(
    session.user.id,
    30
  );

  return <NotificationCenter role="ARTESANA" notifications={notifications} />;
}
