import { MobileNavigation, Sidebar } from "@/shared/components/navigation/sidebar";
import { ConversationRepository } from "@/shared/repositories/conversation.repository";
import { NotificationRepository } from "@/shared/repositories/notification.repository";
import { requirePermission } from "@/shared/server/auth/helpers";

export default async function FacilitatorLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await requirePermission("ACCESS_FACILITATOR");
  const notificationRepository = new NotificationRepository();
  const [unreadNotifications, unreadMessages, recentNotifications] = await Promise.all([
    notificationRepository.countUnread(session.user.id),
    new ConversationRepository().countUnreadForUser(session.user.id),
    notificationRepository.findRecentForUser(session.user.id, 5)
  ]);
  const badges = {
    notifications: unreadNotifications,
    messages: unreadMessages
  };
  const notificationPreviews = recentNotifications.map((notification) => ({
    id: notification.id,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    readAt: notification.readAt?.toISOString() ?? null,
    createdAt: notification.createdAt.toISOString()
  }));

  return (
    <div className="warmi-module-shell min-h-screen bg-surface">
      <MobileNavigation
        role="FACILITADORA"
        badges={badges}
        notifications={notificationPreviews}
      />
      <Sidebar role="FACILITADORA" badges={badges} />
      <main className="min-h-screen lg:pl-72">{children}</main>
    </div>
  );
}
