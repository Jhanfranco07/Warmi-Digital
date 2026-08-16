import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { format } from "date-fns";
import {
  Award,
  BookOpen,
  CalendarDays,
  Camera,
  ChevronRight,
  Gem,
  Megaphone,
  Palette,
  Pencil,
  PlayCircle,
  Search,
  Settings,
  Store
} from "lucide-react";

import { EmptyState } from "@/shared/components/feedback/empty-state";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
import { isSupportedImageUrl } from "@/shared/lib/image-url";
import { ArtisanDashboardService } from "@/shared/services/artisan-dashboard.service";
import { requireRole } from "@/shared/server/auth/helpers";

const textilePattern =
  "linear-gradient(45deg, rgba(241,122,42,0.12) 12.5%, transparent 12.5%, transparent 37.5%, rgba(181,36,91,0.12) 37.5%, rgba(181,36,91,0.12) 62.5%, transparent 62.5%, transparent 87.5%, rgba(47,98,163,0.12) 87.5%)";

export default async function ArtisanDashboardPage() {
  const session = await requireRole("ARTESANA");
  const data = await new ArtisanDashboardService().getDashboard(session.user.id);
  const profile = data.artisan?.profile;
  const craft = profile?.craftTypes[0]?.craftType.name ?? "Especialidad por registrar";
  const currentCourse = data.currentEnrollment?.course;
  const displayName = profile?.displayName ?? session.user.name ?? "artesana";
  const firstName = displayName.split(" ")[0] ?? "artesana";
  const avatarUrl = profile?.avatarUrl ?? null;
  const enrolledCourses = data.enrollments.slice(0, 3);

  return (
    <>
      <section className="relative overflow-hidden bg-[#fffaf6] px-5 pb-7 pt-6 lg:hidden">
        <div className="pointer-events-none absolute -right-16 top-6 h-40 w-40 rounded-full bg-[#ffe6ee]" />
        <div className="pointer-events-none absolute -right-6 top-10 h-36 w-36 opacity-80">
          <Image
            src="/images/brand/warmi-isotipo.png"
            alt=""
            fill
            sizes="144px"
            className="object-contain"
          />
        </div>

        <div className="relative">
          <h1 className="font-serif text-3xl font-bold leading-tight text-[#7a1042]">
            ¡Bienvenida, {firstName}!<span className="ml-1 text-[#c93772]">*</span>
          </h1>
          <p className="mt-1 text-xs text-[#5b4a42]">
            Aprende, emprende y transforma tu futuro.
          </p>

          <form className="mt-5 flex h-12 items-center rounded-full border border-[#f0b9ca] bg-white px-4 shadow-[0_10px_24px_rgba(181,36,91,0.08)]">
            <Search className="mr-3 h-5 w-5 text-[#b5245b]" />
            <input
              name="q"
              className="min-w-0 flex-1 bg-transparent text-sm text-[#7a1042] outline-none placeholder:text-[#9f6b7e]"
              placeholder="¿Qué quieres aprender hoy?"
            />
          </form>

          <MobileSectionTitle title="Continúa aprendiendo" />

          <Link
            href={
              currentCourse
                ? (`/artesana/aprender/${currentCourse.id}` as Route)
                : ("/artesana/aprender" as Route)
            }
            className="mt-3 grid grid-cols-[128px_1fr] overflow-hidden rounded-2xl border border-[#f0c3cf] bg-white shadow-[0_14px_30px_rgba(122,16,66,0.1)]"
          >
            <div className="relative min-h-[126px]">
              {isSupportedImageUrl(currentCourse?.imageUrl) ? (
                <Image
                  src={currentCourse.imageUrl}
                  alt={currentCourse.title}
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              ) : (
                <DashboardImagePlaceholder compact />
              )}
              <span className="absolute inset-0 bg-[#7a1042]/15" />
              <span className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-[#b5245b] shadow-lg">
                <PlayCircle className="h-8 w-8" />
              </span>
            </div>
            <div className="p-4">
              <p className="font-ui text-sm font-extrabold leading-tight text-[#1b1c1a]">
                {currentCourse?.title ?? "No tienes curso activo"}
              </p>
              <p className="mt-3 text-[11px] font-bold text-[#b5245b]">
                {data.generalProgress}% completado
              </p>
              <Progress
                value={data.generalProgress}
                className="mt-1.5 h-1.5 bg-[#f4dbe4] [&>div]:bg-[#b5245b]"
              />
              <span className="mt-3 inline-flex items-center rounded-lg bg-[#b5245b] px-4 py-2 text-[11px] font-bold text-white">
                Continúar curso
                <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </span>
            </div>
          </Link>

          <div className="mt-6 flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-[#5a1d2f]">
              Cursos recomendados para ti
            </h2>
            <Link href="/artesana/aprender" className="text-xs font-bold text-[#b5245b]">
              Ver todos
            </Link>
          </div>

          <div className="mt-3 space-y-3">
            {enrolledCourses.length ? (
              enrolledCourses.map((enrollment) => (
                <MobileCourse
                  key={enrollment.id}
                  href={`/artesana/aprender/${enrollment.course.id}`}
                  image={enrollment.course.imageUrl}
                  title={enrollment.course.title}
                  modules={`${enrollment.course.modules.length} módulos`}
                />
              ))
            ) : (
              <DashboardInlineEmpty text="No tienes cursos asignados todavía." />
            )}
          </div>

          <h2 className="mt-6 font-serif text-lg font-bold text-[#5a1d2f]">Categorías</h2>
          <div className="mt-3 grid grid-cols-5 gap-2">
            <MobileCategory icon={Palette} label="Tejido" />
            <MobileCategory icon={Gem} label="Bordado" />
            <MobileCategory icon={Store} label="Emprendimiento" />
            <MobileCategory icon={Megaphone} label="Marketing" />
            <MobileCategory icon={Camera} label="Fotografía" />
          </div>
        </div>
      </section>

      <div className="hidden min-h-screen bg-[#fffaf6] lg:block">
        <div className="mx-auto w-full max-w-[1760px] px-10 py-10 xl:px-14 2xl:px-20">
          <header className="flex items-start justify-between gap-6">
            <div>
              <h1 className="font-serif text-6xl font-bold leading-none text-[#101833] 2xl:text-7xl">
                Hola, {displayName}
                <span className="ml-3 text-4xl text-[#b5245b]">*</span>
              </h1>
              <p className="mt-4 text-lg leading-8 text-[#5b4a42]">
                Este es tu espacio para aprender, fortalecer tu historia y avanzar paso a
                paso.
              </p>
            </div>

            <button
              type="button"
              className="group flex items-center gap-3 rounded-full px-2 py-1 transition-colors hover:bg-[#fff0f5]"
              aria-label="Perfil de artesana"
            >
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
              <ChevronRight className="h-5 w-5 rotate-90 text-[#7a3100] transition-transform group-hover:translate-y-0.5" />
            </button>
          </header>

          <section className="mt-10 grid gap-8 xl:grid-cols-[1.45fr_0.95fr]">
            <article className="relative overflow-hidden rounded-[20px] border border-[#ecd0bd] bg-white p-8 shadow-[0_22px_58px_rgba(122,49,0,0.08)]">
              <div
                className="pointer-events-none absolute -right-8 top-16 h-80 w-48 opacity-70"
                style={{ backgroundImage: textilePattern, backgroundSize: "28px 28px" }}
              />
              <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
                <h2 className="font-serif text-3xl font-bold text-[#b5245b]">
                  Tu avance general
                </h2>
                <div className="flex flex-wrap gap-3">
                  <Badge className="rounded-xl bg-[#ffe8ef] px-5 py-2 text-[#b5245b] hover:bg-[#ffe8ef]">
                    {data.routeName}
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

              <div className="relative z-10 mt-8 grid items-center gap-9 xl:grid-cols-[250px_1fr]">
                <div
                  className="grid h-52 w-52 place-items-center rounded-full"
                  style={{
                    background: `conic-gradient(#b5245b 0 ${data.generalProgress}%, #f4c542 ${data.generalProgress}% 100%)`
                  }}
                >
                  <div className="grid h-40 w-40 place-items-center rounded-full bg-white text-center shadow-inner">
                    <div>
                      <p className="font-serif text-6xl font-bold text-[#1b1c1a]">
                        {data.generalProgress}%
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
                      <p className="mt-1 text-lg text-[#5b4a42]">{data.nextObjective}.</p>
                    </div>
                  </div>

                  <Progress
                    value={data.generalProgress}
                    className="mt-8 h-4 rounded-full bg-[#f2e7de] [&>div]:rounded-full [&>div]:bg-[#b5245b]"
                  />

                  {currentCourse ? (
                    <Button
                      asChild
                      size="lg"
                      className="mt-8 min-h-[58px] rounded-xl bg-[#b5245b] px-8 text-base font-extrabold text-white shadow-[0_14px_28px_rgba(181,36,91,0.22)] hover:bg-[#941747]"
                    >
                      <Link href={`/artesana/aprender/${currentCourse.id}` as Route}>
                        <BookOpen className="h-5 w-5" />
                        Continuar mi aprendizaje
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </div>
            </article>

            <article className="overflow-hidden rounded-[20px] border border-[#ecd0bd] bg-white shadow-[0_22px_58px_rgba(122,49,0,0.08)]">
              <header className="flex items-center justify-between border-b border-[#ecd0bd] bg-[#fff7e8] px-8 py-6">
                <h2 className="font-serif text-3xl font-bold text-[#a95511]">
                  Próximo taller
                </h2>
                <span className="text-4xl text-[#f0c8a6]">#</span>
              </header>

              <div className="grid gap-6 p-8 md:grid-cols-[190px_1fr]">
                <div className="relative aspect-square overflow-hidden rounded-[22px] bg-[#1f2d55]">
                  <DashboardImagePlaceholder />
                  <span className="absolute inset-0 bg-[#101833]/30" />
                </div>

                <div>
                  <h3 className="font-serif text-3xl font-bold leading-tight text-[#1b1c1a]">
                    {data.nextWorkshop?.workshop.title ?? "No tienes taller próximo"}
                  </h3>
                  <div className="mt-5 grid gap-3 text-base text-[#5b4a42]">
                    <p className="flex items-center gap-3">
                      <CalendarDays className="h-5 w-5 text-[#7a3100]" />
                      {data.nextWorkshop?.workshop.startsAt
                        ? format(data.nextWorkshop.workshop.startsAt, "dd/MM/yyyy")
                        : "Fecha pendiente"}
                    </p>
                    <p className="flex items-center gap-3">
                      <CalendarDays className="h-5 w-5 text-[#7a3100]" />
                      {data.nextWorkshop?.workshop.startsAt
                        ? format(data.nextWorkshop.workshop.startsAt, "HH:mm")
                        : "Hora pendiente"}
                    </p>
                    <p className="flex items-center gap-3">
                      <Store className="h-5 w-5 text-[#7a3100]" />
                      {data.nextWorkshop?.workshop.location ??
                        data.nextWorkshop?.workshop.community?.name ??
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

          <section className="mt-8 grid gap-4 xl:grid-cols-6">
            <DesktopQuickAccess
              href="/artesana/aprender"
              icon={BookOpen}
              title="Continuar curso"
              description="Sigue aprendiendo"
              color="bg-[#b5245b]"
            />
            <DesktopQuickAccess
              href="/artesana/talleres"
              icon={CalendarDays}
              title="Ver talleres"
              description="Explora y participa"
              color="bg-[#d7920c]"
            />
            <DesktopQuickAccess
              href="/artesana/mi-vitrina"
              icon={Store}
              title="Mi vitrina"
              description="Muestra tu trabajo"
              color="bg-[#1f2d55]"
            />
            <DesktopQuickAccess
              href="/artesana/convocatorias"
              icon={Megaphone}
              title="Convocatorias"
              description="Nuevas oportunidades"
              color="bg-[#c93772]"
            />
            <DesktopQuickAccess
              href="/artesana/mi-historia"
              icon={Pencil}
              title="Editar mi historia"
              description="Cuéntanos tu historia"
              color="bg-[#81328c]"
            />
            <DesktopQuickAccess
              href="/artesana/logros"
              icon={Settings}
              title="Mis logros"
              description="Revisa tus logros"
              color="bg-[#36785f]"
            />
          </section>

          <section className="mt-8 grid gap-8 xl:grid-cols-[1fr_1.05fr]">
            <DashboardBlock
              title="Convocatorias destacadas"
              icon={Megaphone}
              iconClassName="text-[#b5245b]"
              href="/artesana/convocatorias"
            >
              <div className="grid gap-4">
                {data.opportunities.length ? (
                  data.opportunities.map((item) => (
                    <DashboardRow
                      key={item.id}
                      title={item.title}
                      description={
                        item.endsAt
                          ? `Cierra el ${format(item.endsAt, "dd/MM/yyyy")}`
                          : "Fecha abierta"
                      }
                    />
                  ))
                ) : (
                  <EmptyState title="Sin convocatorias por ahora" />
                )}
              </div>
            </DashboardBlock>

            <DashboardBlock
              title="Logros recientes"
              icon={Award}
              iconClassName="text-[#d7920c]"
              href="/artesana/logros"
              patterned
            >
              <div className="grid gap-4">
                {data.recentBadges.length ? (
                  data.recentBadges
                    .slice(0, 2)
                    .map((item) => (
                      <AchievementRow
                        key={item.id}
                        title={item.badge.name}
                        description={item.reason ?? item.badge.description ?? ""}
                      />
                    ))
                ) : (
                  <EmptyState title="Aún no tienes logros registrados" />
                )}
              </div>
            </DashboardBlock>
          </section>
        </div>
      </div>
    </>
  );
}

function DesktopQuickAccess({
  href,
  icon: Icon,
  title,
  description,
  color
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <Link
      href={href as Route}
      className="group flex min-h-[98px] items-center gap-4 rounded-xl border border-[#ecd0bd] bg-white p-5 shadow-[0_14px_32px_rgba(122,49,0,0.06)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_22px_46px_rgba(122,49,0,0.12)]"
    >
      <span
        className={`${color} grid h-14 w-14 shrink-0 place-items-center rounded-xl text-white transition-transform duration-500 group-hover:scale-110`}
      >
        <Icon className="h-7 w-7" />
      </span>
      <span>
        <span className="block font-ui text-base font-extrabold text-[#1b1c1a]">
          {title}
        </span>
        <span className="mt-1 block text-sm text-[#5b4a42]">{description}</span>
      </span>
    </Link>
  );
}

function DashboardBlock({
  title,
  icon: Icon,
  iconClassName,
  href,
  patterned = false,
  children
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName: string;
  href: string;
  patterned?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-[20px] border border-[#ecd0bd] bg-white p-7 shadow-[0_22px_58px_rgba(122,49,0,0.08)]">
      {patterned ? (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 opacity-80"
          style={{ backgroundImage: textilePattern, backgroundSize: "26px 26px" }}
        />
      ) : null}
      <header className="relative z-10 mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Icon className={`h-8 w-8 ${iconClassName}`} />
          <h2 className="font-serif text-3xl font-bold text-[#8a3200]">{title}</h2>
        </div>
        <Link
          href={href as Route}
          className="inline-flex items-center gap-2 font-ui text-sm font-bold text-[#a95511] hover:text-[#7a3100]"
        >
          Ver todas <ChevronRight className="h-4 w-4" />
        </Link>
      </header>
      <div className="relative z-10">{children}</div>
    </section>
  );
}

function DashboardRow({ title, description }: { title: string; description: string }) {
  return (
    <article className="group grid grid-cols-[86px_1fr_auto] items-center gap-5 rounded-xl border border-[#ecd0bd] bg-white p-3 transition-all duration-300 hover:-translate-y-1 hover:bg-[#fffaf6] hover:shadow-[0_14px_30px_rgba(122,49,0,0.08)]">
      <div className="relative h-16 overflow-hidden rounded-md">
        <DashboardImagePlaceholder compact />
      </div>
      <div>
        <h3 className="font-ui text-base font-extrabold text-[#1b1c1a]">{title}</h3>
        <p className="mt-1 text-sm text-[#5b4a42]">{description}</p>
      </div>
      <span className="grid h-9 w-9 place-items-center rounded-full bg-[#f8eadc] text-[#a95511] transition-transform duration-300 group-hover:translate-x-1">
        <ChevronRight className="h-5 w-5" />
      </span>
    </article>
  );
}

function AchievementRow({ title, description }: { title: string; description: string }) {
  return (
    <article className="group grid grid-cols-[88px_1fr_auto] items-center gap-5 rounded-xl border border-[#ecd0bd] bg-white/90 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(122,49,0,0.08)]">
      <span className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-[#f7d064] to-[#d7920c] text-white shadow-[0_14px_28px_rgba(215,146,12,0.24)]">
        <Palette className="h-9 w-9" />
      </span>
      <div>
        <h3 className="font-ui text-lg font-extrabold text-[#1b1c1a]">{title}</h3>
        <p className="mt-1 text-sm text-[#5b4a42]">{description}</p>
      </div>
      <span className="grid h-9 w-9 place-items-center rounded-full bg-[#f8eadc] text-[#a95511] transition-transform duration-300 group-hover:translate-x-1">
        <ChevronRight className="h-5 w-5" />
      </span>
    </article>
  );
}

function MobileSectionTitle({ title }: { title: string }) {
  return (
    <div className="mt-6 flex items-center gap-3">
      <h2 className="font-serif text-lg font-bold text-[#5a1d2f]">{title}</h2>
      <span className="h-px flex-1 bg-[#f1c6d5]" />
    </div>
  );
}

function MobileCourse({
  href,
  image,
  title,
  modules
}: {
  href: string;
  image: string | null;
  title: string;
  modules: string;
}) {
  return (
    <Link
      href={href as Route}
      className="grid grid-cols-[86px_1fr_auto] items-center gap-3 rounded-xl border border-[#f5d2dc] bg-white p-2 shadow-[0_10px_22px_rgba(122,16,66,0.07)]"
    >
      <div className="relative h-16 overflow-hidden rounded-lg">
        {isSupportedImageUrl(image) ? (
          <Image src={image} alt={title} fill sizes="86px" className="object-cover" />
        ) : (
          <DashboardImagePlaceholder compact />
        )}
      </div>
      <div className="min-w-0">
        <p className="line-clamp-2 font-ui text-xs font-extrabold leading-tight text-[#1b1c1a]">
          {title}
        </p>
        <p className="mt-1 flex items-center gap-1 text-[10px] text-[#5b4a42]">
          <BookOpen className="h-3 w-3 text-[#b5245b]" />
          {modules}
        </p>
      </div>
      <span className="rounded-lg border border-[#b5245b] px-2.5 py-1.5 text-[10px] font-bold text-[#7a1042]">
        Ver curso
      </span>
    </Link>
  );
}

function DashboardInlineEmpty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#f0c3cf] bg-white/80 p-4 text-sm font-semibold text-[#7a5b4a]">
      {text}
    </div>
  );
}

function DashboardImagePlaceholder({ compact = false }: { compact?: boolean }) {
  return (
    <div className="grid h-full w-full place-items-center bg-[linear-gradient(135deg,#fff0d6,#ffe8ef,#e8fbfd)]">
      <div
        className={`grid place-items-center rounded-full bg-white/85 text-[#b5245b] shadow-sm ${
          compact ? "h-10 w-10" : "h-16 w-16"
        }`}
      >
        <BookOpen className={compact ? "h-5 w-5" : "h-8 w-8"} />
      </div>
    </div>
  );
}

function MobileCategory({
  icon: Icon,
  label
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      href="/artesana/aprender"
      className="flex min-h-[76px] flex-col items-center justify-center gap-2 rounded-xl bg-[#ffe4ec] px-1 text-center text-[#9d0f4f] shadow-[0_8px_18px_rgba(122,16,66,0.05)]"
    >
      <Icon className="h-6 w-6" />
      <span className="text-[9px] leading-tight">{label}</span>
    </Link>
  );
}
