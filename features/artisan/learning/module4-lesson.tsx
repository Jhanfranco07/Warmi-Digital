import { ArtisanShell } from "@/features/artisan/artisan-panel";
import { Module4Content } from "@/features/artisan/learning/module4-content";
import { module4ImageKey } from "@/shared/learning/module4";
import type { LearningService } from "@/shared/services/learning.service";
type Detail = Awaited<ReturnType<LearningService["getLessonDetail"]>>;
export function Module4Lesson({
  courseId,
  lesson,
  completedIds
}: {
  courseId: string;
  lesson: Detail["lesson"];
  completedIds: string[];
}) {
  return (
    <ArtisanShell>
      <Module4Content
        courseId={courseId}
        lessonId={lesson.id}
        completedIds={completedIds}
        visuals={lesson.lessonFiles.flatMap((r) => {
          const key = module4ImageKey(r.file?.publicId);
          return key && r.file ? [{ key, url: r.file.url }] : [];
        })}
      />
    </ArtisanShell>
  );
}
