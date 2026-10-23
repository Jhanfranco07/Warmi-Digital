import {
  LEARNING_PROGRAM,
  isArtisanLearningCourse,
  learningProgress
} from "@/shared/learning/program";
import { ArtisanRepository } from "@/shared/repositories/artisan.repository";
import { CourseRepository } from "@/shared/repositories/course.repository";
import { WorkshopService } from "@/shared/services/workshop.service";

function average(values: number[]) {
  if (!values.length) return 0;
  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
}

export class ArtisanDashboardService {
  constructor(
    private readonly artisanRepository = new ArtisanRepository(),
    private readonly courseRepository = new CourseRepository(),
    private readonly workshopService = new WorkshopService()
  ) {}

  async getLearningOverview(userId: string) {
    const [artisan, workshops] = await Promise.all([
      this.artisanRepository.findDashboardProfile(userId),
      this.workshopService.getWorkshops(userId)
    ]);

    return {
      artisan,
      workshops,
      nextWorkshop: workshops.upcoming[0] ?? null
    };
  }

  async getDashboard(userId: string) {
    const [artisan, enrollments, workshops] = await Promise.all([
      this.artisanRepository.findDashboardProfile(userId),
      this.courseRepository.findDashboardCourseSummaries(userId, LEARNING_PROGRAM.id),
      this.workshopService.getWorkshops(userId)
    ]);

    const visibleEnrollments = enrollments.filter((enrollment) =>
      isArtisanLearningCourse(enrollment.course.id)
    );
    const courseProgress = visibleEnrollments.map((enrollment) => {
      if (enrollment.course.id === LEARNING_PROGRAM.id)
        return learningProgress(enrollment.course, enrollment.lessonProgresses)
          .percentage;
      const totalLessons = enrollment.course.modules.reduce(
        (total, module) => total + module.lessons.length,
        0
      );
      const completedLessons = enrollment.lessonProgresses.filter(
        (progress) => progress.completed
      ).length;
      return (
        enrollment.courseProgress?.percentage ??
        (totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0)
      );
    });

    const learningEnrollments = visibleEnrollments.map((enrollment, index) =>
      enrollment.course.id === LEARNING_PROGRAM.id
        ? { ...enrollment, courseProgress: { percentage: courseProgress[index] } }
        : enrollment
    );

    const attendedWorkshops = workshops.completed.length;
    const workshopContribution =
      workshops.upcoming.length || attendedWorkshops
        ? Math.min(attendedWorkshops * 10, 100)
        : 0;
    const generalProgress = average(
      [...courseProgress, workshopContribution].filter((value) => value >= 0)
    );
    const currentEnrollment =
      learningEnrollments.find((_, index) => courseProgress[index] < 100) ??
      learningEnrollments[0];
    const currentBadge = artisan?.userBadges[0]?.badge ?? null;

    return {
      artisan,
      generalProgress,
      enrollments: learningEnrollments,
      currentEnrollment,
      currentBadge,
      nextWorkshop: workshops.upcoming[0] ?? null,
      workshops,
      recentBadges: artisan?.userBadges ?? [],
      nextObjective:
        generalProgress < 40
          ? "Completar tus primeras lecciones"
          : generalProgress < 75
            ? "Participar en tu siguiente taller"
            : "Documentar y compartir tu historia cultural",
      routeName: currentEnrollment?.course.title ?? "Ruta por iniciar"
    };
  }
}
