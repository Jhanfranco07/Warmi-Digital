import { prisma } from "@/shared/server/db/prisma";

export class WorkshopRepository {
  constructor(protected readonly db = prisma) {}

  findForUser(userId: string) {
    return this.db.workshopRegistration.findMany({
      where: { userId },
      include: {
        attendances: true,
        workshop: {
          include: {
            facilitator: { include: { profile: true } },
            community: true,
            course: true,
            module: true
          }
        }
      },
      orderBy: { registeredAt: "desc" }
    });
  }

  findManaged(facilitatorId: string) {
    return this.db.workshop.findMany({
      where: { facilitatorId },
      include: {
        community: true,
        course: true,
        registrations: {
          include: {
            user: {
              include: {
                profile: {
                  include: { community: true }
                }
              }
            },
            attendances: true
          }
        },
        attendances: true
      },
      orderBy: { startsAt: "desc" }
    });
  }

  findManagedWorkshop(id: string, facilitatorId: string) {
    return this.db.workshop.findFirst({
      where: { id, facilitatorId },
      include: {
        community: true,
        course: true,
        registrations: {
          include: {
            user: {
              include: {
                profile: {
                  include: { community: true }
                }
              }
            },
            attendances: true
          }
        },
        attendances: true
      }
    });
  }

  create(data: Parameters<typeof this.db.workshop.create>[0]["data"]) {
    return this.db.workshop.create({ data });
  }
  update(
    id: string,
    facilitatorId: string,
    data: Parameters<typeof this.db.workshop.update>[0]["data"]
  ) {
    return this.db.workshop.updateMany({ where: { id, facilitatorId }, data });
  }

  async registerAttendance(
    workshopId: string,
    userId: string,
    recordedById: string,
    status: "PRESENT" | "ABSENT" | "EXCUSED"
  ) {
    const registration = await this.db.workshopRegistration.findUnique({
      where: { workshopId_userId: { workshopId, userId } },
      select: { id: true }
    });

    return this.db.attendance.upsert({
      where: { workshopId_userId: { workshopId, userId } },
      update: {
        status,
        attended: status === "PRESENT",
        checkedInAt: status === "PRESENT" ? new Date() : null,
        recordedById,
        workshopRegistrationId: registration?.id ?? null
      },
      create: {
        workshopId,
        userId,
        workshopRegistrationId: registration?.id ?? null,
        status,
        attended: status === "PRESENT",
        checkedInAt: status === "PRESENT" ? new Date() : null,
        recordedById
      }
    });
  }
}
