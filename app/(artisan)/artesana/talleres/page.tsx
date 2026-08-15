import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  MapPin,
  Users
} from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { ArtisanRepository } from "@/shared/repositories/artisan.repository";
import { WorkshopService } from "@/shared/services/workshop.service";
import { requireRole } from "@/shared/server/auth/helpers";

type WorkshopRegistration = Awaited<
  ReturnType<WorkshopService["getWorkshops"]>
>["upcoming"][number];

export default async function ArtisanWorkshopsPage() {
  const session = await requireRole("ARTESANA");
  const [{ upcoming, completed }, artisan] = await Promise.all([
    new WorkshopService().getWorkshops(session.user.id),
    new ArtisanRepository().findProfile(session.user.id)
  ]);

  const displayName =
    artisan?.profile?.displayName ?? session.user.name ?? "Artesana Warmi";
  const avatarUrl = artisan?.profile?.avatarUrl ?? null;
  const totalHours = completed.reduce((total, registration) => {
    const { startsAt, endsAt } = registration.workshop;
    if (!startsAt || !endsAt) return total;
    return (
      total + Math.max(1, Math.round((endsAt.getTime() - startsAt.getTime()) / 3600000))
    );
  }, 0);

  return (
    <main className="min-h-screen bg-[#fffaf6] px-4 py-5 pb-24 md:px-8 lg:px-10 lg:py-10 xl:px-14 2xl:px-20">
      <div className="mx-auto w-full max-w-[1760px]">
        <header className="flex items-start justify-between gap-6">
          <div>
            <h1 className="font-serif text-6xl font-bold leading-none text-[#101833] 2xl:text-7xl">
              Talleres <span className="text-4xl text-[#b5245b]">*</span>
            </h1>
            <p className="mt-4 max-w-4xl text-lg leading-8 text-[#5b4a42]">
              Descubre, participa y fortalece habilidades digitales simples para tus
              trámites, tu comunicación y tu vitrina cultural.
            </p>
          </div>

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

        <section className="mt-8 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <article className="rounded-[20px] border border-[#ecd0bd] bg-white p-8 shadow-[0_22px_58px_rgba(122,49,0,0.08)]">
            <h2 className="font-serif text-3xl font-bold text-[#b5245b]">
              Resumen de participación
            </h2>
            <div className="mt-12 grid gap-10 md:grid-cols-3">
              <SummaryStat
                icon={CalendarDays}
                label="Próximos talleres"
                value={upcoming.length}
                detail="Asignados a tu ruta"
                color="bg-[#ffe8ef] text-[#b5245b]"
              />
              <SummaryStat
                icon={CheckCircle2}
                label="Talleres completados"
                value={completed.length}
                detail="Con asistencia registrada"
                color="bg-[#fff0d6] text-[#d7920c]"
              />
              <SummaryStat
                icon={Users}
                label="Horas de aprendizaje"
                value={totalHours}
                detail="Calculadas desde talleres"
                color="bg-[#e8fbfd] text-[#159aa4]"
              />
            </div>
          </article>

          <article className="rounded-[20px] border border-[#ecd0bd] bg-white p-8 shadow-[0_22px_58px_rgba(122,49,0,0.08)]">
            <h2 className="font-serif text-3xl font-bold text-[#b5245b]">Calendario</h2>
            {upcoming.length ? (
              <div className="mt-6 grid gap-4">
                {upcoming.slice(0, 4).map((registration) => (
                  <CalendarRow key={registration.id} registration={registration} />
                ))}
              </div>
            ) : (
              <EmptyWorkshopState text="No tienes talleres próximos." />
            )}
          </article>
        </section>

        <section className="mt-8 grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
          <article className="rounded-[18px] border border-[#ecd0bd] bg-white p-5 shadow-[0_20px_50px_rgba(122,49,0,0.07)]">
            <header className="mb-5 flex items-center justify-between border-b border-[#ecd0bd] pb-4">
              <h2 className="font-serif text-3xl font-bold text-[#b5245b]">
                Próximos talleres
              </h2>
              <Link
                href="/artesana/aprender"
                className="font-ui text-sm font-bold text-[#b5245b]"
              >
                Volver a cursos <ChevronRight className="inline h-4 w-4" />
              </Link>
            </header>

            {upcoming.length ? (
              <div className="grid gap-4">
                {upcoming.map((registration) => (
                  <WorkshopRow key={registration.id} registration={registration} />
                ))}
              </div>
            ) : (
              <EmptyWorkshopState text="No tienes talleres próximos. Cuando una facilitadora te registre, aparecerán aquí." />
            )}
          </article>

          <article className="rounded-[18px] border border-[#ecd0bd] bg-white p-5 shadow-[0_20px_50px_rgba(122,49,0,0.07)]">
            <header className="mb-5 flex items-center justify-between border-b border-[#ecd0bd] pb-4">
              <h2 className="font-serif text-3xl font-bold text-[#b5245b]">
                Talleres completados
              </h2>
              <span className="font-ui text-sm font-bold text-[#7a5b4a]">
                {completed.length} registrados
              </span>
            </header>

            {completed.length ? (
              <div className="grid gap-4">
                {completed.map((registration) => (
                  <CompletedRow key={registration.id} registration={registration} />
                ))}
              </div>
            ) : (
              <EmptyWorkshopState text="Aún no tienes talleres completados." />
            )}
          </article>
        </section>

        <section className="mt-8 rounded-[14px] border border-[#d7d0f4] bg-[#f2efff] px-7 py-5 shadow-[0_18px_40px_rgba(98,82,183,0.08)]">
          <h3 className="font-ui text-lg font-extrabold text-[#6252b7]">
            Aprende a tu ritmo, conecta con otras artesanas y fortalece tu talento.
          </h3>
          <p className="mt-1 text-base text-[#5b4a42]">
            Los talleres registrados por tu facilitadora aparecerán en esta sección.
          </p>
        </section>
      </div>
    </main>
  );
}

function SummaryStat({
  icon: Icon,
  label,
  value,
  detail,
  color
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  detail: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-5">
      <span className={`grid h-16 w-16 place-items-center rounded-full ${color}`}>
        <Icon className="h-8 w-8" />
      </span>
      <div>
        <p className="font-ui text-sm font-bold text-[#1b1c1a]">{label}</p>
        <p className="font-serif text-5xl font-bold text-[#1b1c1a]">{value}</p>
        <p className="text-sm text-[#5b4a42]">{detail}</p>
      </div>
    </div>
  );
}

function CalendarRow({ registration }: { registration: WorkshopRegistration }) {
  const { workshop } = registration;
  return (
    <div className="grid grid-cols-[64px_1fr_auto] items-center gap-4 border-b border-[#f1ddcf] py-3 last:border-0">
      <WorkshopDate startsAt={workshop.startsAt} />
      <div>
        <p className="font-ui text-sm font-extrabold text-[#1b1c1a]">{workshop.title}</p>
        <p className="mt-1 text-sm text-[#5b4a42]">{formatWorkshopTime(workshop)}</p>
      </div>
      <Badge className="bg-[#fff0d6] text-[#a95511] hover:bg-[#fff0d6]">
        {registration.status}
      </Badge>
    </div>
  );
}

function WorkshopRow({ registration }: { registration: WorkshopRegistration }) {
  const { workshop } = registration;
  const facilitator =
    workshop.facilitator.profile?.displayName ??
    workshop.facilitator.name ??
    "Facilitadora Warmi";

  return (
    <article className="grid gap-5 rounded-xl border border-[#ecd0bd] p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(122,49,0,0.08)] md:grid-cols-[110px_1fr_auto]">
      <WorkshopDate startsAt={workshop.startsAt} large />
      <div>
        <Badge className="mb-3 bg-[#ffe8ef] text-[#b5245b] hover:bg-[#ffe8ef]">
          Próximo
        </Badge>
        <h3 className="font-serif text-2xl font-bold text-[#b5245b]">{workshop.title}</h3>
        <p className="mt-2 text-sm leading-6 text-[#5b4a42]">
          {workshop.description ?? "Taller registrado en tu ruta de aprendizaje."}
        </p>
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-[#5b4a42]">
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {formatWorkshopTime(workshop)}
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {workshop.location ?? workshop.community?.name ?? "Lugar por confirmar"}
          </span>
          <span className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Facilitadora: {facilitator}
          </span>
        </div>
      </div>
      <Button
        variant="outline"
        className="self-center rounded-lg border-[#ecd0bd] text-[#b5245b]"
        disabled
      >
        Detalle no habilitado
      </Button>
    </article>
  );
}

function CompletedRow({ registration }: { registration: WorkshopRegistration }) {
  const { workshop } = registration;
  return (
    <article className="grid gap-5 rounded-xl border border-[#ecd0bd] p-4 md:grid-cols-[110px_1fr_auto]">
      <WorkshopDate startsAt={workshop.startsAt} large />
      <div>
        <Badge className="mb-3 bg-[#eef8e9] text-[#36785f] hover:bg-[#eef8e9]">
          Completado
        </Badge>
        <h3 className="font-serif text-2xl font-bold text-[#1b1c1a]">{workshop.title}</h3>
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-[#5b4a42]">
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {formatWorkshopTime(workshop)}
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {workshop.location ?? workshop.community?.name ?? "Lugar registrado"}
          </span>
        </div>
      </div>
      <p className="self-center text-sm font-bold text-[#36785f]">
        Asistencia registrada
      </p>
    </article>
  );
}

function WorkshopDate({
  startsAt,
  large = false
}: {
  startsAt: Date | null;
  large?: boolean;
}) {
  return (
    <div
      className={`grid place-items-center rounded-xl bg-[#fff5e8] text-center text-[#7a3100] ${
        large ? "h-24 w-24" : "h-16 w-16"
      }`}
    >
      <span className="font-serif text-3xl font-bold">
        {startsAt ? format(startsAt, "dd") : "--"}
      </span>
      <span className="text-xs font-bold uppercase">
        {startsAt ? format(startsAt, "MMM") : "TAL"}
      </span>
    </div>
  );
}

function formatWorkshopTime(workshop: WorkshopRegistration["workshop"]) {
  if (!workshop.startsAt) return "Horario pendiente";
  if (!workshop.endsAt) return format(workshop.startsAt, "HH:mm");
  return `${format(workshop.startsAt, "HH:mm")} - ${format(workshop.endsAt, "HH:mm")}`;
}

function EmptyWorkshopState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-[#ecd0bd] bg-[#fffaf6] p-8 text-center text-base font-semibold text-[#7a5b4a]">
      {text}
    </div>
  );
}
