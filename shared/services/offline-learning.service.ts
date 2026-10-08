import { CourseRepository } from "@/shared/repositories/course.repository";
import { LEARNING_PROGRAM } from "@/shared/learning/program";
import { MODULE3_CONTENT_VERSION } from "@/shared/learning/module3-version";
import {
  isDownloadableFile,
  isOfflineModule,
  getReferencedLessonId,
  getReferencedLesson,
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
  findPublishedSupportLesson?: (
    courseId: string,
    lessonId: string
  ) => PromiseLike<Awaited<ReturnType<CourseRepository["findPublishedSupportLesson"]>>>;
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
      const internalId = getReferencedLesson(resource)?.lessonId;
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
  module: LearningModule,
  additionalSupport: LearningModule["lessons"] = []
): OfflineModule {
  const support = [
    ...new Map(
      [...getOfflineSupportLessons(course, module), ...additionalSupport].map(
        (lesson) => [lesson.id, lesson]
      )
    ).values()
  ];
  const supportIds = new Set(support.map((lesson) => lesson.id));
  return {
    ...(module.id === LEARNING_PROGRAM.modules[2].id
      ? { contentVersion: MODULE3_CONTENT_VERSION }
      : {}),
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

  async getModuleSnapshot(userId: string, course: Course, module: LearningModule) {
    const support: LearningModule["lessons"] = [];
    const seen = new Set<string>();
    for (const resource of module.lessons.flatMap((lesson) => lesson.lessonFiles)) {
      const reference = getReferencedLesson(resource);
      if (!reference || reference.courseId === course.id || seen.has(reference.lessonId))
        continue;
      seen.add(reference.lessonId);
      // Only published lessons explicitly referenced by this enrolled module are included.
      const lesson = await this.courses.findPublishedSupportLesson?.(
        reference.courseId,
        reference.lessonId
      );
      if (lesson) support.push(lesson);
    }
    return buildOfflineModule(userId, course, module, support);
  }

  async getAuthorizedFile(userId: string, courseId: string, fileId: string) {
    const enrollment = await this.courses.findEnrollmentCourse(userId, courseId);
    if (!enrollment || enrollment.course.deletedAt) return null;
    for (const learningModule of enrollment.course.modules) {
      if (!isOfflineModule(learningModule.id)) continue;
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
      for (const resource of learningModule.lessons.flatMap(
        (lesson) => lesson.lessonFiles
      )) {
        const reference = getReferencedLesson(resource);
        if (!reference || reference.courseId === courseId) continue;
        const support = await this.courses.findPublishedSupportLesson?.(
          reference.courseId,
          reference.lessonId
        );
        const file = support?.lessonFiles.find((item) => item.file?.id === fileId)?.file;
        if (file && isDownloadableFile(file)) return file;
      }
    }
    return null;
  }
}
