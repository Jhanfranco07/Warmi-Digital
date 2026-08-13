import { FileText, NotebookPen, Video } from "lucide-react";

import { LessonCompletionButton } from "@/features/artisan/lesson-completion-button";
import {
  ArtisanHero,
  ArtisanListItem,
  ArtisanPanel,
  ArtisanShell
} from "@/features/artisan/artisan-panel";
import { Badge } from "@/shared/components/ui/badge";
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
    <ArtisanShell>
      <ArtisanHero
        eyebrow={enrollment.course.title}
        title={lesson.title}
        description={`Módulo: ${lesson.module.title}`}
        imageUrl="/images/learning/cursos-spoiler.png"
      />

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <ArtisanPanel title="Contenido de la lección" eyebrow="Aprendizaje">
          <div className="flex flex-wrap gap-2">
            <Badge>{lesson.type}</Badge>
            <Badge variant="outline">{lesson.durationMin ?? 0} min</Badge>
          </div>
          {lesson.type === "VIDEO" ? (
            <div className="mt-6 flex aspect-video items-center justify-center bg-[#1b1c1a] text-white shadow-[0_22px_50px_rgba(27,28,26,0.18)]">
              <Video className="mr-3 h-8 w-8" />
              Video de aprendizaje
            </div>
          ) : null}
          <div className="mt-6 text-lg leading-8 text-[#5b4a42]">
            <p>{lesson.content ?? "Contenido de la lección pendiente de ampliar."}</p>
          </div>
          <div className="mt-7">
            <LessonCompletionButton
              courseId={courseId}
              lessonId={lessonId}
              completed={progress?.completed}
            />
          </div>
        </ArtisanPanel>

        <div className="space-y-6">
          <ArtisanPanel title="Recursos" eyebrow="Materiales">
            <div className="grid gap-4">
              {lesson.lessonFiles.length ? (
                lesson.lessonFiles.map((resource) => (
                  <a key={resource.id} href={resource.file.url}>
                    <ArtisanListItem
                      meta="Descarga"
                      title="Material de apoyo"
                      description="Abre o descarga el archivo de esta lección."
                    />
                  </a>
                ))
              ) : (
                <p className="text-base leading-7 text-[#5b4a42]">
                  La facilitadora aún no agregó materiales descargables.
                </p>
              )}
            </div>
          </ArtisanPanel>

          <ArtisanPanel title="Actividad práctica" eyebrow="Aplicar">
            <div className="flex items-start gap-4">
              <span className="inline-flex rounded-full bg-[#fff0f5] p-3 text-[#b5245b]">
                <NotebookPen className="h-5 w-5" />
              </span>
              <p className="text-base leading-7 text-[#5b4a42]">
                Aplica esta lección en una pieza, foto o nota de tu proceso artesanal.
                Luego puedes compartir tu avance con tu facilitadora.
              </p>
            </div>
          </ArtisanPanel>

          <ArtisanPanel title="Sugerencia" eyebrow="Guardar evidencia">
            <div className="flex items-start gap-4">
              <span className="inline-flex rounded-full bg-[#e8fbfc] p-3 text-[#0b7f88]">
                <FileText className="h-5 w-5" />
              </span>
              <p className="text-base leading-7 text-[#5b4a42]">
                Toma una captura o fotografía de tu avance para usarla luego en tu
                historia o en tu vitrina cultural.
              </p>
            </div>
          </ArtisanPanel>
        </div>
      </section>
    </ArtisanShell>
  );
}
