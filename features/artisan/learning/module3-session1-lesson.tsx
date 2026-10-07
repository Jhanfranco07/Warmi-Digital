import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft } from "lucide-react";
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
  const course = await new LearningService().getCourseDetail(userId, courseId);
  const support = course.enrollment.course.modules
    .find((item) => item.id === lesson.module.id)
    ?.lessons.find((item) => item.id === MODULE3_SESSION2_ID);
  const href = `/artesana/aprender/${courseId}` as Route;
  return (
    <ArtisanShell>
      <div className="mx-auto max-w-3xl space-y-5">
        <header className="space-y-3 border-b border-[#ead2dc] pb-5">
          <Link
            href={href}
            className="inline-flex min-h-12 items-center gap-2 font-bold text-[#b5245b]"
          >
            <ArrowLeft className="h-5 w-5" />
            Aprender para crecer
          </Link>
          <p className="text-sm font-bold text-[#24756f]">{lesson.module.title}</p>
          <h1 className="font-display text-2xl font-bold text-[#202b29]">
            {lesson.title}
          </h1>
        </header>
        <Module3Session1Content
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
