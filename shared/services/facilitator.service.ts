import { AnnouncementRepository } from "@/shared/repositories/announcement.repository";
import { ConversationRepository } from "@/shared/repositories/conversation.repository";
import { CourseRepository } from "@/shared/repositories/course.repository";
import { FacilitatorRepository } from "@/shared/repositories/facilitator.repository";
import { FollowUpRepository } from "@/shared/repositories/follow-up.repository";
import { MessageRepository } from "@/shared/repositories/message.repository";
import { WorkshopRepository } from "@/shared/repositories/workshop.repository";

const INACTIVITY_DAYS = 14;

export function getMonitoringStatus(
  lastAccessedAt: Date | null,
  progress: number,
  attendanceRate: number
) {
  const daysInactive = lastAccessedAt
    ? (Date.now() - lastAccessedAt.getTime()) / 86_400_000
    : Infinity;
  if (daysInactive > INACTIVITY_DAYS) return "INACTIVA" as const;
  if (progress >= 80 && attendanceRate >= 75) return "DESTACADA" as const;
  if (daysInactive > 7 || progress < 25 || attendanceRate < 50)
    return "NECESITA_APOYO" as const;
  return "AL_DIA" as const;
}

function summarizeAssignment(
  assignment: Awaited<ReturnType<FacilitatorRepository["findAssignments"]>>[number]
) {
  const enrollments = assignment.artisan.enrollments;
  const progress = enrollments.length
    ? Math.round(
        enrollments.reduce(
          (sum, item) => sum + (item.courseProgress?.percentage ?? 0),
          0
        ) / enrollments.length
      )
    : 0;
  const lastAccessedAt =
    enrollments
      .flatMap((item) => item.lessonProgresses)
      .map((item) => item.lastAccessedAt)
      .filter((value): value is Date => Boolean(value))
      .sort((a, b) => b.getTime() - a.getTime())[0] ?? null;
  const attendance = assignment.artisan.workshopRegistrations.flatMap(
    (item) => item.attendances
  );
  const attendanceRate = attendance.length
    ? Math.round(
        (attendance.filter((item) => item.attended).length / attendance.length) * 100
      )
    : 100;
  return {
    id: assignment.artisan.id,
    name:
      assignment.artisan.profile?.displayName ??
      assignment.artisan.name ??
      assignment.artisan.email,
    avatarUrl: assignment.artisan.profile?.avatarUrl,
    community: assignment.artisan.profile?.community?.name ?? "Sin comunidad",
    craftTypes:
      assignment.artisan.profile?.craftTypes.map((item) => item.craftType.name) ?? [],
    progress,
    lastAccessedAt,
    attendanceRate,
    currentCourse:
      enrollments.find((item) => item.status === "ACTIVE")?.course.title ??
      "Sin curso activo",
    status: getMonitoringStatus(lastAccessedAt, progress, attendanceRate),
    latestFollowUp: assignment.followUps[0] ?? null
  };
}

export class ArtisanMonitoringService {
  private repository = new FacilitatorRepository();
  async list(facilitatorId: string) {
    return (await this.repository.findAssignments(facilitatorId)).map(
      summarizeAssignment
    );
  }
  async detail(facilitatorId: string, artisanId: string) {
    return this.repository.findAssignment(facilitatorId, artisanId);
  }
}

export class FacilitatorDashboardService {
  async getDashboard(facilitatorId: string) {
    const monitoring = await new ArtisanMonitoringService().list(facilitatorId);
    const workshops = await new WorkshopRepository().findManaged(facilitatorId);
    const courses = await new CourseRepository().findManagedCourses(facilitatorId);
    const conversations = await new ConversationRepository().findForUser(facilitatorId);
    const announcements = await new AnnouncementRepository().findManaged(facilitatorId);
    const averageProgress = monitoring.length
      ? Math.round(
          monitoring.reduce((sum, artisan) => sum + artisan.progress, 0) /
            monitoring.length
        )
      : 0;
    const attendanceItems = workshops.flatMap((workshop) => workshop.attendances);
    return {
      monitoring,
      workshops,
      courses,
      conversations,
      announcements,
      metrics: {
        accompanied: monitoring.length,
        active: monitoring.filter((artisan) => artisan.status !== "INACTIVA").length,
        needsSupport: monitoring.filter(
          (artisan) =>
            artisan.status === "NECESITA_APOYO" || artisan.status === "INACTIVA"
        ).length,
        averageProgress,
        attendanceRate: attendanceItems.length
          ? Math.round(
              (attendanceItems.filter((item) => item.attended).length /
                attendanceItems.length) *
                100
            )
          : 0,
        activeCourses: courses.filter((course) => course.status === "PUBLISHED").length
      }
    };
  }
}

export class FollowUpService {
  private monitoring = new ArtisanMonitoringService();
  private repository = new FollowUpRepository();
  async create(
    facilitatorId: string,
    artisanId: string,
    input: Omit<
      Parameters<FollowUpRepository["create"]>[0],
      "facilitatorId" | "artisanId" | "assignmentId"
    >
  ) {
    const assignment = await this.monitoring.detail(facilitatorId, artisanId);
    if (!assignment || assignment.status !== "ACTIVE")
      throw new Error("No tienes acceso de acompanamiento a esta artesana.");
    return this.repository.create({
      ...input,
      assignmentId: assignment.id,
      facilitatorId,
      artisanId
    });
  }
  update(id: string, input: Parameters<FollowUpRepository["update"]>[1]) {
    return this.repository.update(id, input);
  }
}

export class CourseManagementService {
  repository = new CourseRepository();
}
export class WorkshopManagementService {
  repository = new WorkshopRepository();
}
export class AttendanceService {
  repository = new WorkshopRepository();
}
export class OpportunityManagementService {
  repository = new AnnouncementRepository();
}

export class MessagingService {
  private conversations = new ConversationRepository();
  private messages = new MessageRepository();
  async openWithArtisan(facilitatorId: string, artisanId: string) {
    const assigned = await new ArtisanMonitoringService().detail(
      facilitatorId,
      artisanId
    );
    if (!assigned || assigned.status !== "ACTIVE")
      throw new Error("No tienes acceso a esta artesana.");
    return this.conversations.findOrCreateDirect(facilitatorId, artisanId);
  }
  async send(facilitatorId: string, conversationId: string, content: string) {
    const conversation = await this.conversations.findAuthorizedConversation(
      conversationId,
      facilitatorId
    );
    if (!conversation) throw new Error("No tienes acceso a esta conversacion.");
    return this.messages.create(conversationId, facilitatorId, content);
  }
}

export class FacilitatorReportService {
  async getReport(facilitatorId: string) {
    const dashboard = await new FacilitatorDashboardService().getDashboard(facilitatorId);
    return {
      ...dashboard.metrics,
      completedCourses: dashboard.monitoring.reduce(
        (sum, artisan) => sum + (artisan.progress === 100 ? 1 : 0),
        0
      ),
      workshopsCompleted: dashboard.workshops.filter(
        (workshop) => workshop.status === "COMPLETED"
      ).length,
      progressByArtisan: dashboard.monitoring.map((artisan) => ({
        name: artisan.name.split(" ")[0],
        progreso: artisan.progress
      }))
    };
  }
}
