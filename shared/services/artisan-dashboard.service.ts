import { ArtisanRepository } from "@/shared/repositories/artisan.repository";
import { CourseRepository } from "@/shared/repositories/course.repository";
import { NotificationRepository } from "@/shared/repositories/notification.repository";
import { OrderRepository } from "@/shared/repositories/order.repository";
import { ProductRepository } from "@/shared/repositories/product.repository";
import { StoryRepository } from "@/shared/repositories/story.repository";
import { OpportunityService } from "@/shared/services/opportunity.service";
import { WorkshopService } from "@/shared/services/workshop.service";

function average(values: number[]) {
  if (!values.length) return 0;
  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
}

export class ArtisanDashboardService {
  constructor(
    private readonly artisanRepository = new ArtisanRepository(),
    private readonly courseRepository = new CourseRepository(),
    private readonly workshopService = new WorkshopService(),
    private readonly opportunityService = new OpportunityService(),
    private readonly storyRepository = new StoryRepository(),
    private readonly productRepository = new ProductRepository(),
    private readonly orderRepository = new OrderRepository(),
    private readonly notificationRepository = new NotificationRepository()
  ) {}

  async getDashboard(userId: string) {
    const artisan = await this.artisanRepository.findProfile(userId);
    const communityId = artisan?.profile?.communityId;

    const [
      enrollments,
      workshops,
      opportunities,
      story,
      products,
      orders,
      notifications,
      unreadNotifications
    ] = await Promise.all([
      this.courseRepository.findEnrolledCourses(userId),
      this.workshopService.getWorkshops(userId),
      this.opportunityService.getOpportunities(communityId),
      this.storyRepository.findByUser(userId),
      this.productRepository.findByArtisan(userId),
      this.orderRepository.findRecentForArtisan(userId),
      this.notificationRepository.findRecentForUser(userId),
      this.notificationRepository.countUnread(userId)
    ]);

    const courseProgress = enrollments.map((enrollment) => {
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

    const attendedWorkshops = workshops.completed.length;
    const workshopContribution =
      workshops.upcoming.length || attendedWorkshops
        ? Math.min(attendedWorkshops * 10, 100)
        : 0;
    const generalProgress = average(
      [...courseProgress, workshopContribution].filter((value) => value >= 0)
    );
    const currentEnrollment =
      enrollments.find(
        (enrollment) => (enrollment.courseProgress?.percentage ?? 0) < 100
      ) ?? enrollments[0];
    const currentBadge = artisan?.userBadges[0]?.badge ?? null;

    return {
      artisan,
      story,
      generalProgress,
      enrollments,
      currentEnrollment,
      currentBadge,
      nextWorkshop: workshops.upcoming[0] ?? null,
      workshops,
      opportunities: opportunities.slice(0, 3),
      products,
      recentOrders: orders,
      notifications,
      unreadNotifications,
      recentBadges: artisan?.userBadges ?? [],
      nextObjective:
        generalProgress < 40
          ? "Completar tus primeras lecciones"
          : generalProgress < 75
            ? "Participar en tu siguiente taller"
            : "Documentar y compartir tu historia cultural",
      routeName:
        generalProgress < 40
          ? (currentEnrollment?.course.title ?? "Ruta por iniciar")
          : generalProgress < 75
            ? "Colorista Digital"
            : "Guardiana de la Tradición"
    };
  }
}
