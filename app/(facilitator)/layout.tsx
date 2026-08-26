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
      <MobileNavigation role="FACILITADORA" badges={badges} />
      <Sidebar role="FACILITADORA" badges={badges} />
      <main className="min-h-screen lg:pl-72">{children}</main>
    </div>
  );
}
