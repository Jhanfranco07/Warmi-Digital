import { notFound, redirect } from "next/navigation";
import {
  LEARNING_PROGRAM,
  availableLearningModules,
  isLearningModuleAvailable,
  isLearningLessonAvailable,
  learningProgress
} from "@/shared/learning/program";
import { getReferencedLesson } from "@/shared/offline/module3-types";

import { CourseRepository } from "@/shared/repositories/course.repository";
import { ProgressService } from "@/shared/services/progress.service";

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
      enrolledCourses: enrollments
        .filter(
          (enrollment) =>
            enrollment.course.id !== LEARNING_PROGRAM.modules[0].previousCourseId ||
            enrollment.course.modules.length > 0
        )
        .sort(
          (a, b) =>
            Number(b.course.id === LEARNING_PROGRAM.id) -
            Number(a.course.id === LEARNING_PROGRAM.id)
        )
        .map((enrollment) => {
          const progress = learningProgress(
            enrollment.course,
            enrollment.lessonProgresses
          ).percentage;
          return {
            id: enrollment.course.id,
            title: enrollment.course.title,
            description: enrollment.course.description,
            level: enrollment.course.level,
            imageUrl: enrollment.course.imageUrl,
            facilitatorName:
              enrollment.course.facilitator?.profile?.displayName ??
              enrollment.course.facilitator?.name ??
              null,
            status:
              enrollment.course.id === LEARNING_PROGRAM.id &&
              ["ACTIVE", "COMPLETED"].includes(enrollment.status)
                ? progress === 100
                  ? "COMPLETED"
                  : "ACTIVE"
                : enrollment.status,
            progress,
            durationMin: availableLearningModules(
              enrollment.course.id,
              enrollment.course.modules
            ).reduce((total, module) => total + (module.durationMin ?? 0), 0),
            modulesCount:
              enrollment.course.id === LEARNING_PROGRAM.id
                ? LEARNING_PROGRAM.modules.length
                : enrollment.course.modules.length,
            lastAccessedAt: enrollment.lastActivityAt,
            href: `/artesana/aprender/${enrollment.course.id}`
          };
        }),
      availableCourses: availableCourses
        .filter(
          (course) =>
            course.id !== LEARNING_PROGRAM.modules[0].previousCourseId ||
            course.modules.length > 0
        )
        .sort(
          (a, b) =>
            Number(b.id === LEARNING_PROGRAM.id) - Number(a.id === LEARNING_PROGRAM.id)
        )
        .map((course) => ({
          id: course.id,
          title: course.title,
          description: course.description,
          level: course.level,
          imageUrl: course.imageUrl,
          facilitatorName:
            course.facilitator?.profile?.displayName ?? course.facilitator?.name ?? null,
          durationMin: availableLearningModules(course.id, course.modules).reduce(
            (total, module) => total + (module.durationMin ?? 0),
            0
          ),
          modulesCount:
            course.id === LEARNING_PROGRAM.id
              ? LEARNING_PROGRAM.modules.length
              : course.modules.length
        }))
    };
  }

  async getCourseDetail(userId: string, courseId: string) {
    const original = await this.courseRepository.findEnrollmentCourse(userId, courseId);
    const enrollment = original && {
      ...original,
      course: {
        ...original.course,
        modules: availableLearningModules(original.course.id, original.course.modules)
      }
    };

    if (!enrollment) {
      notFound();
    }
    if (
      courseId === LEARNING_PROGRAM.modules[0].previousCourseId &&
      enrollment.course.modules.length === 0 &&
      (await this.courseRepository.findEnrollmentCourse(userId, LEARNING_PROGRAM.id))
    )
      redirect(`/artesana/aprender/${LEARNING_PROGRAM.id}`);

    const progress = learningProgress(
      enrollment.course,
      enrollment.lessonProgresses
    ).percentage;
    const availableLessonIds = new Set(
      enrollment.course.modules.flatMap((module) =>
        module.lessons.map((lesson) => lesson.id)
      )
    );
    const lessonProgress = new Map(
      enrollment.lessonProgresses
        .filter((item) => availableLessonIds.has(item.lessonId))
        .map((item) => [item.lessonId, item])
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
    let result = await this.courseRepository.findEnrollmentLesson(
      userId,
      courseId,
      lessonId
    );

    if (result && !isLearningModuleAvailable(courseId, result.lesson.module.id))
      redirect(`/artesana/aprender/${LEARNING_PROGRAM.id}`);

    // Historical lessons explicitly referenced as support remain readable, without completion.
    if (result && !isLearningLessonAvailable(courseId, result.lesson.module.id, lessonId))
      result = null;

    if (!result) {
      const program = await this.courseRepository.findEnrollmentCourse(
        userId,
        LEARNING_PROGRAM.id
      );
      const reference =
        program &&
        availableLearningModules(program.course.id, program.course.modules)
          .flatMap((module) => module.lessons)
          .flatMap((lesson) => lesson.lessonFiles)
          .map(getReferencedLesson)
          .find(
            (item) =>
              item?.lessonId === lessonId &&
              (courseId === LEARNING_PROGRAM.id || courseId === item.courseId)
          );
      if (program && reference) {
        const support = await this.courseRepository.findPublishedSupportLesson(
          reference.courseId,
          lessonId
        );
        if (support) {
          if (courseId !== LEARNING_PROGRAM.id)
            redirect(`/artesana/aprender/${LEARNING_PROGRAM.id}/lecciones/${lessonId}`);
          return { enrollment: program, lesson: support, progress: undefined };
        }
      }
      const destination = await this.courseRepository.findLessonCourse(lessonId);
      if (
        destination?.module.courseId === LEARNING_PROGRAM.id &&
        LEARNING_PROGRAM.modules.some((module) => module.previousCourseId === courseId) &&
        (await this.courseRepository.findEnrollmentCourse(userId, LEARNING_PROGRAM.id))
      )
        redirect(`/artesana/aprender/${LEARNING_PROGRAM.id}/lecciones/${lessonId}`);
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
