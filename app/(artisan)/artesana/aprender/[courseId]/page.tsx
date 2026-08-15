import Link from "next/link";
import type { Route } from "next";
import { BookOpen, CheckCircle2, PlayCircle, UserRound } from "lucide-react";

import {
  ArtisanHero,
  ArtisanListItem,
  ArtisanPanel,
  ArtisanShell,
  ArtisanStatCard
} from "@/features/artisan/artisan-panel";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
import { LearningService } from "@/shared/services/learning.service";
import { requireRole } from "@/shared/server/auth/helpers";

export default async function ArtisanCourseDetailPage({
  params
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const session = await requireRole("ARTESANA");
  const { enrollment, progress, firstIncompleteLesson, lessonProgress } =
    await new LearningService().getCourseDetail(session.user.id, courseId);
  const totalLessons = enrollment.course.modules.reduce(
    (total, module) => total + module.lessons.length,
    0
  );

  return (
    <ArtisanShell>
      <ArtisanHero
        eyebrow="Curso"
        title={enrollment.course.title}
        description={enrollment.course.description ?? "Curso de la ruta Warmi."}
        imageUrl={enrollment.course.imageUrl ?? undefined}
        actions={
          firstIncompleteLesson ? (
            <Button
              asChild
              size="lg"
              className="min-h-[56px] rounded-full bg-[#7a3100] px-7 text-base text-white hover:bg-[#5f2600]"
            >
              <Link
                href={
                  `/artesana/aprender/${courseId}/lecciones/${firstIncompleteLesson.id}` as Route
                }
              >
                Continuar mi lección
              </Link>
            </Button>
          ) : null
        }
      />

      <section className="grid gap-5 md:grid-cols-3">
        <ArtisanStatCard
          title="Avance"
          value={`${progress}%`}
          description="Porcentaje completado de este curso."
          icon={BookOpen}
          color="bg-[#2f62a3]"
        />
        <ArtisanStatCard
          title="Módulos"
          value={enrollment.course.modules.length}
          description="Bloques de aprendizaje disponibles."
          icon={PlayCircle}
          color="bg-[#b5245b]"
        />
        <ArtisanStatCard
          title="Lecciones"
          value={totalLessons}
          description="Actividades cortas para practicar paso a paso."
          icon={CheckCircle2}
          color="bg-[#17c3cf]"
        />
      </section>

      <ArtisanPanel title="Progreso del curso" eyebrow="Ruta actual">
        <div className="flex flex-wrap gap-2">
          <Badge>{enrollment.course.level}</Badge>
          <Badge variant="outline">{enrollment.status}</Badge>
        </div>
        <Progress
          value={progress}
          className="mt-6 h-3 bg-[#eadfe2] [&>div]:bg-[#e65578]"
        />
        <p className="mt-4 text-lg text-[#5b4a42]">
          Has completado {progress}% de este curso.
        </p>
      </ArtisanPanel>

      <section className="space-y-6">
        {enrollment.course.modules.map((module) => (
          <ArtisanPanel key={module.id} title={module.title} eyebrow="Módulo">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {module.lessons.map((lesson) => {
                const progressItem = lessonProgress.get(lesson.id);
                return (
                  <Link
                    key={lesson.id}
                    href={
                      `/artesana/aprender/${courseId}/lecciones/${lesson.id}` as Route
                    }
                  >
                    <ArtisanListItem
                      meta={`${lesson.type} · ${lesson.durationMin ?? 0} min`}
                      title={lesson.title}
                      description={
                        progressItem?.completed
                          ? "Lección completada."
                          : "Pendiente para continuar tu avance."
                      }
                    />
                  </Link>
                );
              })}
            </div>
          </ArtisanPanel>
        ))}
      </section>

      <ArtisanPanel title="Facilitadora" eyebrow="Acompañamiento">
        <div className="flex items-start gap-4">
          <span className="inline-flex rounded-full bg-[#fff0f5] p-3 text-[#b5245b]">
            <UserRound className="h-5 w-5" />
          </span>
          <p className="text-lg leading-8 text-[#5b4a42]">
            {enrollment.course.facilitator?.profile?.displayName ??
              enrollment.course.facilitator?.name ??
              "La facilitadora vinculada aparecerá en los talleres asociados al curso."}
          </p>
        </div>
      </ArtisanPanel>
    </ArtisanShell>
  );
}
