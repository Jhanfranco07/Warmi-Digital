import { MobileNavigation, Sidebar } from "@/shared/components/navigation/sidebar";
import { ConversationRepository } from "@/shared/repositories/conversation.repository";
import { NotificationRepository } from "@/shared/repositories/notification.repository";
import { requireRole } from "@/shared/server/auth/helpers";

export default async function ArtisanLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("ARTESANA");
  const [unreadNotifications, unreadMessages] = await Promise.all([
    new NotificationRepository().countUnread(session.user.id),
    new ConversationRepository().countUnreadForUser(session.user.id)
  ]);
  const badges = {
    notifications: unreadNotifications,
    messages: unreadMessages
  };

  return (
    <div className="warmi-module-shell min-h-screen bg-surface">
      <MobileNavigation role="ARTESANA" badges={badges} />
      <Sidebar role="ARTESANA" badges={badges} />
      <main className="min-h-screen pb-[calc(6.5rem+env(safe-area-inset-bottom))] lg:pb-0 lg:pl-72">
        {children}
      </main>
    </div>
  );
}
