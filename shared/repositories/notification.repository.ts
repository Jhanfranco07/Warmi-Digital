import { prisma } from "@/shared/server/db/prisma";

export class NotificationRepository {
  constructor(protected readonly db = prisma) {}

  findRecentForUser(userId: string, take = 6) {
    return this.db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take
    });
  }

  countUnread(userId: string) {
    return this.db.notification.count({
      where: { userId, readAt: null }
    });
  }

  markRead(notificationId: string, userId: string) {
    return this.db.notification.updateMany({
      where: { id: notificationId, userId },
      data: { readAt: new Date() }
    });
  }

  markAllRead(userId: string) {
    return this.db.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() }
    });
  }
}
