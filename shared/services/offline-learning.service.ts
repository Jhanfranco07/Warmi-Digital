import { CourseRepository } from "@/shared/repositories/course.repository";
import {
  isDownloadableFile,
  isOfflineModule,
  getReferencedLessonId,
  type OfflineLesson,
  type OfflineModule
} from "@/shared/offline/module3-types";

type Enrollment = NonNullable<
  Awaited<ReturnType<CourseRepository["findEnrollmentCourse"]>>
>;
type Course = Enrollment["course"];
type LearningModule = Course["modules"][number];
type EnrollmentReader = {
  findEnrollmentCourse(userId: string, courseId: string): PromiseLike<Enrollment | null>;
};

export function getOfflineSupportLessons(course: Course, learningModule: LearningModule) {
  const referencedIds = new Set(
    learningModule.lessons
      .flatMap((lesson) => lesson.lessonFiles)
      .map((resource) => getReferencedLessonId(course.id, resource))
      .filter(Boolean)
  );
  return course.modules
    .filter((item) => item.id !== learningModule.id)
    .flatMap((item) => item.lessons)
    .filter((lesson) => referencedIds.has(lesson.id));
}

function snapshotLesson(
  courseId: string,
  lesson: LearningModule["lessons"][number],
  supportIds: Set<string>
): OfflineLesson {
  return {
    id: lesson.id,
    title: lesson.title,
    content: lesson.content,
    resources: lesson.lessonFiles.map((resource) => {
      const internalId = getReferencedLessonId(courseId, resource);
      return {
        id: resource.id,
        title: resource.title,
        description: resource.description,
        type: resource.type,
        externalUrl:
          resource.originalUrl ??
          (resource.type === "VIDEO_YOUTUBE" && resource.externalId
            ? `https://www.youtube.com/watch?v=${encodeURIComponent(resource.externalId)}`
            : null),
        ...(internalId && supportIds.has(internalId)
          ? { internalLessonId: internalId }
          : {}),
        file: resource.file
          ? {
              id: resource.file.id,
              mimeType: resource.file.mimeType,
              size: resource.file.size
            }
          : null
      };
    })
  };
}

export function buildOfflineModule(
  userId: string,
  course: Course,
  module: LearningModule
): OfflineModule {
  const support = getOfflineSupportLessons(course, module);
  const supportIds = new Set(support.map((lesson) => lesson.id));
  return {
    userId,
    courseId: course.id,
    courseTitle: course.title,
    moduleId: module.id,
    title: module.title,
    description: module.description,
    lessons: module.lessons.map((lesson) =>
      snapshotLesson(course.id, lesson, supportIds)
    ),
    supportLessons: support.map((lesson) => snapshotLesson(course.id, lesson, new Set()))
  };
}

export class OfflineLearningService {
  constructor(private readonly courses: EnrollmentReader = new CourseRepository()) {}

  async getAuthorizedFile(userId: string, courseId: string, fileId: string) {
    const enrollment = await this.courses.findEnrollmentCourse(userId, courseId);
    if (!enrollment || enrollment.course.deletedAt) return null;
    for (const learningModule of enrollment.course.modules) {
      if (!isOfflineModule(learningModule.title)) continue;
      const lessons = [
        ...learningModule.lessons,
        ...getOfflineSupportLessons(enrollment.course, learningModule)
      ];
      for (const lesson of lessons) {
        const file = lesson.lessonFiles.find(
          (resource) => resource.file?.id === fileId
        )?.file;
        if (file && isDownloadableFile(file)) return file;
      }
    }
    return null;
  }
}
