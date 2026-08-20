import { notFound } from "next/navigation";

import { CourseRepository } from "@/shared/repositories/course.repository";
import { ProgressService } from "@/shared/services/progress.service";

function getCourseProgress(
  enrollment: Awaited<ReturnType<CourseRepository["findEnrolledCourses"]>>[number]
) {
  const lessonIds = new Set(
    enrollment.course.modules.flatMap((module) =>
      module.lessons.map((lesson) => lesson.id)
    )
  );
  const lessonCount = lessonIds.size;
  const completedLessons = enrollment.lessonProgresses.filter(
    (progress) => progress.completed && lessonIds.has(progress.lessonId)
  ).length;

  return lessonCount ? Math.round((completedLessons / lessonCount) * 100) : 0;
}

function getCourseSummaryProgress(
  enrollment: Awaited<ReturnType<CourseRepository["findEnrolledCourseSummaries"]>>[number]
) {
  const lessonIds = new Set(
    enrollment.course.modules.flatMap((module) =>
      module.lessons.map((lesson) => lesson.id)
    )
  );
  const lessonCount = lessonIds.size;
  const completedLessons = enrollment.lessonProgresses.filter(
    (progress) => progress.completed
  ).length;

  return lessonCount ? Math.round((completedLessons / lessonCount) * 100) : 0;
}

export class LearningService {
  constructor(
    private readonly courseRepository = new CourseRepository(),
    private readonly progressService = new ProgressService()
  ) {}

  async getLearningPage(userId: string) {
    const [enrollments, availableCourses] = await Promise.all([
      this.courseRepository.findEnrolledCourseSummaries(userId),
      this.courseRepository.findAvailableCourseSummaries(userId)
    ]);

    return {
      enrolledCourses: enrollments.map((enrollment) => ({
        id: enrollment.course.id,
        title: enrollment.course.title,
        description: enrollment.course.description,
        level: enrollment.course.level,
        imageUrl: enrollment.course.imageUrl,
        facilitatorName:
          enrollment.course.facilitator?.profile?.displayName ??
          enrollment.course.facilitator?.name ??
          null,
        status: enrollment.status,
        progress: getCourseSummaryProgress(enrollment),
        durationMin: enrollment.course.modules.reduce(
          (total, module) => total + (module.durationMin ?? 0),
          0
        ),
        modulesCount: enrollment.course.modules.length,
        lastAccessedAt: enrollment.lastActivityAt,
        href: `/artesana/aprender/${enrollment.course.id}`
      })),
      availableCourses: availableCourses.map((course) => ({
        id: course.id,
        title: course.title,
        description: course.description,
        level: course.level,
        imageUrl: course.imageUrl,
        facilitatorName:
          course.facilitator?.profile?.displayName ?? course.facilitator?.name ?? null,
        durationMin: course.modules.reduce(
          (total, module) => total + (module.durationMin ?? 0),
          0
        ),
        modulesCount: course.modules.length
      }))
    };
  }

  async getCourseDetail(userId: string, courseId: string) {
    const enrollment = await this.courseRepository.findEnrollmentCourse(userId, courseId);

    if (!enrollment) {
      notFound();
    }

    const progress =
      enrollment.courseProgress?.percentage ?? getCourseProgress(enrollment);
    const lessonProgress = new Map(
      enrollment.lessonProgresses.map((item) => [item.lessonId, item])
    );
    const firstIncompleteLesson = enrollment.course.modules
      .flatMap((module) => module.lessons)
      .find((lesson) => !lessonProgress.get(lesson.id)?.completed);

    return {
      enrollment,
      progress,
      firstIncompleteLesson,
      lessonProgress
    };
  }

  async getLessonDetail(userId: string, courseId: string, lessonId: string) {
    const result = await this.courseRepository.findEnrollmentLesson(
      userId,
      courseId,
      lessonId
    );

    if (!result) {
      notFound();
    }

    await this.progressService.markLessonStarted(result.enrollment.id, lessonId);

    return {
      ...result,
      progress: result.enrollment.lessonProgresses.find(
        (item) => item.lessonId === lessonId
      )
    };
  }
}
