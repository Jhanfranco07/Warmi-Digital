import { prisma } from "@/shared/server/db/prisma";

export class CommunityRepository {
  constructor(protected readonly db = prisma) {}

  findActive() {
    return this.db.community.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" }
    });
  }

  findByIdWithProfiles(id: string) {
    return this.db.community.findFirst({
      where: { id, deletedAt: null },
      include: {
        profiles: {
          where: { deletedAt: null },
          include: {
            craftTypes: { include: { craftType: true } },
            user: true
          },
          orderBy: { displayName: "asc" }
        }
      }
    });
  }

  findCraftTypes() {
    return this.db.craftType.findMany({
      orderBy: { name: "asc" }
    });
  }
}
