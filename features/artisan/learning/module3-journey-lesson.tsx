import { ArtisanShell } from "@/features/artisan/artisan-panel";
import { Module3JourneyContent } from "@/features/artisan/learning/module3-journey-content";
import type { LearningService } from "@/shared/services/learning.service";

type Detail = Awaited<ReturnType<LearningService["getLessonDetail"]>>;
export function Module3JourneyLesson({
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
      <Module3JourneyContent
        courseId={courseId}
        lessonId={lesson.id}
        completedIds={completedIds}
        resources={lesson.lessonFiles.flatMap((r) =>
          r.file
            ? [
                {
                  id: r.id,
                  title: r.title,
                  mimeType: r.file.mimeType,
                  publicId: r.file.publicId,
                  url:
                    r.file.mimeType === "application/pdf"
                      ? `/api/files/${r.file.id}/preview`
                      : r.file.url,
                  downloadUrl: `/api/files/${r.file.id}/preview?download=1`
                }
              ]
            : []
        )}
      />
    </ArtisanShell>
  );
}
