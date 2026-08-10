import { prisma } from "@/shared/server/db/prisma";

export class AnnouncementRepository {
  constructor(protected readonly db = prisma) {}

  findOpportunities(communityId?: string | null) {
    const now = new Date();

    return this.db.announcement.findMany({
      where: {
        publishedAt: { not: null, lte: now },
        OR: [{ communityId: null }, { communityId: communityId ?? undefined }]
      },
      include: {
        community: true,
        author: { include: { profile: true } },
        workshop: true
      },
      orderBy: [{ endsAt: "asc" }, { createdAt: "desc" }]
    });
  }

  findManaged(authorId: string) {
    return this.db.announcement.findMany({
      where: { authorId },
      include: { community: true },
      orderBy: { updatedAt: "desc" }
    });
  }
  create(data: Parameters<typeof this.db.announcement.create>[0]["data"]) {
    return this.db.announcement.create({ data });
  }
  update(
    id: string,
    authorId: string,
    data: Parameters<typeof this.db.announcement.update>[0]["data"]
  ) {
    return this.db.announcement.updateMany({ where: { id, authorId }, data });
  }
}
