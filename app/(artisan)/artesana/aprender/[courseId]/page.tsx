import {
  learningState,
  durationLabel,
  moduleDuration,
  countLabel
} from "@/shared/learning/presentation";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
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
  ArtisanShell
} from "@/features/artisan/artisan-panel";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
import { cn } from "@/shared/lib/utils";
import { requireRole } from "@/shared/server/auth/helpers";
import { LearningService } from "@/shared/services/learning.service";
import { ModuleDownload } from "@/features/artisan/offline/module-download";
import { isOfflineModule } from "@/shared/offline/module3-types";
import { OfflineLearningService } from "@/shared/services/offline-learning.service";
import { LEARNING_PROGRAM } from "@/shared/learning/program";

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
  const offlineSnapshots = new Map(
    await Promise.all(
      course.modules
        .filter((module) => isOfflineModule(module.id))
        .map(
          async (module) =>
            [
              module.id,
              await new OfflineLearningService().getModuleSnapshot(
                session.user.id,
                course,
                module,
                enrollment.lessonProgresses
                  .filter((p) => p.completed)
                  .map((p) => p.lessonId)
              )
            ] as const
        )
    )
  );
  const displayedModules =
    course.id === LEARNING_PROGRAM.id
      ? LEARNING_PROGRAM.modules.map((presentation) => ({
          presentation,
          module:
            presentation.status === "available"
              ? course.modules.find((module) => module.id === presentation.id)
              : undefined
        }))
      : course.modules.map((module) => ({ module, presentation: undefined }));
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
  const courseState = learningState(
    lessons.map((item) => item.lesson),
    enrollment.lessonProgresses
  );
  const hasStarted = courseState.started;
  const statusLabel = isCompleted
    ? "Completado"
    : hasStarted
      ? "En progreso"
      : "No iniciado";
  const nextLessonHref = nextLesson
    ? (`/artesana/aprender/${courseId}/lecciones/${nextLesson.id}` as Route)
    : null;
  const nextLessonLabel = isCompleted
    ? "Repasar el curso"
    : hasStarted
      ? "Continuar mi curso"
      : "Comenzar mi curso";
  const visibleModuleCount = course.modules.length;
  const courseNarration = buildCourseNarration({
    title: course.title,
    description: course.description,
    moduleCount: visibleModuleCount,
    lessonCount: totalLessons,
    progress,
    nextLessonTitle: nextLesson?.title
  });

  return (
    <ArtisanShell>
      <ArtisanHero
        eyebrow={course.id === LEARNING_PROGRAM.id ? "Programa" : "Curso"}
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

      <ArtisanPanel
        title="Resumen de tu ruta"
        eyebrow="Avance del curso"
        action={
          nextLessonHref ? (
            <Button
              asChild
              className="min-h-[48px] rounded-full bg-[#b5245b] px-6 font-ui font-extrabold text-white hover:bg-[#941747]"
            >
              <Link href={nextLessonHref}>
                <PlayCircle className="h-5 w-5" />
                {nextLessonLabel}
              </Link>
            </Button>
          ) : null
        }
      >
        <div className="grid gap-6 lg:grid-cols-[220px_1fr] lg:items-center">
          <div
            className="mx-auto grid h-44 w-44 place-items-center rounded-full bg-[conic-gradient(#b5245b_var(--course-progress),#f4c542_var(--course-progress)_100%)] p-3 [--course-progress:0%] lg:mx-0"
            style={{ "--course-progress": `${progress}%` } as CSSProperties}
          >
            <div className="grid h-full w-full place-items-center rounded-full bg-white text-center shadow-inner">
              <div>
                <p className="font-serif text-5xl font-bold text-[#1b1c1a]">
                  {progress}%
                </p>
                <p className="mt-1 text-sm font-semibold text-[#5b4a42]">de avance</p>
              </div>
            </div>
          </div>

          <div>
            <div className="grid gap-3 sm:grid-cols-3">
              <SummaryPill
                icon={BookOpen}
                title="Lecciones"
                value={
                  totalLessons ? `${completedLessons} de ${totalLessons}` : "Sin sesiones"
                }
                description="Completadas"
                color="bg-[#2f62a3]"
              />
              <SummaryPill
                icon={Layers3}
                title="Módulos"
                value={visibleModuleCount}
                description="Bloques del curso"
                color="bg-[#b5245b]"
              />
              <SummaryPill
                icon={CheckCircle2}
                title="Estado"
                value={statusLabel}
                description="Se actualiza solo"
                color="bg-[#17c3cf]"
              />
            </div>
            <Progress
              value={progress}
              className="mt-6 h-4 bg-[#f4e7df] [&>div]:bg-[#b5245b]"
              aria-label={`Avance del curso ${progress}%`}
            />
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge className="bg-[#ffd7c2] text-[#7a3100] hover:bg-[#ffd7c2]">
                {levelLabels[course.level]}
              </Badge>
              <Badge variant="outline">{statusLabel}</Badge>
            </div>
            <div className="mt-5 rounded-2xl border border-[#f0c7bb] bg-[#fffaf6] p-4">
              <p className="text-base font-semibold leading-7 text-[#5b4a42]">
                Para avanzar, entra a la siguiente clase, revisa el contenido y al final
                toca <strong className="text-[#b5245b]">Lección completada</strong>. Tu
                progreso se calcula automáticamente.
              </p>
            </div>
          </div>
        </div>
      </ArtisanPanel>

      <section className="rounded-[28px] border-2 border-[#b5245b] bg-[#fff5f8] p-4 shadow-[0_28px_70px_rgba(181,36,91,0.12)] md:p-6">
        <header className="mb-6 flex flex-col gap-4 rounded-[22px] bg-white p-5 shadow-[0_16px_40px_rgba(122,49,0,0.08)] md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#b5245b] text-white">
              <PlayCircle className="h-8 w-8" />
            </span>
            <div>
              <p className="font-ui text-xs font-extrabold uppercase tracking-[0.08em] text-[#b5245b]">
                Aquí tomas tus clases
              </p>
              <h2 className="mt-1 font-serif text-3xl font-bold text-[#1b1c1a] md:text-4xl">
                Módulos y lecciones
              </h2>
              <p className="mt-2 text-base leading-7 text-[#5b4a42]">
                Toca la tarjeta destacada para abrir tu siguiente clase.
              </p>
            </div>
          </div>
          {nextLessonHref ? (
            <Button
              asChild
              size="lg"
              className="min-h-[56px] rounded-full bg-[#b5245b] px-7 font-ui text-base font-extrabold text-white hover:bg-[#941747]"
            >
              <Link href={nextLessonHref}>
                <PlayCircle className="h-5 w-5" />
                Entrar a mi clase
              </Link>
            </Button>
          ) : null}
        </header>

        <div className="space-y-6">
          {displayedModules.map(({ module, presentation }, moduleIndex) => {
            if (!module) {
              if (!presentation) return null;
              return (
                <ArtisanPanel
                  key={`preparing-${presentation.order}`}
                  eyebrow={`Módulo ${presentation.order}`}
                  title={presentation.title}
                >
                  <ModuleCover image={presentation.image} />
                  <p role="status" className="text-base leading-7 text-[#5b4a42]">
                    Contenido en preparación.
                  </p>
                </ArtisanPanel>
              );
            }
            const moduleLessons = module.lessons.map((lesson, lessonIndex) => ({
              lesson,
              lessonIndex,
              progressItem: lessonProgress.get(lesson.id)
            }));
            const estimatedMinutes = moduleDuration(module);
            const state = learningState(module.lessons, enrollment.lessonProgresses);
            const moduleProgress = state.percentage;
            const canonicalModule = presentation;
            const moduleTitle = canonicalModule?.title ?? module.title;
            const moduleNarration = buildModuleNarration({
              order:
                course.id === LEARNING_PROGRAM.id || isOfflineModule(module.id)
                  ? module.order
                  : moduleIndex + 1,
              title: moduleTitle,
              description: module.description,
              lessonCount: module.lessons.length,
              durationMin: estimatedMinutes,
              lessonTitles: module.lessons.map((lesson) => lesson.title)
            });

            return (
              <ArtisanPanel
                key={module.id}
                eyebrow={`Módulo ${course.id === LEARNING_PROGRAM.id || isOfflineModule(module.id) ? module.order : moduleIndex + 1}`}
                title={moduleTitle.replace(/^Módulo \d+:\s*/, "")}
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
                {canonicalModule && <ModuleCover image={canonicalModule.image} />}
                {offlineSnapshots.has(module.id) && (
                  <ModuleDownload module={offlineSnapshots.get(module.id)!} />
                )}
                {module.description ? (
                  <p className="mb-5 max-w-4xl text-base leading-7 text-[#5b4a42]">
                    {module.description}
                  </p>
                ) : null}
                {moduleLessons.length > 0 && (
                  <div className="mb-6 flex flex-col items-start gap-3">
                    <p className="text-base font-bold text-[#24756f]">
                      {[
                        countLabel(moduleLessons.length, "sesión", "sesiones"),
                        durationLabel(estimatedMinutes),
                        state.label
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <Button
                      asChild
                      className="h-auto min-h-12 whitespace-normal rounded-md bg-[#b5245b] px-5 py-3 text-base text-white hover:bg-[#941747]"
                    >
                      <Link
                        href={
                          `/artesana/aprender/${courseId}/lecciones/${(moduleLessons.find((item) => !item.progressItem?.completed) ?? moduleLessons[0]).lesson.id}` as Route
                        }
                      >
                        <PlayCircle className="h-5 w-5 shrink-0" />
                        {state.action} Módulo {module.order}
                      </Link>
                    </Button>
                  </div>
                )}
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {moduleLessons.map(({ lesson, progressItem }) => {
                    const completed = Boolean(progressItem?.completed);
                    const current = firstIncompleteLesson?.id === lesson.id;

                    return (
                      <LessonStepCard
                        key={lesson.id}
                        href={
                          `/artesana/aprender/${courseId}/lecciones/${lesson.id}` as Route
                        }
                        number={lesson.order}
                        title={lesson.title}
                        type={lessonTypeLabels[lesson.type]}
                        durationMin={lesson.durationMin}
                        completed={completed}
                        current={current}
                        started={Boolean(
                          progressItem?.startedAt || progressItem?.progress
                        )}
                      />
                    );
                  })}
                </div>
              </ArtisanPanel>
            );
          })}
        </div>
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

function ModuleCover({ image }: { image: { src: string; alt: string } }) {
  return (
    <div className="relative mb-5 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-[#fff3de] md:aspect-[3/1]">
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes="(min-width: 1280px) 1200px, 100vw"
        className="object-cover"
      />
    </div>
  );
}

function SummaryPill({
  icon: Icon,
  title,
  value,
  description,
  color
}: {
  icon: LucideIcon;
  title: string;
  value: string | number;
  description: string;
  color: string;
}) {
  return (
    <article className="rounded-2xl border border-[#f0c7bb] bg-white p-4 shadow-[0_12px_30px_rgba(122,49,0,0.05)]">
      <span
        className={cn("grid h-11 w-11 place-items-center rounded-2xl text-white", color)}
      >
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 font-ui text-xs font-extrabold uppercase tracking-[0.08em] text-[#b5245b]">
        {title}
      </p>
      <p className="mt-1 font-serif text-3xl font-bold text-[#1b1c1a]">{value}</p>
      <p className="mt-1 text-sm leading-6 text-[#5b4a42]">{description}</p>
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
  current,
  started
}: {
  href: Route;
  number: number;
  title: string;
  type: string;
  durationMin: number | null;
  completed: boolean;
  current: boolean;
  started: boolean;
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
            {completed
              ? "Completada"
              : started
                ? "En progreso"
                : current
                  ? "Comienza aquí"
                  : "Pendiente"}
          </Badge>
        </div>
        <p className="mt-5 flex items-center gap-2 font-ui text-xs font-extrabold uppercase tracking-[0.08em] text-[#b5245b]">
          <Clock3 className="h-4 w-4" />
          {[type, durationLabel(durationMin)].filter(Boolean).join(" · ")}
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
