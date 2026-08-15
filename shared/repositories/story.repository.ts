import { prisma } from "@/shared/server/db/prisma";

export class StoryRepository {
  constructor(protected readonly db = prisma) {}

  findByUser(userId: string) {
    return this.db.story.findFirst({
      where: { userId, deletedAt: null },
      include: {
        community: true,
        craftType: true,
        coverImage: true,
        storyFiles: { include: { file: true }, orderBy: { order: "asc" } }
      },
      orderBy: { updatedAt: "desc" }
    });
  }

  findByCommunity(communityId: string, take = 6) {
    return this.db.story.findMany({
      where: { communityId, deletedAt: null },
      include: {
        user: { include: { profile: true } },
        community: true,
        craftType: true,
        coverImage: true
      },
      orderBy: { updatedAt: "desc" },
      take
    });
  }

  upsertForUser(
    userId: string,
    data: {
      communityId?: string | null;
      craftTypeId?: string | null;
      title: string;
      summary?: string | null;
      content: string;
      publicName?: string | null;
      personalStory?: string | null;
      artisanJourney?: string | null;
      knowledgeOrigin?: string | null;
      learnedFrom?: string | null;
      techniques?: string | null;
      culturalMeaning?: string | null;
      coverImageFileId?: string | null;
    }
  ) {
    return this.db.$transaction(async (tx) => {
      const current = await tx.story.findFirst({
        where: { userId, deletedAt: null },
        select: { id: true, coverImageId: true }
      });

      const storyData = {
        communityId: data.communityId ?? null,
        craftTypeId: data.craftTypeId ?? null,
        title: data.title,
        summary: data.summary ?? null,
        content: data.content,
        publicName: data.publicName ?? null,
        personalStory: data.personalStory ?? null,
        artisanJourney: data.artisanJourney ?? null,
        knowledgeOrigin: data.knowledgeOrigin ?? null,
        learnedFrom: data.learnedFrom ?? null,
        techniques: data.techniques ?? null,
        culturalMeaning: data.culturalMeaning ?? null,
        coverImageId: data.coverImageFileId ?? current?.coverImageId ?? null
      };

      if (current) {
        return tx.story.update({ where: { id: current.id }, data: storyData });
      }

      return tx.story.create({ data: { ...storyData, userId } });
    });
  }

  async addGalleryFile(userId: string, fileId: string) {
    return this.db.$transaction(async (tx) => {
      const story = await tx.story.findFirst({
        where: { userId, deletedAt: null },
        select: { id: true }
      });

      if (!story) {
        throw new Error("Primero guarda tu historia cultural.");
      }

      const last = await tx.storyFile.findFirst({
        where: { storyId: story.id },
        orderBy: { order: "desc" },
        select: { order: true }
      });

      return tx.storyFile.upsert({
        where: { storyId_fileId: { storyId: story.id, fileId } },
        create: {
          storyId: story.id,
          fileId,
          order: (last?.order ?? -1) + 1
        },
        update: {}
      });
    });
  }

  async removeGalleryFile(userId: string, fileId: string) {
    const story = await this.db.story.findFirst({
      where: { userId, deletedAt: null },
      select: { id: true }
    });

    if (!story) return { count: 0 };

    return this.db.storyFile.deleteMany({
      where: { storyId: story.id, fileId }
    });
  }

  async moveGalleryFile(userId: string, fileId: string, direction: "up" | "down") {
    return this.db.$transaction(async (tx) => {
      const current = await tx.storyFile.findFirst({
        where: { fileId, story: { userId, deletedAt: null } }
      });

      if (!current) return null;

      const sibling = await tx.storyFile.findFirst({
        where: {
          storyId: current.storyId,
          order: direction === "up" ? { lt: current.order } : { gt: current.order }
        },
        orderBy: { order: direction === "up" ? "desc" : "asc" }
      });

      if (!sibling) return current;

      await tx.storyFile.update({
        where: { id: current.id },
        data: { order: sibling.order }
      });
      await tx.storyFile.update({
        where: { id: sibling.id },
        data: { order: current.order }
      });

      return current;
    });
  }
}
