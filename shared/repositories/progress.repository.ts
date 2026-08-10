import { prisma } from "@/shared/server/db/prisma";

export class ProgressRepository {
  constructor(protected readonly db = prisma) {}

  markLessonStarted(enrollmentId: string, lessonId: string) {
    const now = new Date();

    return this.db.lessonProgress.upsert({
      where: { enrollmentId_lessonId: { enrollmentId, lessonId } },
      update: { lastAccessedAt: now, startedAt: now },
      create: {
        enrollmentId,
        lessonId,
        progress: 10,
        startedAt: now,
        lastAccessedAt: now
      }
    });
  }

  async markLessonCompleted(enrollmentId: string, lessonId: string) {
    const now = new Date();

    await this.db.lessonProgress.upsert({
      where: { enrollmentId_lessonId: { enrollmentId, lessonId } },
      update: {
        completed: true,
        progress: 100,
        completedAt: now,
        lastAccessedAt: now,
        startedAt: now
      },
      create: {
        enrollmentId,
        lessonId,
        completed: true,
        progress: 100,
        startedAt: now,
        completedAt: now,
        lastAccessedAt: now
      }
    });

    return this.recalculateCourseProgress(enrollmentId);
  }

  async recalculateCourseProgress(enrollmentId: string) {
    const enrollment = await this.db.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: { include: { modules: { include: { lessons: true } } } },
        lessonProgresses: true
      }
    });

    if (!enrollment) {
      throw new Error("Inscripcion no encontrada.");
    }

    const totalLessons = enrollment.course.modules.reduce(
      (total, module) => total + module.lessons.length,
      0
    );
    const completedLessons = enrollment.lessonProgresses.filter(
      (progress) => progress.completed
    ).length;
    const percentage =
      totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

    await this.db.enrollment.update({
      where: { id: enrollmentId },
      data: {
        lastActivityAt: new Date(),
        status: percentage >= 100 ? "COMPLETED" : "ACTIVE",
        completedAt: percentage >= 100 ? new Date() : null
      }
    });

    return this.db.courseProgress.upsert({
      where: { enrollmentId },
      update: {
        completedLessons,
        totalLessons,
        percentage,
        lastProgressAt: new Date()
      },
      create: {
        enrollmentId,
        completedLessons,
        totalLessons,
        percentage
      }
    });
  }
}
