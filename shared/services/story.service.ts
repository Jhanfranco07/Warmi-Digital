import { revalidatePath } from "next/cache";
import { FileType } from "@prisma/client";

import { CommunityRepository } from "@/shared/repositories/community.repository";
import { FileRepository } from "@/shared/repositories/file.repository";
import { StoryRepository } from "@/shared/repositories/story.repository";
import { storyFormSchema, type StoryFormInput } from "@/shared/validations";

export class StoryService {
  constructor(
    private readonly storyRepository = new StoryRepository(),
    private readonly communityRepository = new CommunityRepository(),
    private readonly fileRepository = new FileRepository()
  ) {}

  async getStoryPage(userId: string) {
    const [story, communities, craftTypes] = await Promise.all([
      this.storyRepository.findByUser(userId),
      this.communityRepository.findActive(),
      this.communityRepository.findCraftTypes()
    ]);

    return { story, communities, craftTypes };
  }

  async updateStory(userId: string, input: StoryFormInput) {
    const parsed = storyFormSchema.parse(input);
    const coverImageFileId = parsed.coverImageFileId || null;

    if (coverImageFileId) {
      const file = await this.fileRepository.findOwnedByType(
        coverImageFileId,
        userId,
        FileType.IMAGE
      );

      if (!file) {
        throw new Error("La imagen seleccionada no pertenece a tu cuenta.");
      }
    }

    const content = [
      parsed.personalStory,
      parsed.artisanJourney,
      parsed.knowledgeOrigin,
      parsed.culturalMeaning
    ].join("\n\n");

    const story = await this.storyRepository.upsertForUser(userId, {
      ...parsed,
      communityId: parsed.communityId || null,
      craftTypeId: parsed.craftTypeId || null,
      coverImageFileId,
      content
    });

    revalidatePath("/artesana/mi-historia");
    revalidatePath("/artesana/dashboard");

    return story;
  }

  async addGalleryImage(userId: string, fileId: string) {
    const file = await this.fileRepository.findOwnedByType(
      fileId,
      userId,
      FileType.IMAGE
    );

    if (!file) {
      throw new Error("La imagen seleccionada no pertenece a tu cuenta.");
    }

    const relation = await this.storyRepository.addGalleryFile(userId, file.id);
    revalidatePath("/artesana/mi-historia");
    return relation;
  }

  async removeGalleryImage(userId: string, fileId: string) {
    const result = await this.storyRepository.removeGalleryFile(userId, fileId);
    revalidatePath("/artesana/mi-historia");
    return result;
  }

  async moveGalleryImage(userId: string, fileId: string, direction: "up" | "down") {
    const result = await this.storyRepository.moveGalleryFile(userId, fileId, direction);
    revalidatePath("/artesana/mi-historia");
    return result;
  }
}
