import {
  AnnouncementApplicationStatus,
  AnnouncementStatus,
  type Prisma
} from "@prisma/client";

import { prisma } from "@/shared/server/db/prisma";

type ManagedOpportunityFilters = {
  status?: AnnouncementStatus;
  query?: string;
};

export class AnnouncementRepository {
  constructor(protected readonly db = prisma) {}

  findOpportunities(communityId?: string | null) {
    const now = new Date();

    return this.db.announcement.findMany({
      where: {
        status: AnnouncementStatus.PUBLISHED,
        publishedAt: { not: null, lte: now },
        AND: [
          { OR: [{ communityId: null }, { communityId: communityId ?? undefined }] },
          { OR: [{ endsAt: null }, { endsAt: { gte: now } }] }
        ]
      },
      include: {
        community: true,
        author: { include: { profile: true } },
        workshop: true
      },
      orderBy: [{ endsAt: "asc" }, { createdAt: "desc" }]
    });
  }

  findAvailableForArtisan(artisanId: string, communityId?: string | null) {
    const now = new Date();

    return this.db.announcement.findMany({
      where: {
        status: AnnouncementStatus.PUBLISHED,
        publishedAt: { not: null, lte: now },
        AND: [
          { OR: [{ communityId: null }, { communityId: communityId ?? undefined }] },
          { OR: [{ endsAt: null }, { endsAt: { gte: now } }] }
        ]
      },
      include: {
        community: true,
        author: { include: { profile: true } },
        workshop: true,
        applications: {
          where: { artisanId },
          select: {
            id: true,
            status: true,
            appliedAt: true
          }
        },
        _count: {
          select: { applications: true }
        }
      },
      orderBy: [{ endsAt: "asc" }, { createdAt: "desc" }]
    });
  }

  findAvailableDetailForArtisan(
    announcementId: string,
    artisanId: string,
    communityId?: string | null
  ) {
    const now = new Date();

    return this.db.announcement.findFirst({
      where: {
        id: announcementId,
        status: AnnouncementStatus.PUBLISHED,
        publishedAt: { not: null, lte: now },
        OR: [{ communityId: null }, { communityId: communityId ?? undefined }]
      },
      include: {
        community: true,
        author: { include: { profile: true } },
        applications: {
          where: { artisanId },
          select: {
            id: true,
            status: true,
            appliedAt: true,
            reviewedAt: true
          }
        },
        _count: {
          select: { applications: true }
        }
      }
    });
  }

  findManaged(authorId: string, filters: ManagedOpportunityFilters = {}) {
    return this.db.announcement.findMany({
      where: {
        authorId,
        status: filters.status,
        OR: filters.query
          ? [
              { title: { contains: filters.query, mode: "insensitive" } },
              { institution: { contains: filters.query, mode: "insensitive" } },
              { location: { contains: filters.query, mode: "insensitive" } }
            ]
          : undefined
      },
      include: {
        community: true,
        _count: {
          select: { applications: true }
        }
      },
      orderBy: { updatedAt: "desc" }
    });
  }

  findManagedDetail(id: string, authorId: string) {
    return this.db.announcement.findFirst({
      where: { id, authorId },
      include: {
        community: true,
        applications: {
          include: {
            artisan: {
              include: {
                profile: {
                  include: { community: true }
                }
              }
            },
            reviewedBy: {
              include: { profile: true }
            }
          },
          orderBy: { appliedAt: "desc" }
        }
      }
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

  setStatus(id: string, authorId: string, status: AnnouncementStatus) {
    return this.db.announcement.updateMany({
      where: { id, authorId },
      data: {
        status,
        publishedAt: status === AnnouncementStatus.PUBLISHED ? new Date() : undefined
      }
    });
  }

  findApplication(announcementId: string, artisanId: string) {
    return this.db.announcementApplication.findUnique({
      where: {
        announcementId_artisanId: {
          announcementId,
          artisanId
        }
      }
    });
  }

  createApplication(announcementId: string, artisanId: string) {
    return this.db.announcementApplication.create({
      data: {
        announcementId,
        artisanId
      }
    });
  }

  findApplicationForReview(applicationId: string, authorId: string) {
    return this.db.announcementApplication.findFirst({
      where: {
        id: applicationId,
        announcement: { authorId }
      },
      include: { announcement: true }
    });
  }

  reviewApplication(
    applicationId: string,
    reviewerId: string,
    status: AnnouncementApplicationStatus,
    reviewNotes?: string | null
  ) {
    return this.db.announcementApplication.update({
      where: { id: applicationId },
      data: {
        status,
        reviewedAt: new Date(),
        reviewedById: reviewerId,
        reviewNotes
      }
    });
  }

  countApplicationsByAnnouncement(announcementId: string) {
    return this.db.announcementApplication.count({ where: { announcementId } });
  }

  createOpportunity(authorId: string, data: Prisma.AnnouncementCreateInput) {
    return this.db.announcement.create({
      data: {
        ...data,
        author: { connect: { id: authorId } }
      }
    });
  }
}
