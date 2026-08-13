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

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
import { ArtisanDashboardService } from "@/shared/services/artisan-dashboard.service";
import { LearningService } from "@/shared/services/learning.service";
import { requireRole } from "@/shared/server/auth/helpers";

const courseImages = [
  "/images/discover/aprende.png",
  "/images/discover/taller.png",
  "/images/discover/recursos.png",
  "/images/discover/emprende.png"
];

const availableCourses = [
  {
    title: "Fotografía para artesanas",
    description: "Comunica tu trabajo con imágenes que inspiran.",
    image: "/images/discover/emprende.png"
  },
  {
    title: "Organiza tu negocio",
    description: "Herramientas simples para gestionar tu emprendimiento.",
    image: "/images/learning/instituciones.png"
  }
];

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
    : 45;
  const completedModules = Math.max(1, Math.round((averageProgress / 100) * 5));
  const currentCourse = dashboard.currentEnrollment?.course;
  const profile = dashboard.artisan?.profile;
  const displayName = profile?.displayName ?? session.user.name ?? "Elena Mamani";
  const craft = profile?.craftTypes[0]?.craftType.name ?? "Tejido";

  return (
    <main className="min-h-screen bg-[#fffaf6] px-4 py-5 pb-24 md:px-8 lg:px-10 lg:py-10 xl:px-14 2xl:px-20">
      <div className="mx-auto w-full max-w-[1760px]">
        <header className="flex items-start justify-between gap-6">
          <div>
            <h1 className="font-serif text-5xl font-bold leading-none text-[#101833] xl:text-6xl 2xl:text-7xl">
              Hola, {displayName}
              <span className="ml-3 text-4xl text-[#b5245b]">❧</span>
            </h1>
            <p className="mt-4 text-lg leading-8 text-[#5b4a42]">
              Este es tu espacio para aprender, fortalecer tu historia y avanzar paso a
              paso.
            </p>
          </div>

          <div className="hidden items-center gap-3 xl:flex">
            <span className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-white shadow-[0_12px_28px_rgba(122,49,0,0.16)]">
              <Image
                src="/images/auth/artesana.png"
                alt={displayName}
                fill
                sizes="64px"
                className="object-cover"
              />
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
                  {profile?.community?.name ?? "Comunidad Qantu"}
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
              <span className="text-4xl text-[#f0c8a6]">✣</span>
            </header>
            <div className="grid gap-6 p-8 md:grid-cols-[190px_1fr]">
              <div className="relative aspect-square overflow-hidden rounded-[22px] bg-[#1f2d55]">
                <Image
                  src="/images/discover/taller.png"
                  alt="Taller de aprendizaje"
                  fill
                  sizes="190px"
                  className="object-cover opacity-90"
                />
                <span className="absolute inset-0 bg-[#101833]/30" />
              </div>
              <div>
                <h3 className="font-serif text-3xl font-bold leading-tight text-[#1b1c1a]">
                  {dashboard.nextWorkshop?.workshop.title ??
                    "Taller: contar la historia de una pieza"}
                </h3>
                <div className="mt-5 grid gap-3 text-base text-[#5b4a42]">
                  <p className="flex items-center gap-3">
                    <CalendarDays className="h-5 w-5 text-[#7a3100]" />
                    {dashboard.nextWorkshop?.workshop.startsAt
                      ? format(dashboard.nextWorkshop.workshop.startsAt, "dd/MM/yyyy")
                      : "15/08/2026"}
                  </p>
                  <p className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-[#7a3100]" />
                    {dashboard.nextWorkshop?.workshop.startsAt
                      ? format(dashboard.nextWorkshop.workshop.startsAt, "HH:mm")
                      : "22:00"}
                  </p>
                  <p className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-[#7a3100]" />
                    {dashboard.nextWorkshop?.workshop.location ?? "Centro comunal Qantu"}
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
                {(enrolled.length ? enrolled.map(toDisplayCourse) : fallbackCourses())
                  .slice(0, 3)
                  .map((course, index) => (
                    <CourseCard
                      key={course.id}
                      href={course.href}
                      title={course.title}
                      description={course.description}
                      image={courseImages[index % courseImages.length]}
                      progress={course.progress}
                      meta={course.meta}
                    />
                  ))}
              </div>
            </div>

            <div>
              <p className="mb-4 border-b border-[#ecd0bd] pb-3 font-ui text-base font-extrabold text-[#1b1c1a]">
                Disponibles para ti
              </p>
              <div className="grid gap-5 md:grid-cols-2">
                {availableCourses.map((course) => (
                  <AvailableCourse key={course.title} {...course} />
                ))}
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
  );
}

type DisplayCourse = {
  id: string;
  href: string;
  title: string;
  description: string;
  progress: number;
  meta: string;
};

function fallbackCourses(): DisplayCourse[] {
  return [
    {
      id: "semilla",
      href: "/artesana/aprender",
      title: "Semilla Digital",
      description: "Cuenta tu historia",
      progress: 60,
      meta: "Módulo 2 de 5"
    },
    {
      id: "tejido",
      href: "/artesana/aprender",
      title: "Tejido con identidad",
      description: "Técnicas básicas",
      progress: 25,
      meta: "Módulo 1 de 4"
    },
    {
      id: "diseno",
      href: "/artesana/aprender",
      title: "Diseño de piezas",
      description: "Decoración y significado",
      progress: 40,
      meta: "Módulo 3 de 5"
    }
  ];
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
    progress: course.progress,
    meta: `${course.modulesCount} módulos · ${
      course.lastAccessedAt
        ? `Último acceso ${format(course.lastAccessedAt, "dd/MM/yyyy")}`
        : `${course.durationMin} min`
    }`
  };
}

function CourseCard({
  href,
  image,
  title,
  description,
  progress,
  meta
}: Omit<DisplayCourse, "id"> & { image: string }) {
  return (
    <Link
      href={href as Route}
      className="group overflow-hidden rounded-[18px] border border-[#ecd0bd] bg-white shadow-[0_16px_38px_rgba(122,49,0,0.08)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_26px_58px_rgba(122,49,0,0.13)]"
    >
      <div className="relative h-40">
        <Image src={image} alt={title} fill sizes="320px" className="object-cover" />
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
  image: string;
}) {
  return (
    <article className="group overflow-hidden rounded-[18px] border border-[#ecd0bd] bg-white shadow-[0_16px_38px_rgba(122,49,0,0.08)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_26px_58px_rgba(122,49,0,0.13)]">
      <div className="relative h-32">
        <Image src={image} alt={title} fill sizes="260px" className="object-cover" />
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
