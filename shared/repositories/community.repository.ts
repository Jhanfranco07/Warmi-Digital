import { prisma } from "@/shared/server/db/prisma";

export class CommunityRepository {
  constructor(protected readonly db = prisma) {}

  findActive() {
    return this.db.community.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" }
    });
  }

  findCraftTypes() {
    return this.db.craftType.findMany({
      orderBy: { name: "asc" }
    });
  }
}
