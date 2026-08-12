import { FileText, Video } from "lucide-react";

import { LessonCompletionButton } from "@/features/artisan/lesson-completion-button";
import { Container } from "@/shared/components/layout/container";
import { PageHeader } from "@/shared/components/layout/page-header";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { LearningService } from "@/shared/services/learning.service";
import { requireRole } from "@/shared/server/auth/helpers";

export default async function ArtisanLessonPage({
  params
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;
  const session = await requireRole("ARTESANA");
  const { enrollment, lesson, progress } = await new LearningService().getLessonDetail(
    session.user.id,
    courseId,
    lessonId
  );

  return (
    <Container className="space-y-8 py-6 md:py-10">
      <PageHeader
        eyebrow={enrollment.course.title}
        title={lesson.title}
        description={`Modulo: ${lesson.module.title}`}
      />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-2">
            <Badge>{lesson.type}</Badge>
            <Badge variant="outline">{lesson.durationMin ?? 0} min</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {lesson.type === "VIDEO" ? (
            <div className="flex aspect-video items-center justify-center rounded-md bg-surface-high text-muted-foreground">
              <Video className="mr-2 h-6 w-6" />
              Video de aprendizaje
            </div>
          ) : null}
          <div className="prose prose-sm max-w-none text-body-lg">
            <p>{lesson.content ?? "Contenido de la lección pendiente de ampliar."}</p>
          </div>
          <LessonCompletionButton
            courseId={courseId}
            lessonId={lessonId}
            completed={progress?.completed}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recursos y actividad práctica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {lesson.lessonFiles.length ? (
            lesson.lessonFiles.map((resource) => (
              <a
                key={resource.id}
                href={resource.file.url}
                className="flex min-h-touch-target items-center gap-3 rounded-md border border-border p-3"
              >
                <FileText className="h-5 w-5 text-primary" />
                Descargar material
              </a>
            ))
          ) : (
            <p className="text-body-md text-muted-foreground">
              La facilitadora aún no agregó materiales descargables.
            </p>
          )}
          <div className="rounded-md border border-border p-3">
            <p className="font-medium">Actividad práctica</p>
            <p className="mt-1 text-body-md text-muted-foreground">
              Aplica esta lección en una pieza, foto o nota de tu proceso artesanal.
            </p>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}
