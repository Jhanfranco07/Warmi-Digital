import {
  AnnouncementApplicationStatus,
  AnnouncementStatus,
  type Prisma
} from "@prisma/client";

import { AnnouncementRepository } from "@/shared/repositories/announcement.repository";
import type { OpportunityFormInput } from "@/shared/validations";

export class OpportunityService {
  constructor(private readonly announcementRepository = new AnnouncementRepository()) {}

  getOpportunities(communityId?: string | null) {
    return this.announcementRepository.findOpportunities(communityId);
  }

  getAvailableForArtisan(artisanId: string, communityId?: string | null) {
    return this.announcementRepository.findAvailableForArtisan(artisanId, communityId);
  }

  getDetailForArtisan(
    announcementId: string,
    artisanId: string,
    communityId?: string | null
  ) {
    return this.announcementRepository.findAvailableDetailForArtisan(
      announcementId,
      artisanId,
      communityId
    );
  }

  getManagedOpportunities(
    facilitatorId: string,
    filters?: { status?: AnnouncementStatus; query?: string }
  ) {
    return this.announcementRepository.findManaged(facilitatorId, filters);
  }

  getManagedDetail(announcementId: string, facilitatorId: string) {
    return this.announcementRepository.findManagedDetail(announcementId, facilitatorId);
  }

  async create(facilitatorId: string, input: OpportunityFormInput) {
    return this.announcementRepository.create({
      ...this.toAnnouncementData(input),
      authorId: facilitatorId
    });
  }

  async update(facilitatorId: string, input: OpportunityFormInput) {
    if (!input.announcementId) {
      throw new Error("Selecciona una convocatoria para editar.");
    }

    const response = await this.announcementRepository.update(
      input.announcementId,
      facilitatorId,
      this.toAnnouncementData(input)
    );

    if (response.count === 0) {
      throw new Error("No tienes acceso a esta convocatoria.");
    }
  }

  async publish(announcementId: string, facilitatorId: string) {
    const response = await this.announcementRepository.setStatus(
      announcementId,
      facilitatorId,
      AnnouncementStatus.PUBLISHED
    );

    if (response.count === 0) {
      throw new Error("No tienes acceso a esta convocatoria.");
    }
  }

  async close(announcementId: string, facilitatorId: string) {
    const response = await this.announcementRepository.setStatus(
      announcementId,
      facilitatorId,
      AnnouncementStatus.CLOSED
    );

    if (response.count === 0) {
      throw new Error("No tienes acceso a esta convocatoria.");
    }
  }

  async apply(announcementId: string, artisanId: string, communityId?: string | null) {
    const opportunity =
      await this.announcementRepository.findAvailableDetailForArtisan(
        announcementId,
        artisanId,
        communityId
      );

    if (!opportunity) {
      throw new Error("Esta convocatoria no esta disponible para postular.");
    }

    if (opportunity.status !== AnnouncementStatus.PUBLISHED) {
      throw new Error("Esta convocatoria no esta publicada.");
    }

    if (opportunity.endsAt && opportunity.endsAt < new Date()) {
      throw new Error("Esta convocatoria ya cerro.");
    }

    if (opportunity.applications.length > 0) {
      throw new Error("Ya postulaste a esta convocatoria.");
    }

    if (opportunity.spots && opportunity._count.applications >= opportunity.spots) {
      throw new Error("Los cupos de esta convocatoria ya se completaron.");
    }

    return this.announcementRepository.createApplication(announcementId, artisanId);
  }

  async reviewApplication(
    applicationId: string,
    facilitatorId: string,
    status: AnnouncementApplicationStatus,
    reviewNotes?: string | null
  ) {
    const application = await this.announcementRepository.findApplicationForReview(
      applicationId,
      facilitatorId
    );

    if (!application) {
      throw new Error("No tienes acceso a esta postulacion.");
    }

    return this.announcementRepository.reviewApplication(
      applicationId,
      facilitatorId,
      status,
      reviewNotes
    );
  }

  private toAnnouncementData(input: OpportunityFormInput): Prisma.AnnouncementUncheckedCreateInput {
    return {
      title: input.title,
      body: input.body,
      type: input.type,
      status: input.status,
      institution: input.institution ?? null,
      requirements: input.requirements,
      officialUrl: input.officialUrl ?? null,
      communityId: input.communityId ?? null,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      location: input.location,
      spots: input.spots ?? null,
      publishedAt: input.status === AnnouncementStatus.PUBLISHED ? new Date() : null
    };
  }
}
