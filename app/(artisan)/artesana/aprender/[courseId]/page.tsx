import Link from "next/link";
import type { Route } from "next";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Circle,
  Clock3,
  Layers3,
  PlayCircle,
  Sparkles,
  UserRound
} from "lucide-react";

import {
  buildCourseNarration,
  buildModuleNarration
} from "@/shared/accessibility/narration";
import { SpeechButton } from "@/shared/accessibility/speech-button";
import {
  ArtisanHero,
  ArtisanPanel,
  ArtisanShell,
  ArtisanStatCard
} from "@/features/artisan/artisan-panel";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
import { cn } from "@/shared/lib/utils";
import { requireRole } from "@/shared/server/auth/helpers";
import { LearningService } from "@/shared/services/learning.service";

const levelLabels = {
  BEGINNER: "Inicial",
  INTERMEDIATE: "Intermedio",
  ADVANCED: "Avanzado"
} as const;

const lessonTypeLabels = {
  TEXT: "Lectura",
  VIDEO: "Video",
  AUDIO: "Audio",
  PDF: "PDF",
  QUIZ: "Práctica",
  ASSIGNMENT: "Actividad"
} as const;

export default async function ArtisanCourseDetailPage({
  params
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const session = await requireRole("ARTESANA");
  const { enrollment, progress, firstIncompleteLesson, lessonProgress } =
    await new LearningService().getCourseDetail(session.user.id, courseId);

  const course = enrollment.course;
  const lessons = course.modules.flatMap((module, moduleIndex) =>
    module.lessons.map((lesson, lessonIndex) => ({
      lesson,
      module,
      moduleIndex,
      lessonIndex,
      progressItem: lessonProgress.get(lesson.id)
    }))
  );
  const totalLessons = lessons.length;
  const completedLessons = lessons.filter((item) => item.progressItem?.completed).length;
  const isCompleted = totalLessons > 0 && completedLessons === totalLessons;
  const firstLesson = lessons[0]?.lesson;
  const nextLesson = firstIncompleteLesson ?? firstLesson;
  const hasStarted = completedLessons > 0 || progress > 0;
  const statusLabel = isCompleted
    ? "Completado"
    : hasStarted
      ? "En curso"
      : "Por iniciar";
  const nextLessonHref = nextLesson
    ? (`/artesana/aprender/${courseId}/lecciones/${nextLesson.id}` as Route)
    : null;
  const nextLessonLabel = isCompleted
    ? "Repasar el curso"
    : hasStarted
      ? "Continuar mi curso"
      : "Empezar aquí";
  const courseNarration = buildCourseNarration({
    title: course.title,
    description: course.description,
    moduleCount: course.modules.length,
    lessonCount: totalLessons,
    progress,
    nextLessonTitle: nextLesson?.title
  });

  return (
    <ArtisanShell>
      <ArtisanHero
        eyebrow="Curso"
        title={course.title}
        description={
          course.description ??
          "Curso práctico de la ruta Warmi para avanzar paso a paso."
        }
        imageUrl={course.imageUrl ?? undefined}
        actions={
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            {nextLessonHref ? (
              <Button
                asChild
                size="lg"
                className="min-h-[60px] rounded-full bg-[#b51f5d] px-8 text-base text-white shadow-[0_18px_36px_rgba(181,31,93,0.22)] hover:bg-[#8f1748]"
              >
                <Link href={nextLessonHref}>
                  <PlayCircle className="h-5 w-5" />
                  {nextLessonLabel}
                </Link>
              </Button>
            ) : null}
            <div className="rounded-2xl border border-[#f0c7bb] bg-white/85 px-4 py-3 text-sm leading-6 text-[#5b4a42]">
              <strong className="text-[#7a3100]">Siguiente paso:</strong>{" "}
              {nextLesson
                ? isCompleted
                  ? "Puedes volver a revisar las lecciones cuando lo necesites."
                  : `Abre "${nextLesson.title}" y márcala como completada al terminar.`
                : "La facilitadora aún está preparando las lecciones."}
            </div>
            <SpeechButton text={courseNarration} label="Escuchar este curso" compact />
          </div>
        }
      />

      <section className="grid gap-5 md:grid-cols-3">
        <ArtisanStatCard
          title="Avance"
          value={`${progress}%`}
          description={`${completedLessons} de ${totalLessons} lecciones completadas.`}
          icon={BookOpen}
          color="bg-[#2f62a3]"
        />
        <ArtisanStatCard
          title="Módulos"
          value={course.modules.length}
          description="Bloques cortos para aprender sin perderte."
          icon={Layers3}
          color="bg-[#b5245b]"
        />
        <ArtisanStatCard
          title="Estado"
          value={statusLabel}
          description="Tu avance se actualiza automáticamente."
          icon={CheckCircle2}
          color="bg-[#17c3cf]"
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <ArtisanPanel title="Cómo avanzar" eyebrow="Guía rápida">
          <div className="grid gap-3 sm:grid-cols-3">
            <GuideStep
              number="1"
              title="Toca empezar"
              description="Usa el botón principal para abrir tu siguiente lección."
            />
            <GuideStep
              number="2"
              title="Lee o mira"
              description="Revisa el contenido con calma y practica en casa."
            />
            <GuideStep
              number="3"
              title="Marca avance"
              description="Al terminar, toca completar para guardar tu progreso."
            />
          </div>
        </ArtisanPanel>

        <ArtisanPanel title="Progreso del curso" eyebrow="Ruta actual">
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-[#ffd7c2] text-[#7a3100] hover:bg-[#ffd7c2]">
              {levelLabels[course.level]}
            </Badge>
            <Badge variant="outline">{statusLabel}</Badge>
          </div>
          <Progress
            value={progress}
            className="mt-6 h-4 bg-[#f4e7df] [&>div]:bg-[#b5245b]"
            aria-label={`Avance del curso ${progress}%`}
          />
          <div className="mt-5 grid gap-4 md:grid-cols-[auto_1fr] md:items-center">
            <div className="grid h-24 w-24 place-items-center rounded-full bg-[#fff3de] text-center shadow-inner">
              <span className="font-serif text-4xl font-bold text-[#7a3100]">
                {progress}%
              </span>
            </div>
            <div>
              <p className="text-lg font-semibold text-[#1b1c1a]">
                {completedLessons} de {totalLessons} lecciones completadas
              </p>
              <p className="mt-2 text-base leading-7 text-[#5b4a42]">
                El porcentaje se calcula con tus lecciones completadas. No necesitas
                escribir nada: Warmi lo guarda cuando marcas una lección como terminada.
              </p>
            </div>
          </div>
        </ArtisanPanel>
      </section>

      <section className="space-y-6">
        {course.modules.map((module, moduleIndex) => {
          const moduleLessons = module.lessons.map((lesson, lessonIndex) => ({
            lesson,
            lessonIndex,
            progressItem: lessonProgress.get(lesson.id)
          }));
          const moduleCompleted = moduleLessons.filter(
            (item) => item.progressItem?.completed
          ).length;
          const moduleProgress = moduleLessons.length
            ? Math.round((moduleCompleted / moduleLessons.length) * 100)
            : 0;
          const moduleDuration =
            module.durationMin ??
            module.lessons.reduce(
              (total, lesson) => total + (lesson.durationMin ?? 0),
              0
            );
          const moduleNarration = buildModuleNarration({
            order: moduleIndex + 1,
            title: module.title,
            description: module.description,
            lessonCount: module.lessons.length,
            durationMin: moduleDuration,
            lessonTitles: module.lessons.map((lesson) => lesson.title)
          });

          return (
            <ArtisanPanel
              key={module.id}
              eyebrow={`Módulo ${moduleIndex + 1}`}
              title={module.title}
              action={
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-[#fff3de] px-4 py-2 font-ui text-sm font-bold text-[#7a3100]">
                    {moduleProgress}% completado
                  </span>
                  <SpeechButton
                    text={moduleNarration}
                    label="Escuchar este módulo"
                    compact
                  />
                </div>
              }
            >
              {module.description ? (
                <p className="mb-5 max-w-4xl text-base leading-7 text-[#5b4a42]">
                  {module.description}
                </p>
              ) : null}
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {moduleLessons.map(({ lesson, lessonIndex, progressItem }) => {
                  const completed = Boolean(progressItem?.completed);
                  const current = firstIncompleteLesson?.id === lesson.id;

                  return (
                    <LessonStepCard
                      key={lesson.id}
                      href={
                        `/artesana/aprender/${courseId}/lecciones/${lesson.id}` as Route
                      }
                      number={lessonIndex + 1}
                      title={lesson.title}
                      type={lessonTypeLabels[lesson.type]}
                      durationMin={lesson.durationMin ?? 0}
                      completed={completed}
                      current={current}
                    />
                  );
                })}
              </div>
            </ArtisanPanel>
          );
        })}
      </section>

      <ArtisanPanel title="Facilitadora" eyebrow="Acompañamiento">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <span className="inline-flex w-fit rounded-full bg-[#fff0f5] p-4 text-[#b5245b]">
            <UserRound className="h-6 w-6" />
          </span>
          <div>
            <p className="font-serif text-3xl font-bold text-[#1b1c1a]">
              {course.facilitator?.profile?.displayName ??
                course.facilitator?.name ??
                "Facilitadora por asignar"}
            </p>
            <p className="mt-2 max-w-3xl text-base leading-7 text-[#5b4a42]">
              Si tienes dudas, avanza hasta donde puedas y comparte tu consulta en
              mensajes o en el próximo taller.
            </p>
          </div>
        </div>
      </ArtisanPanel>
    </ArtisanShell>
  );
}

function GuideStep({
  number,
  title,
  description
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-2xl border border-[#f0c7bb] bg-[#fffaf8] p-4">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-[#b5245b] font-ui text-sm font-black text-white">
        {number}
      </span>
      <h3 className="mt-4 font-serif text-2xl font-bold text-[#7a3100]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#5b4a42]">{description}</p>
    </article>
  );
}

function LessonStepCard({
  href,
  number,
  title,
  type,
  durationMin,
  completed,
  current
}: {
  href: Route;
  number: number;
  title: string;
  type: string;
  durationMin: number;
  completed: boolean;
  current: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex min-h-[190px] flex-col justify-between overflow-hidden rounded-3xl border bg-white p-5 shadow-[0_16px_40px_rgba(122,49,0,0.07)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_60px_rgba(122,16,66,0.12)] focus:outline-none focus:ring-2 focus:ring-[#b5245b]",
        current
          ? "border-[#b5245b] bg-[#fff7fa]"
          : completed
            ? "border-[#b9dec0]"
            : "border-[#f0c7bb]"
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <span
            className={cn(
              "grid h-12 w-12 shrink-0 place-items-center rounded-2xl font-serif text-2xl font-bold",
              completed
                ? "bg-[#e9f7e9] text-[#2e7d32]"
                : current
                  ? "bg-[#b5245b] text-white"
                  : "bg-[#fff3de] text-[#7a3100]"
            )}
          >
            {completed ? <CheckCircle2 className="h-6 w-6" /> : number}
          </span>
          <Badge
            variant={completed ? "default" : "outline"}
            className={cn(
              "rounded-full",
              completed
                ? "bg-[#e9f7e9] text-[#2e7d32] hover:bg-[#e9f7e9]"
                : current
                  ? "border-[#b5245b] text-[#b5245b]"
                  : "border-[#e8c7b8] text-[#7a3100]"
            )}
          >
            {completed ? "Completada" : current ? "Continúa aquí" : "Pendiente"}
          </Badge>
        </div>
        <p className="mt-5 flex items-center gap-2 font-ui text-xs font-extrabold uppercase tracking-[0.08em] text-[#b5245b]">
          <Clock3 className="h-4 w-4" />
          {type} · {durationMin} min
        </p>
        <h3 className="mt-2 font-serif text-2xl font-bold leading-tight text-[#1b1c1a]">
          {title}
        </h3>
      </div>
      <span
        className={cn(
          "mt-6 inline-flex items-center gap-2 font-ui text-sm font-extrabold",
          completed ? "text-[#2e7d32]" : "text-[#b5245b]"
        )}
      >
        {completed ? (
          <>
            <Sparkles className="h-4 w-4" />
            Repasar lección
          </>
        ) : current ? (
          <>
            <PlayCircle className="h-4 w-4" />
            Abrir siguiente paso
          </>
        ) : (
          <>
            <Circle className="h-4 w-4" />
            Abrir lección
          </>
        )}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
