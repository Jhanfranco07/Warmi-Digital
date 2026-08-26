import { AnnouncementRepository } from "@/shared/repositories/announcement.repository";
import { ConversationRepository } from "@/shared/repositories/conversation.repository";
import { CourseRepository } from "@/shared/repositories/course.repository";
import { FacilitatorRepository } from "@/shared/repositories/facilitator.repository";
import { FollowUpRepository } from "@/shared/repositories/follow-up.repository";
import { MessageRepository } from "@/shared/repositories/message.repository";
import { WorkshopRepository } from "@/shared/repositories/workshop.repository";

const INACTIVITY_DAYS = 14;
const LAST_MONTHS = 6;

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
  if (daysInactive > 7 || progress < 25 || attendanceRate < 50) {
    return "NECESITA_APOYO" as const;
  }
  return "AL_DIA" as const;
}

type AssignmentListRecord = Awaited<
  ReturnType<FacilitatorRepository["findAssignments"]>
>[number];
type AssignmentDetailRecord = NonNullable<
  Awaited<ReturnType<FacilitatorRepository["findAssignment"]>>
>;
type AssignmentRecord = AssignmentListRecord | AssignmentDetailRecord;
type EnrollmentRecord = AssignmentRecord["artisan"]["enrollments"][number];

function percentage(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function lessonTotal(enrollment: EnrollmentRecord) {
  const stored = enrollment.courseProgress?.totalLessons ?? 0;
  const fromModules = enrollment.course.modules.reduce(
    (sum, module) => sum + module.lessons.length,
    0
  );
  return stored > 0 ? stored : fromModules;
}

function completedLessonTotal(enrollment: EnrollmentRecord) {
  const stored = enrollment.courseProgress?.completedLessons ?? 0;
  const fromProgress = enrollment.lessonProgresses.filter(
    (lesson) => lesson.completed
  ).length;
  return stored > 0 ? stored : fromProgress;
}

function enrollmentPercentage(enrollment: EnrollmentRecord) {
  const stored = enrollment.courseProgress?.percentage;
  if (typeof stored === "number" && stored > 0) return Math.round(stored);
  return percentage(completedLessonTotal(enrollment), lessonTotal(enrollment));
}

function assignmentCommunity(assignment: AssignmentRecord) {
  return assignment.artisan.profile?.community?.name ?? "Sin comunidad";
}

function assignmentCraftTypes(assignment: AssignmentRecord) {
  return (
    assignment.artisan.profile?.craftTypes.map((item) => item.craftType.name) ?? []
  );
}

function supportReason(
  lastAccessedAt: Date | null,
  progress: number,
  attendanceRate: number
) {
  const daysInactive = lastAccessedAt
    ? (Date.now() - lastAccessedAt.getTime()) / 86_400_000
    : Infinity;

  if (daysInactive > INACTIVITY_DAYS) return "Sin actividad reciente";
  if (attendanceRate > 0 && attendanceRate < 50) return "Baja asistencia";
  if (progress < 25) return "Avance inicial";
  if (daysInactive > 7) return "Requiere seguimiento";
  return "Al dia";
}

function lastSixMonths() {
  const now = new Date();
  return Array.from({ length: LAST_MONTHS }, (_, index) => {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - (LAST_MONTHS - 1 - index),
      1
    );
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: date
        .toLocaleDateString("es-PE", { month: "short" })
        .replace(".", "")
    };
  });
}

