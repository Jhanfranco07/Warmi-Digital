import { notFound } from "next/navigation";

import {
  CourseEditor,
  type CourseEditorData
} from "@/features/facilitator/course-editor/course-editor";
import { CourseRepository } from "@/shared/repositories/course.repository";
import { requireRole } from "@/shared/server/auth/helpers";

export default async function Page({
  params
}: {
  params: Promise<{ courseId: string }>;
}) {
  const session = await requireRole("FACILITADORA");
  const { courseId } = await params;

  const course = await new CourseRepository().findManagedCourse(
    session.user.id,
    courseId
  );

  if (!course) {
    notFound();
  }

  const serializedCourse: CourseEditorData = {
    id: course.id,
    title: course.title,
    description: course.description,
    level: course.level,
    status: course.status,
    durationMin: course.durationMin,
    imageUrl: course.imageUrl,

    modules: course.modules.map((module) => ({
      id: module.id,
      title: module.title,
      description: module.description,
      order: module.order,
      durationMin: module.durationMin,

      coverFileId: module.coverFileId,

      // CourseEditor necesita el registro File completo
      coverFile: module.coverFile,

      lessons: module.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        content: lesson.content,
        type: lesson.type,
        order: lesson.order,
        durationMin: lesson.durationMin,

        lessonFiles: lesson.lessonFiles.map((resource) => ({
          id: resource.id,
          type: resource.type,
          title: resource.title,
          description: resource.description,
          position: resource.position,
          provider: resource.provider,
          externalId: resource.externalId,
          originalUrl: resource.originalUrl,

          file: resource.file
            ? {
                id: resource.file.id,
                url: resource.file.url,
                type: resource.file.type,
                mimeType: resource.file.mimeType,
                altText: resource.file.altText
              }
            : null
        }))
      }))
    }))
  };

  return <CourseEditor course={serializedCourse} />;
}