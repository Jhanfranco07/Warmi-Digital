import { prisma } from "@/shared/server/db/prisma";

export class FacilitatorRepository {
  constructor(protected readonly db = prisma) {}

  findAssignments(facilitatorId: string) {
    return this.db.facilitatorAssignment.findMany({
      where: { facilitatorId, status: "ACTIVE" },
      include: {
        artisan: {
          include: {
            profile: {
              include: { community: true, craftTypes: { include: { craftType: true } } }
            },
            enrollments: {
              include: { course: true, courseProgress: true, lessonProgresses: true }
            },
            workshopRegistrations: { include: { attendances: true } },
            stories: true,
            products: true,
            orders: { include: { items: true } }
          }
        },
        community: true,
        followUps: { orderBy: { occurredAt: "desc" }, take: 1 }
      },
      orderBy: { assignedAt: "desc" }
    });
  }

  findAssignment(facilitatorId: string, artisanId: string) {
    return this.db.facilitatorAssignment.findUnique({
      where: { facilitatorId_artisanId: { facilitatorId, artisanId } },
      include: {
        artisan: {
          include: {
            profile: {
              include: { community: true, craftTypes: { include: { craftType: true } } }
            },
            enrollments: {
              include: {
                course: { include: { modules: { include: { lessons: true } } } },
                courseProgress: true,
                lessonProgresses: {
                  include: { lesson: true },
                  orderBy: { lastAccessedAt: "desc" }
                }
              }
            },
            workshopRegistrations: { include: { workshop: true, attendances: true } },
            stories: { include: { storyFiles: { include: { file: true } } } },
            products: true,
            orders: { include: { items: true }, orderBy: { placedAt: "desc" }, take: 5 }
          }
        },
        followUps: {
          include: { facilitator: { include: { profile: true } } },
          orderBy: { occurredAt: "desc" }
        }
      }
    });
  }
}
