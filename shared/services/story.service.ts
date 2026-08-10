import { revalidatePath } from "next/cache";

import { CommunityRepository } from "@/shared/repositories/community.repository";
import { StoryRepository } from "@/shared/repositories/story.repository";
import { storyFormSchema, type StoryFormInput } from "@/shared/validations";

export class StoryService {
  constructor(
    private readonly storyRepository = new StoryRepository(),
    private readonly communityRepository = new CommunityRepository()
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
      coverImageUrl: parsed.coverImageUrl || null,
      content
    });

    revalidatePath("/artesana/mi-historia");
    revalidatePath("/artesana/dashboard");

    return story;
  }
}
