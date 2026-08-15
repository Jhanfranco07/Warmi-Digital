import { AnnouncementRepository } from "@/shared/repositories/announcement.repository";
import { ArtisanRepository } from "@/shared/repositories/artisan.repository";
import { CommunityRepository } from "@/shared/repositories/community.repository";
import { NotificationRepository } from "@/shared/repositories/notification.repository";
import { StoryRepository } from "@/shared/repositories/story.repository";

export class ArtisanCommunityService {
  constructor(
    private readonly artisanRepository = new ArtisanRepository(),
    private readonly communityRepository = new CommunityRepository(),
    private readonly storyRepository = new StoryRepository(),
    private readonly announcementRepository = new AnnouncementRepository(),
    private readonly notificationRepository = new NotificationRepository()
  ) {}

  async getCommunityPage(userId: string) {
    const artisan = await this.artisanRepository.findProfile(userId);
    const communityId = artisan?.profile?.communityId;

    if (!communityId) {
      return {
        artisan,
        community: null,
        stories: [],
        announcements: [],
        unreadNotifications: await this.notificationRepository.countUnread(userId)
      };
    }

    const [community, stories, announcements, unreadNotifications] = await Promise.all([
      this.communityRepository.findByIdWithProfiles(communityId),
      this.storyRepository.findByCommunity(communityId),
      this.announcementRepository.findOpportunities(communityId),
      this.notificationRepository.countUnread(userId)
    ]);

    return {
      artisan,
      community,
      stories,
      announcements: announcements.slice(0, 4),
      unreadNotifications
    };
  }
}
