import {
  aggregateDuration,
  moduleDuration,
  learningState
} from "@/shared/learning/presentation";
import { notFound, redirect } from "next/navigation";
import {
  LEARNING_PROGRAM,
  availableLearningModules,
  isArtisanLearningCourse,
  isLearningModuleAvailable,
  learningProgress,
  moduleCapability
} from "@/shared/learning/program";
import { getReferencedLesson } from "@/shared/offline/module3-types";
import { MODULE1_GMAIL_SUPPORT_ID } from "@/shared/learning/module1";

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
        .filter((enrollment) => isArtisanLearningCourse(enrollment.course.id))
        .map((enrollment) => {
          const progress = learningProgress(
            enrollment.course,
            enrollment.lessonProgresses
          ).percentage;
          const modules = availableLearningModules(
            enrollment.course.id,
            enrollment.course.modules
          );
          const moduleStates = modules.map((module) => ({
            ...module,
            ...learningState(module.lessons, enrollment.lessonProgresses)
          }));
          const state = learningState(
            modules.flatMap((module) => module.lessons),
            enrollment.lessonProgresses
          );
          const nextModule = moduleStates.find((module) => module.state !== "completed");
          return {
            learningState: state,
            completedModules: moduleStates.filter(
              (module) => module.state === "completed"
            ).length,
            nextModule: nextModule
              ? {
                  order: nextModule.order,
                  title: moduleCapability(nextModule.id)?.title ?? nextModule.title
                }
              : null,
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
            durationMin: aggregateDuration(
              enrollment.course.durationMin,
              modules.map(moduleDuration)
            ),
            modulesCount: modules.length,
            lastAccessedAt: enrollment.lastActivityAt,
            href: `/artesana/aprender/${enrollment.course.id}`
          };
        }),
      availableCourses: availableCourses
        .filter((course) => isArtisanLearningCourse(course.id))
        .map((course) => ({
          id: course.id,
          title: course.title,
          description: course.description,
          level: course.level,
          imageUrl: course.imageUrl,
          facilitatorName:
            course.facilitator?.profile?.displayName ?? course.facilitator?.name ?? null,
          durationMin: aggregateDuration(
            course.durationMin,
            availableLearningModules(course.id, course.modules).map(moduleDuration)
          ),
          modulesCount: availableLearningModules(course.id, course.modules).length
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
      enrollment.course.modules.every((module) =>
        module.lessons.every((lesson) => lesson.id === MODULE1_GMAIL_SUPPORT_ID)
      ) &&
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
    const result = await this.courseRepository.findEnrollmentLesson(
      userId,
      courseId,
      lessonId
    );

    if (result && !isLearningModuleAvailable(courseId, result.lesson.module.id))
      redirect(`/artesana/aprender/${LEARNING_PROGRAM.id}`);

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
