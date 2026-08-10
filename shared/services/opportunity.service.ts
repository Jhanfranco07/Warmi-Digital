import { AnnouncementRepository } from "@/shared/repositories/announcement.repository";

export class OpportunityService {
  constructor(private readonly announcementRepository = new AnnouncementRepository()) {}

  getOpportunities(communityId?: string | null) {
    return this.announcementRepository.findOpportunities(communityId);
  }
}
