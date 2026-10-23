import type { Route } from "next";
import { ArtisanShell } from "@/features/artisan/artisan-panel";
import { LessonCompletionButton } from "@/features/artisan/lesson-completion-button";
import { Module3Session1Content } from "@/features/artisan/learning/module3-session1-content";
import { LearningService } from "@/shared/services/learning.service";
import {
  MODULE3_SESSION2_ID,
  type Session1Resource
} from "@/shared/learning/module3-session1";
import { getReferencedLesson } from "@/shared/offline/module3-types";

type Detail = Awaited<ReturnType<LearningService["getLessonDetail"]>>;
function resourceView(
  resource: Detail["lesson"]["lessonFiles"][number],
  courseId: string
): Session1Resource {
  const reference = getReferencedLesson(resource);
  const preview = resource.file && `/api/files/${resource.file.id}/preview`;
  return {
    id: resource.id,
    title: resource.title,
    description: resource.description,
    ...(reference
      ? { internalHref: `/artesana/aprender/${courseId}/lecciones/${reference.lessonId}` }
      : {}),
    ...(resource.file
      ? {
          fileId: resource.file.id,
          mimeType: resource.file.mimeType,
          size: resource.file.size,
          url:
            resource.file.mimeType === "application/pdf" ? preview! : resource.file.url,
          downloadUrl: `${preview}?download=1`
        }
      : {})
  };
}
export async function Module3Session1Lesson({
  courseId,
  userId,
  lesson,
  completed
}: {
  courseId: string;
  userId: string;
  lesson: Detail["lesson"];
  completed: boolean;
}) {
  const support = await new LearningService().getLessonSupport(
    userId,
    courseId,
    lesson.module.id,
    MODULE3_SESSION2_ID
  );
  const href = `/artesana/aprender/${courseId}` as Route;
  return (
    <ArtisanShell>
      <div className="mx-auto max-w-3xl space-y-5">
        <Module3Session1Content
          courseHref={href}
          nextSessionHref={
            support ? `/artesana/aprender/${courseId}/lecciones/${support.id}` : undefined
          }
          title={lesson.title}
          content={lesson.content}
          resources={lesson.lessonFiles.map((item) => resourceView(item, courseId))}
          relatedResources={(support?.lessonFiles ?? [])
            .filter((item) => item.file?.mimeType === "video/mp4")
            .map((item) => resourceView(item, courseId))}
        />
        <LessonCompletionButton
          courseId={courseId}
          lessonId={lesson.id}
          completed={completed}
          courseHref={href}
        />
      </div>
    </ArtisanShell>
  );
}
