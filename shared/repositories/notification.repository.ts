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
}
