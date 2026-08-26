import { NotificationCenter } from "@/shared/components/notifications/notification-center";
import { NotificationRepository } from "@/shared/repositories/notification.repository";
import { requireRole } from "@/shared/server/auth/helpers";

export default async function FacilitatorNotificationsPage() {
  const session = await requireRole("FACILITADORA");
  const notifications = await new NotificationRepository().findRecentForUser(
    session.user.id,
    30
  );

  return <NotificationCenter role="FACILITADORA" notifications={notifications} />;
}
