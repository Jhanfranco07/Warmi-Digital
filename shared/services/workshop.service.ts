import { WorkshopRepository } from "@/shared/repositories/workshop.repository";

export class WorkshopService {
  constructor(private readonly workshopRepository = new WorkshopRepository()) {}

  async getWorkshops(userId: string) {
    const registrations = await this.workshopRepository.findForUser(userId);
    const now = new Date();

    return {
      upcoming: registrations.filter(
        (registration) =>
          registration.workshop.startsAt && registration.workshop.startsAt >= now
      ),
      completed: registrations.filter(
        (registration) =>
          registration.workshop.status === "COMPLETED" ||
          Boolean(registration.attendances.some((attendance) => attendance.attended))
      )
    };
  }
}
