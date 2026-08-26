import { MobileNavigation, Sidebar } from "@/shared/components/navigation/sidebar";
import { ConversationRepository } from "@/shared/repositories/conversation.repository";
import { NotificationRepository } from "@/shared/repositories/notification.repository";
import { requireRole } from "@/shared/server/auth/helpers";

export default async function ArtisanLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("ARTESANA");
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
        role="ARTESANA"
        badges={badges}
        notifications={notificationPreviews}
      />
      <Sidebar role="ARTESANA" badges={badges} />
      <main className="min-h-screen pb-[calc(6.5rem+env(safe-area-inset-bottom))] lg:pb-0 lg:pl-72">
        {children}
      </main>
    </div>
  );
}