function summarizeAssignment(assignment: AssignmentRecord) {
  const enrollments = assignment.artisan.enrollments;
  const registrations = assignment.artisan.workshopRegistrations;
  const attendance = registrations.flatMap((item) => item.attendances);
  const progress = enrollments.length
    ? Math.round(
        enrollments.reduce((sum, item) => sum + enrollmentPercentage(item), 0) /
          enrollments.length
      )
    : 0;
  const lastAccessedAt =
    enrollments
      .flatMap((item) => item.lessonProgresses)
      .map((item) => item.lastAccessedAt)
      .filter((value): value is Date => Boolean(value))
      .sort((a, b) => b.getTime() - a.getTime())[0] ?? null;
  const attendanceRate = attendance.length
    ? Math.round(
        (attendance.filter((item) => item.attended).length / attendance.length) * 100
      )
    : 0;
  const completedCourses = enrollments.filter(
    (item) => item.status === "COMPLETED" || enrollmentPercentage(item) >= 100
  ).length;
  const totalLessons = enrollments.reduce((sum, item) => sum + lessonTotal(item), 0);
  const completedLessons = enrollments.reduce(
    (sum, item) => sum + completedLessonTotal(item),
    0
  );
  const latestWorkshop =
    registrations
      .map((item) => item.workshop)
      .filter((workshop) => Boolean(workshop.startsAt))
      .sort(
        (a, b) => (b.startsAt?.getTime() ?? 0) - (a.startsAt?.getTime() ?? 0)
      )[0] ?? null;
  const upcomingWorkshop =
    registrations
      .map((item) => item.workshop)
      .filter(
        (workshop) =>
          Boolean(workshop.startsAt) &&
          (workshop.startsAt?.getTime() ?? 0) >= Date.now() &&
          workshop.status !== "CANCELLED"
      )
      .sort(
        (a, b) => (a.startsAt?.getTime() ?? 0) - (b.startsAt?.getTime() ?? 0)
      )[0] ?? null;
  const completedLessonEvents = enrollments
    .flatMap((item) => item.lessonProgresses)
    .filter((item) => item.completed)
    .map((item) => item.completedAt ?? item.lastAccessedAt)
    .filter((value): value is Date => Boolean(value));
  const status = getMonitoringStatus(lastAccessedAt, progress, attendanceRate);

  return {
    assignmentId: assignment.id,
    id: assignment.artisan.id,
    name:
      assignment.artisan.profile?.displayName ??
      assignment.artisan.name ??
      assignment.artisan.email,
    email: assignment.artisan.email,
    phone: assignment.artisan.profile?.phone ?? null,
    avatarUrl: assignment.artisan.profile?.avatarUrl,
    community: assignmentCommunity(assignment),
    craftTypes: assignmentCraftTypes(assignment),
    progress,
    lastAccessedAt,
    attendanceRate,
    registeredWorkshops: registrations.length,
    attendedWorkshops: attendance.filter((item) => item.attended).length,
    completedCourses,
    totalCourses: enrollments.length,
    totalLessons,
    completedLessons,
    latestWorkshop,
    upcomingWorkshop,
    currentCourse:
      enrollments.find((item) => item.status === "ACTIVE")?.course.title ??
      "Sin curso activo",
    status,
    supportReason: supportReason(lastAccessedAt, progress, attendanceRate),
    latestFollowUp: assignment.followUps[0] ?? null,
    followUps: assignment.followUps,
    completedLessonEvents,
    assignedAt: assignment.assignedAt
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

  async detailSummary(facilitatorId: string, artisanId: string) {
    const assignment = await this.repository.findAssignment(facilitatorId, artisanId);
    if (!assignment) return null;

    return {
      assignment,
      summary: summarizeAssignment(assignment)
    };
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
    const totalRegistrations = workshops.reduce(
      (sum, workshop) => sum + workshop.registrations.length,
      0
    );

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
        activeCourses: courses.filter((course) => course.status === "PUBLISHED").length,
        participationRate:
          monitoring.length > 0 ? percentage(totalRegistrations, monitoring.length) : 0
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
    if (!assignment || assignment.status !== "ACTIVE") {
      throw new Error("No tienes acceso de acompanamiento a esta artesana.");
    }

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
    if (!assigned || assigned.status !== "ACTIVE") {
      throw new Error("No tienes acceso a esta artesana.");
    }
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

  async markRead(facilitatorId: string, conversationId: string) {
    const conversation = await this.conversations.findAuthorizedConversation(
      conversationId,
      facilitatorId
    );
    if (!conversation) throw new Error("No tienes acceso a esta conversacion.");
    return this.messages.markRead(conversationId, facilitatorId);
  }
}

export class FacilitatorReportService {
  async getReport(facilitatorId: string) {
    const dashboard = await new FacilitatorDashboardService().getDashboard(facilitatorId);
    const monitoring = dashboard.monitoring;
    const months = lastSixMonths();
    const communityProgress = Array.from(
      monitoring.reduce(
        (map, artisan) => {
          const current = map.get(artisan.community) ?? {
            community: artisan.community,
            total: 0,
            progress: 0,
            attendance: 0,
            needsSupport: 0
          };
          current.total += 1;
          current.progress += artisan.progress;
          current.attendance += artisan.attendanceRate;
          current.needsSupport +=
            artisan.status === "NECESITA_APOYO" || artisan.status === "INACTIVA"
              ? 1
              : 0;
          map.set(artisan.community, current);
          return map;
        },
        new Map<
          string,
          {
            community: string;
            total: number;
            progress: number;
            attendance: number;
            needsSupport: number;
          }
        >()
      ).values()
    ).map((item) => ({
      community: item.community,
      total: item.total,
      averageProgress: percentage(item.progress, item.total),
      attendanceRate: percentage(item.attendance, item.total),
      needsSupport: item.needsSupport
    }));
    const monthlyLearning = months.map((month) => {
      const completedLessons = monitoring
        .flatMap((artisan) => artisan.completedLessonEvents)
        .filter(
          (date) => `${date.getFullYear()}-${date.getMonth()}` === month.key
        ).length;
      return { label: month.label, completedLessons };
    });
    const attendanceDistribution = [
      {
        label: "Alta",
        description: "80% o mas",
        value: monitoring.filter((artisan) => artisan.attendanceRate >= 80).length
      },
      {
        label: "Media",
        description: "50% - 79%",
        value: monitoring.filter(
          (artisan) => artisan.attendanceRate >= 50 && artisan.attendanceRate < 80
        ).length
      },
      {
        label: "Baja",
        description: "menos de 50%",
        value: monitoring.filter(
          (artisan) =>
            artisan.registeredWorkshops > 0 && artisan.attendanceRate < 50
        ).length
      },
      {
        label: "Sin talleres",
        description: "sin registros",
        value: monitoring.filter((artisan) => artisan.registeredWorkshops === 0)
          .length
      }
    ].map((item) => ({
      ...item,
      percentage: monitoring.length ? percentage(item.value, monitoring.length) : 0
    }));
    const topCourses = dashboard.courses
      .map((course) => {
        const enrolled = course.enrollments.length;
        const completed = course.enrollments.filter(
          (item) =>
            item.status === "COMPLETED" || (item.courseProgress?.percentage ?? 0) >= 100
        ).length;
        const averageProgress = enrolled
          ? Math.round(
              course.enrollments.reduce(
                (sum, item) => sum + (item.courseProgress?.percentage ?? 0),
                0
              ) / enrolled
            )
          : 0;
        return {
          id: course.id,
          title: course.title,
          enrolled,
          completed,
          averageProgress
        };
      })
      .sort(
        (a, b) =>
          b.completed - a.completed ||
          b.averageProgress - a.averageProgress ||
          b.enrolled - a.enrolled
      )
      .slice(0, 5);
    const recentFollowUps = monitoring
      .flatMap((artisan) =>
        artisan.followUps.map((followUp) => ({
          id: followUp.id,
          artisanId: artisan.id,
          artisanName: artisan.name,
          type: followUp.type,
          occurredAt: followUp.occurredAt,
          observation: followUp.observation,
          recommendation: followUp.recommendation
        }))
      )
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
      .slice(0, 6);

    return {
      ...dashboard.metrics,
      inactive: monitoring.filter((artisan) => artisan.status === "INACTIVA").length,
      completedCourses: monitoring.reduce(
        (sum, artisan) => sum + artisan.completedCourses,
        0
      ),
      workshopsCompleted: dashboard.workshops.filter(
        (workshop) => workshop.status === "COMPLETED"
      ).length,
      progressByArtisan: monitoring.map((artisan) => ({
        name: artisan.name.split(" ")[0],
        progreso: artisan.progress
      })),
      communityProgress,
      monthlyLearning,
      attendanceDistribution,
      topCourses,
      rows: monitoring,
      recentFollowUps
    };
  }
}
