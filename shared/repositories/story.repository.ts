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
      coverImageUrl?: string | null;
    }
  ) {
    return this.db.$transaction(async (tx) => {
      const current = await tx.story.findFirst({
        where: { userId, deletedAt: null },
        select: { id: true, coverImageId: true }
      });

      let coverImageId: string | null | undefined;

      if (data.coverImageUrl) {
        const file = await tx.file.create({
          data: {
            url: data.coverImageUrl,
            provider: "external",
            type: "IMAGE",
            mimeType: "image/*",
            size: 0,
            ownerId: userId
          }
        });
        coverImageId = file.id;
      }

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
        coverImageId: coverImageId ?? current?.coverImageId ?? null
      };

      if (current) {
        return tx.story.update({ where: { id: current.id }, data: storyData });
      }

      return tx.story.create({ data: { ...storyData, userId } });
    });
  }
}
