import { prisma } from "@/shared/server/db/prisma";

export class ArtisanRepository {
  constructor(protected readonly db = prisma) {}

  findProfile(userId: string) {
    return this.db.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            community: true,
            craftTypes: { include: { craftType: true } }
          }
        },
        userBadges: {
          include: { badge: true },
          orderBy: { awardedAt: "desc" },
          take: 5
        }
      }
    });
  }
}
