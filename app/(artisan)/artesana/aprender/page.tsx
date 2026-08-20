import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { format } from "date-fns";
import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  Clock,
  MapPin,
  Palette
} from "lucide-react";

import {
  MobileLearningTabs,
  type MobileLearningCourse
} from "@/features/artisan/mobile-learning-tabs";
import { SpeechButton } from "@/shared/accessibility/speech-button";
import { buildLearningPageNarration } from "@/shared/accessibility/narration";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
import { ArtisanDashboardService } from "@/shared/services/artisan-dashboard.service";
import { LearningService } from "@/shared/services/learning.service";
import { requireRole } from "@/shared/server/auth/helpers";

export default async function ArtisanLearningPage() {
  const session = await requireRole("ARTESANA");
  const [learning, dashboard] = await Promise.all([
    new LearningService().getLearningPage(session.user.id),
    new ArtisanDashboardService().getDashboard(session.user.id)
  ]);
  const enrolled = learning.enrolledCourses;
  const averageProgress = enrolled.length
    ? Math.round(
        enrolled.reduce((total, course) => total + course.progress, 0) / enrolled.length
      )
    : 0;
  const completedModules = Math.round((averageProgress / 100) * 5);
  const currentCourse = dashboard.currentEnrollment?.course;
  const profile = dashboard.artisan?.profile;
  const displayName = profile?.displayName ?? session.user.name ?? "Artesana Warmi";
  const craft = profile?.craftTypes[0]?.craftType.name ?? "Especialidad por registrar";
  const avatarUrl = profile?.avatarUrl ?? null;

  const mobileCourses = enrolled.map(toDisplayCourse);
  const inProgressCourses = mobileCourses.filter((course) => course.progress < 100);
  const completedCourses = mobileCourses.filter((course) => course.progress >= 100);
  const availableMobileCourses = learning.availableCourses.map(toAvailableDisplayCourse);
  const workshopStats = dashboard.workshops;
  const pageNarration = buildLearningPageNarration({
    enrolledCount: enrolled.length,
    availableCount: learning.availableCourses.length,
    currentCourseTitle: currentCourse?.title
  });

  return (
    <>
      <section className="relative overflow-hidden bg-[#fffaf6] px-5 pb-7 pt-6 lg:hidden">
        <div className="pointer-events-none absolute -right-14 top-6 h-40 w-40 rounded-full bg-[#ffe6ee]" />
        <div className="pointer-events-none absolute -right-5 top-10 h-36 w-36 overflow-hidden rounded-full border-4 border-white/70 opacity-90 shadow-[0_18px_38px_rgba(181,36,91,0.14)]">
          <Image
            src="/images/learning/cursos-spoiler.png"
            alt=""
            fill
            sizes="144px"
            className="object-cover object-[78%_52%]"
          />
          <div className="absolute inset-0 bg-[#ffe6ee]/20" />
        </div>

        <div className="relative">
          <h1 className="font-serif text-4xl font-bold leading-tight text-[#7a1042]">
            Mis cursos <span className="text-[#c93772]">*</span>
          </h1>
          <p className="mt-2 max-w-[240px] text-sm leading-5 text-[#5b4a42]">
            Sigue aprendiendo y avanzando paso a paso hacia tus metas.
          </p>
          <div className="mt-4">
            <SpeechButton text={pageNarration} label="Escuchar esta pantalla" compact />
          </div>

          <MobileLearningTabs
            availableCourses={availableMobileCourses}
            completedCourses={completedCourses}
            inProgressCourses={inProgressCourses}
          />

          <MobileSectionLabel title="Talleres en vivo" />
          <div className="mt-3 rounded-2xl border border-[#f5d2dc] bg-white p-4 shadow-[0_12px_26px_rgba(122,16,66,0.08)]">
            <div className="grid grid-cols-3 divide-x divide-[#f4cbd6]">
              <MobileWorkshopStat
                label="Próximos"
                value={String(workshopStats.upcoming.length)}
              />
              <MobileWorkshopStat
                label="Completados"
                value={String(workshopStats.completed.length)}
              />
              <MobileWorkshopStat
                label="Participando"
                value={String(
                  workshopStats.upcoming.length + workshopStats.completed.length
                )}
              />
            </div>
          </div>

          <div className="mt-5 flex gap-3 overflow-x-auto pb-1">
            {workshopStats.upcoming.length ? (
              workshopStats.upcoming.slice(0, 5).map((registration) => (
                <span
                  key={registration.id}
                  className="grid min-w-16 place-items-center rounded-2xl border border-[#b5245b] bg-white px-3 py-3 text-center text-[#b5245b] shadow-sm"
                >
                  <span className="text-[11px] font-bold">
                    {registration.workshop.startsAt
                      ? format(registration.workshop.startsAt, "MMM").toUpperCase()
                      : "TAL"}
                  </span>
                  <span className="font-serif text-2xl font-bold">
                    {registration.workshop.startsAt
                      ? format(registration.workshop.startsAt, "dd")
                      : "--"}
                  </span>
                  <span className="text-xs">
                    {registration.workshop.startsAt
                      ? format(registration.workshop.startsAt, "EEE")
                      : ""}
                  </span>
                </span>
              ))
            ) : (
              <MobileInlineEmpty text="No tienes talleres próximos." />
            )}
          </div>

          <div className="mt-5 flex items-center justify-between">
            <MobileSectionLabel title="Próximos talleres" className="mt-0" />
            <Link href="/artesana/talleres" className="text-xs font-bold text-[#b5245b]">
              Ver todos
            </Link>
          </div>
          <div className="mt-3 space-y-4">
            {workshopStats.upcoming.length ? (
              workshopStats.upcoming
                .slice(0, 3)
                .map((registration) => (
                  <MobileWorkshopCard
                    key={registration.id}
                    workshop={toDisplayWorkshop(registration)}
                  />
                ))
            ) : (
              <MobileInlineEmpty text="No tienes talleres próximos." />
            )}
          </div>

          <div className="mt-5">
            <MobileSectionLabel title="Talleres completados" className="mt-0" />
            {workshopStats.completed[0] ? (
              <MobileWorkshopCard
                workshop={toDisplayWorkshop(workshopStats.completed[0])}
                completed
              />
            ) : (
              <MobileInlineEmpty text="Aún no tienes talleres completados." />
            )}
          </div>
        </div>
      </section>

      <main className="hidden min-h-screen bg-[#fffaf6] px-4 py-5 pb-24 md:px-8 lg:block lg:px-10 lg:py-10 xl:px-14 2xl:px-20">
        <div className="mx-auto w-full max-w-[1760px]">
          <header className="flex items-start justify-between gap-6">
            <div>
              <h1 className="font-serif text-5xl font-bold leading-none text-[#101833] xl:text-6xl 2xl:text-7xl">
                Hola, {displayName}
                <span className="ml-3 text-4xl text-[#b5245b]">*</span>
              </h1>
              <p className="mt-4 text-lg leading-8 text-[#5b4a42]">
                Este es tu espacio para aprender, fortalecer tu historia y avanzar paso a
                paso.
              </p>
            </div>
            <SpeechButton
              text={pageNarration}
              label="Escuchar esta pantalla"
              className="max-w-xs"
            />

            <div className="hidden items-center gap-3 xl:flex">
              <span className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-white shadow-[0_12px_28px_rgba(122,49,0,0.16)]">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={displayName}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <span className="grid h-full w-full place-items-center bg-[#ffe8ef] font-ui text-xl font-extrabold text-[#b5245b]">
                    {displayName.slice(0, 1)}
                  </span>
                )}
              </span>
              <div>
                <p className="font-ui text-base font-extrabold text-[#1b1c1a]">
                  {displayName}
                </p>
                <p className="text-sm text-[#5b4a42]">Artesana</p>
              </div>
            </div>
          </header>

          <section className="mt-10 grid gap-8 xl:grid-cols-[1.35fr_0.95fr]">
            <article className="relative overflow-hidden rounded-[20px] border border-[#ecd0bd] bg-white p-8 shadow-[0_22px_58px_rgba(122,49,0,0.08)]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <h2 className="font-serif text-3xl font-bold text-[#b5245b]">
                  Tu avance general
                </h2>
                <div className="flex flex-wrap gap-3">
                  <Badge className="rounded-xl bg-[#ffe8ef] px-5 py-2 text-[#b5245b] hover:bg-[#ffe8ef]">
                    {dashboard.routeName}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="rounded-xl border-[#e9edf5] bg-[#f5f7fb] px-5 py-2 text-[#123f78]"
                  >
                    {profile?.community?.name ?? "Comunidad pendiente"}
                  </Badge>
                  <Badge className="rounded-xl bg-[#fff0d6] px-5 py-2 text-[#b96700] hover:bg-[#fff0d6]">
                    {craft}
                  </Badge>
                </div>
              </div>

              <div className="mt-8 grid items-center gap-9 xl:grid-cols-[250px_1fr]">
                <div
                  className="grid h-52 w-52 place-items-center rounded-full"
                  style={{
                    background: `conic-gradient(#b5245b 0 ${averageProgress}%, #f4c542 ${averageProgress}% 100%)`
                  }}
                >
                  <div className="grid h-40 w-40 place-items-center rounded-full bg-white text-center shadow-inner">
                    <div>
                      <p className="font-serif text-6xl font-bold text-[#1b1c1a]">
                        {averageProgress}%
                      </p>
                      <p className="mt-1 text-sm text-[#5b4a42]">de tu ruta actual</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-5">
                    <span className="grid h-16 w-16 place-items-center rounded-full bg-[#fff0df] text-[#c27a30]">
                      <Palette className="h-8 w-8" />
                    </span>
                    <div>
                      <p className="font-ui text-xl font-extrabold text-[#b5245b]">
                        Próximo objetivo
                      </p>
                      <p className="mt-1 text-lg text-[#5b4a42]">
                        Completar el módulo {Math.min(completedModules + 1, 5)}: Cuenta tu
                        historia.
                      </p>
                    </div>
                  </div>
                  <Progress
                    value={averageProgress}
                    className="mt-7 h-4 rounded-full bg-[#f2e7de] [&>div]:rounded-full [&>div]:bg-[#b5245b]"
                  />
                  <p className="mt-4 text-base text-[#5b4a42]">
                    {completedModules} de 5 módulos completados
                  </p>
                  {currentCourse ? (
                    <Button
                      asChild
                      size="lg"
                      className="mt-7 min-h-[58px] rounded-xl bg-[#b5245b] px-8 text-base font-extrabold text-white shadow-[0_14px_28px_rgba(181,36,91,0.22)] hover:bg-[#941747]"
                    >
                      <Link href={`/artesana/aprender/${currentCourse.id}` as Route}>
                        <BookOpen className="h-5 w-5" />
                        Continuar lección
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </div>
            </article>

            <article className="overflow-hidden rounded-[20px] border border-[#ecd0bd] bg-white shadow-[0_22px_58px_rgba(122,49,0,0.08)]">
              <header className="flex items-center justify-between border-b border-[#ecd0bd] bg-[#fff7e8] px-8 py-6">
                <h2 className="font-serif text-3xl font-bold text-[#a95511]">
                  Sigue aprendiendo
                </h2>
                <span className="text-4xl text-[#f0c8a6]">#</span>
              </header>
              <div className="grid gap-6 p-8 md:grid-cols-[190px_1fr]">
                <div className="relative aspect-square overflow-hidden rounded-[22px] bg-[#1f2d55]">
                  <LearningImagePlaceholder />
                  <span className="absolute inset-0 bg-[#101833]/10" />
                </div>
                <div>
                  <h3 className="font-serif text-3xl font-bold leading-tight text-[#1b1c1a]">
                    {dashboard.nextWorkshop?.workshop.title ?? "No tienes taller próximo"}
                  </h3>
                  <div className="mt-5 grid gap-3 text-base text-[#5b4a42]">
                    <p className="flex items-center gap-3">
                      <CalendarDays className="h-5 w-5 text-[#7a3100]" />
                      {dashboard.nextWorkshop?.workshop.startsAt
                        ? format(dashboard.nextWorkshop.workshop.startsAt, "dd/MM/yyyy")
                        : "Fecha pendiente"}
                    </p>
                    <p className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-[#7a3100]" />
                      {dashboard.nextWorkshop?.workshop.startsAt
                        ? format(dashboard.nextWorkshop.workshop.startsAt, "HH:mm")
                        : "Hora pendiente"}
                    </p>
                    <p className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-[#7a3100]" />
                      {dashboard.nextWorkshop?.workshop.location ??
                        dashboard.nextWorkshop?.workshop.community?.name ??
                        "Lugar por confirmar"}
                    </p>
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    className="mt-7 min-h-[52px] w-full justify-between rounded-xl border-0 bg-[#f8eadc] px-6 text-base font-bold text-[#7a3100] hover:bg-[#f3dcc7]"
                  >
                    <Link href="/artesana/talleres">
                      Ver detalles del taller
                      <ChevronRight className="h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </article>
          </section>

          <section className="mt-8">
            <div className="mb-5 flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-[#b5245b]" />
              <h2 className="font-serif text-3xl font-bold text-[#8a3200]">Mis cursos</h2>
            </div>
            <div className="grid gap-8 xl:grid-cols-[1.45fr_0.95fr]">
              <div>
                <div className="mb-4 flex items-center justify-between border-b border-[#ecd0bd] pb-3">
                  <p className="font-ui text-base font-extrabold text-[#1b1c1a]">
                    En progreso
                  </p>
                  <div className="flex gap-2 text-[#a95511]">
                    <button className="grid h-9 w-9 place-items-center rounded-full bg-[#f8eadc]">
                      <ChevronRight className="h-4 w-4 rotate-180" />
                    </button>
                    <button className="grid h-9 w-9 place-items-center rounded-full bg-[#f8eadc]">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="grid gap-5 md:grid-cols-3">
                  {enrolled.length ? (
                    enrolled
                      .map(toDisplayCourse)
                      .slice(0, 3)
                      .map((course) => (
                        <CourseCard
                          key={course.id}
                          href={course.href}
                          title={course.title}
                          description={course.description}
                          image={course.image}
                          progress={course.progress}
                          meta={course.meta}
                        />
                      ))
                  ) : (
                    <div className="md:col-span-3">
                      <LearningEmptyState text="No tienes cursos asignados todavía." />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className="mb-4 border-b border-[#ecd0bd] pb-3 font-ui text-base font-extrabold text-[#1b1c1a]">
                  Disponibles para ti
                </p>
                <div className="grid gap-5 md:grid-cols-2">
                  {learning.availableCourses.length ? (
                    learning.availableCourses
                      .slice(0, 2)
                      .map((course) => (
                        <AvailableCourse
                          key={course.id}
                          title={course.title}
                          description={
                            course.description ??
                            "Curso disponible para continuar tu formación digital."
                          }
                          image={course.imageUrl}
                        />
                      ))
                  ) : (
                    <div className="md:col-span-2">
                      <LearningEmptyState text="No hay cursos disponibles por ahora." />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8 flex items-center justify-between rounded-[18px] border border-[#f3c1d3] bg-[#fff0f5] px-7 py-5 shadow-[0_18px_40px_rgba(181,36,91,0.08)]">
            <div className="flex items-center gap-5">
              <div className="relative hidden h-20 w-32 overflow-hidden rounded-full bg-white md:block">
                <Image
                  src="/images/brand/warmi-logo-transparent.png"
                  alt=""
                  fill
                  sizes="128px"
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="font-serif text-3xl font-bold text-[#b5245b]">
                  Aprende a tu ritmo, desde tu mundo.
                </h3>
                <p className="mt-1 text-base text-[#5b4a42]">
                  Cada paso que das, fortalece tu arte y tu historia.
                </p>
              </div>
            </div>
            <Button
              asChild
              className="hidden min-h-[58px] rounded-xl bg-[#b5245b] px-8 text-base font-extrabold text-white hover:bg-[#941747] md:inline-flex"
            >
              <Link href="/artesana/aprender">
                Explorar todos los cursos
                <ChevronRight className="h-5 w-5" />
              </Link>
            </Button>
          </section>
        </div>
      </main>
    </>
  );
}

type DisplayCourse = {
  id: string;
  href: string;
  title: string;
  description: string;
  image: string | null;
  progress: number;
  meta: string;
};

function toAvailableDisplayCourse(
  course: Awaited<
    ReturnType<LearningService["getLearningPage"]>
  >["availableCourses"][number]
): MobileLearningCourse {
  return {
    id: course.id,
    href: "/artesana/mensajes",
    title: course.title,
    image: course.imageUrl,
    progress: 0,
    meta: `${course.modulesCount} módulos · ${course.durationMin} min`
  };
}

function toDisplayCourse(
  course: Awaited<
    ReturnType<LearningService["getLearningPage"]>
  >["enrolledCourses"][number]
): DisplayCourse {
  return {
    id: course.id,
    href: course.href,
    title: course.title,
    description:
      course.description ?? "Continúa fortaleciendo tus herramientas digitales.",
    image: course.imageUrl,
    progress: course.progress,
    meta: `${course.modulesCount} módulos · ${
      course.lastAccessedAt
        ? `Último acceso ${format(course.lastAccessedAt, "dd/MM/yyyy")}`
        : `${course.durationMin} min`
    }`
  };
}

type WorkshopRegistration = NonNullable<
  Awaited<
    ReturnType<ArtisanDashboardService["getDashboard"]>
  >["workshops"]["upcoming"][number]
>;

function toDisplayWorkshop(registration: WorkshopRegistration) {
  const { workshop } = registration;
  const facilitator =
    workshop.facilitator.profile?.displayName ??
    workshop.facilitator.name ??
    "Facilitadora Warmi";

  return {
    title: workshop.title,
    date: workshop.startsAt ? format(workshop.startsAt, "dd/MM/yyyy") : "Fecha pendiente",
    time:
      workshop.startsAt && workshop.endsAt
        ? `${format(workshop.startsAt, "HH:mm")} - ${format(workshop.endsAt, "HH:mm")}`
        : "Horario pendiente",
    facilitator,
    image: null
  };
}

function MobileSectionLabel({
  title,
  className = "mt-6"
}: {
  title: string;
  className?: string;
}) {
  return (
    <div className={`${className} flex items-center gap-3`}>
      <h2 className="font-serif text-lg font-bold text-[#5a1d2f]">{title}</h2>
      <span className="h-px flex-1 bg-[#f1c6d5]" />
    </div>
  );
}


function MobileWorkshopStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-2 text-center">
      <p className="font-serif text-3xl font-bold text-[#7a1042]">{value}</p>
      <p className="mt-1 text-xs leading-tight text-[#5b4a42]">{label}</p>
    </div>
  );
}

function MobileWorkshopCard({
  workshop,
  completed = false
}: {
  workshop: {
    title: string;
    date: string;
    time: string;
    facilitator: string;
    image: string | null;
  };
  completed?: boolean;
}) {
  return (
    <article className="grid grid-cols-[122px_1fr] overflow-hidden rounded-2xl border border-[#f5d2dc] bg-white shadow-[0_12px_26px_rgba(122,16,66,0.08)]">
      <div className="relative min-h-[132px]">
        {workshop.image ? (
          <Image
            src={workshop.image}
            alt={workshop.title}
            fill
            sizes="122px"
            className="object-cover"
          />
        ) : (
          <LearningImagePlaceholder compact />
        )}
      </div>
      <div className="p-4">
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-bold ${
            completed ? "bg-[#eef8e9] text-[#3a8b44]" : "bg-[#ffe0ea] text-[#b5245b]"
          }`}
        >
          {completed ? "Completado" : "En vivo"}
        </span>
        <h3 className="mt-2 font-ui text-sm font-extrabold leading-tight text-[#1b1c1a]">
          {workshop.title}
        </h3>
        <div className="mt-3 space-y-1 text-xs text-[#5b4a42]">
          <p>{workshop.date}</p>
          <p>{workshop.time}</p>
          <p>Facilitadora: {workshop.facilitator}</p>
        </div>
        <Link
          href="/artesana/talleres"
          className="mt-3 inline-flex items-center rounded-lg border border-[#b5245b] px-4 py-2 text-xs font-bold text-[#b5245b]"
        >
          Ver detalles
          <ChevronRight className="ml-1 h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}

function CourseCard({
  href,
  image,
  title,
  description,
  progress,
  meta
}: Omit<DisplayCourse, "id">) {
  return (
    <Link
      href={href as Route}
      className="group overflow-hidden rounded-[18px] border border-[#ecd0bd] bg-white shadow-[0_16px_38px_rgba(122,49,0,0.08)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_26px_58px_rgba(122,49,0,0.13)]"
    >
      <div className="relative h-40">
        {image ? (
          <Image src={image} alt={title} fill sizes="320px" className="object-cover" />
        ) : (
          <LearningImagePlaceholder />
        )}
        <span className="absolute left-4 top-4 rounded-lg bg-[#c93772] px-3 py-1 font-ui text-xs font-extrabold text-white">
          En progreso
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-serif text-2xl font-bold text-[#1b1c1a]">{title}</h3>
        <p className="mt-3 text-sm text-[#5b4a42]">{meta}</p>
        <p className="mt-1 text-sm text-[#5b4a42]">{description}</p>
        <div className="mt-5 grid grid-cols-[1fr_auto] items-center gap-4">
          <Progress
            value={progress}
            className="h-3 rounded-full bg-[#f2e7de] [&>div]:rounded-full [&>div]:bg-[#b5245b]"
          />
          <span className="text-sm font-bold text-[#5b4a42]">{progress}%</span>
        </div>
        <span className="ml-auto mt-4 grid h-10 w-10 place-items-center rounded-full bg-[#f8eadc] text-[#a95511] transition-transform duration-300 group-hover:translate-x-1">
          <ChevronRight className="h-5 w-5" />
        </span>
      </div>
    </Link>
  );
}

function AvailableCourse({
  title,
  description,
  image
}: {
  title: string;
  description: string;
  image: string | null;
}) {
  return (
    <article className="group overflow-hidden rounded-[18px] border border-[#ecd0bd] bg-white shadow-[0_16px_38px_rgba(122,49,0,0.08)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_26px_58px_rgba(122,49,0,0.13)]">
      <div className="relative h-32">
        {image ? (
          <Image src={image} alt={title} fill sizes="260px" className="object-cover" />
        ) : (
          <LearningImagePlaceholder />
        )}
        <span className="absolute right-4 top-4 rounded-lg bg-[#f4c542] px-3 py-1 font-ui text-xs font-extrabold text-[#7a3100]">
          Nuevo
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-serif text-2xl font-bold text-[#1b1c1a]">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-[#5b4a42]">{description}</p>
        <span className="ml-auto mt-5 grid h-10 w-10 place-items-center rounded-full bg-[#f8eadc] text-[#a95511] transition-transform duration-300 group-hover:translate-x-1">
          <ChevronRight className="h-5 w-5" />
        </span>
      </div>
    </article>
  );
}

function MobileInlineEmpty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#f0c3cf] bg-white/80 p-4 text-sm font-semibold text-[#7a5b4a]">
      {text}
    </div>
  );
}

function LearningEmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-[18px] border border-dashed border-[#ecd0bd] bg-white p-8 text-center text-base font-semibold text-[#7a5b4a] shadow-[0_16px_38px_rgba(122,49,0,0.06)]">
      {text}
    </div>
  );
}

function LearningImagePlaceholder({ compact = false }: { compact?: boolean }) {
  return (
    <div className="grid h-full w-full place-items-center bg-[linear-gradient(135deg,#fff0d6,#ffe8ef,#e8fbfd)]">
      <div
        className={`grid place-items-center rounded-full bg-white/80 text-[#b5245b] shadow-sm ${
          compact ? "h-12 w-12" : "h-16 w-16"
        }`}
      >
        <BookOpen className={compact ? "h-6 w-6" : "h-8 w-8"} />
      </div>
    </div>
  );
}
